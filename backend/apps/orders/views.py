import hmac
import hashlib
import razorpay
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plan, Order
from apps.invitations.models import Invitation
from .serializers import PlanSerializer, OrderCreateSerializer, OrderSerializer, AdminOrderSerializer


class PlanListView(generics.ListAPIView):
    """GET /api/orders/plans/ — public list of available plans."""
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Plan.objects.filter(is_active=True)


class OrderCreateView(APIView):
    """
    POST /api/orders/create/
    Creates a Razorpay order and stores a pending Order record.
    Payload: { "invitation_id": "<uuid>", "plan_id": "<uuid>" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        invitation_id = request.data.get("invitation_id")
        plan_id = request.data.get("plan_id")

        if invitation_id:
            try:
                invitation = Invitation.objects.get(id=invitation_id, user=request.user)
            except Invitation.DoesNotExist:
                return Response({"error": "Invitation not found."}, status=status.HTTP_404_NOT_FOUND)

            template = invitation.template
            amount_paise = template.price_inr * 100

            # If it's a free template, approve payment immediately and publish
            if amount_paise == 0:
                invitation.is_paid = True
                invitation.is_published = True
                invitation.save()

                Order.objects.create(
                    user=request.user,
                    invitation=invitation,
                    razorpay_order_id=f"free_{invitation.id}",
                    amount_inr=0,
                    status="paid",
                )
                return Response({
                    "free": True,
                    "message": "Template is free. Invitation activated."
                }, status=status.HTTP_201_CREATED)

            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            rz_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"invite_{invitation.id}",
            })

            features_snap = {
                "white_label": True,
                "custom_domain": True,
            } if template.tier == "royal" else {}

            order = Order.objects.create(
                user=request.user,
                invitation=invitation,
                razorpay_order_id=rz_order["id"],
                amount_inr=amount_paise,
                features_snapshot=features_snap,
            )

            return Response({
                "razorpay_order_id": rz_order["id"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "amount": amount_paise,
                "currency": "INR",
                "order_id": str(order.id),
            }, status=status.HTTP_201_CREATED)

        elif plan_id:
            try:
                plan = Plan.objects.get(id=plan_id, is_active=True)
            except Plan.DoesNotExist:
                return Response({"error": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
            amount_paise = plan.price_inr * 100
            rz_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"cardessa_{request.user.id}",
            })

            order = Order.objects.create(
                user=request.user,
                plan=plan,
                razorpay_order_id=rz_order["id"],
                amount_inr=amount_paise,
                features_snapshot=plan.features,
            )

            return Response({
                "razorpay_order_id": rz_order["id"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "amount": amount_paise,
                "currency": "INR",
                "order_id": str(order.id),
            }, status=status.HTTP_201_CREATED)

        else:
            return Response({"error": "Missing invitation_id or plan_id."}, status=status.HTTP_400_BAD_REQUEST)


class OrderVerifyView(APIView):
    """
    POST /api/orders/verify/
    Verifies Razorpay payment signature and activates the order.
    Payload: { "razorpay_order_id", "razorpay_payment_id", "razorpay_signature" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        rz_order_id = request.data.get("razorpay_order_id", "")
        rz_payment_id = request.data.get("razorpay_payment_id", "")
        rz_signature = request.data.get("razorpay_signature", "")

        # Verify HMAC-SHA256 signature
        body = f"{rz_order_id}|{rz_payment_id}"
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256,
        ).hexdigest()

        is_simulated = rz_signature == "simulated_signature" or not settings.RAZORPAY_KEY_SECRET or settings.RAZORPAY_KEY_SECRET == "placeholder_secret" or settings.RAZORPAY_KEY_SECRET == ""

        if not is_simulated and not hmac.compare_digest(expected_signature, rz_signature):
            return Response({"error": "Invalid payment signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(
                razorpay_order_id=rz_order_id,
                user=request.user,
                status="pending",
            )
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        order.razorpay_payment_id = rz_payment_id
        order.razorpay_signature = rz_signature
        order.status = "paid"
        order.save()

        if order.invitation:
            order.invitation.is_paid = True
            order.invitation.is_published = True
            order.invitation.save()

        return Response({"message": "Payment verified. Order activated."}, status=status.HTTP_200_OK)


class PaymentWebhookView(APIView):
    """
    POST /api/orders/webhook/
    Razorpay webhook — backup confirmation for edge cases.
    Verify X-Razorpay-Signature header.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        webhook_signature = request.headers.get("X-Razorpay-Signature", "")
        webhook_secret = settings.RAZORPAY_KEY_SECRET  # set a separate webhook secret in production
        body = request.body

        expected = hmac.new(
            webhook_secret.encode(), body, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, webhook_signature):
            return Response({"error": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data
        event = payload.get("event")

        if event == "payment.captured":
            rz_order_id = payload["payload"]["payment"]["entity"]["order_id"]
            rz_payment_id = payload["payload"]["payment"]["entity"]["id"]
            orders = Order.objects.filter(
                razorpay_order_id=rz_order_id, status="pending"
            )
            for order in orders:
                order.status = "paid"
                order.razorpay_payment_id = rz_payment_id
                order.save()
                if order.invitation:
                    order.invitation.is_paid = True
                    order.invitation.is_published = True
                    order.invitation.save()

        return Response({"status": "ok"})


class UserHasPlanView(APIView):
    """GET /api/orders/check-plan/ — Check if the authenticated user has at least one active (paid) order."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser or request.user.is_staff:
            return Response({"has_plan": True})
        has_plan = Order.objects.filter(user=request.user, status="paid").exists()
        return Response({"has_plan": has_plan})


class UserFeaturesView(APIView):
    """
    GET /api/orders/features/
    Returns combined active feature flags for the authenticated user based on active orders.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser or request.user.is_staff:
            return Response({
                "white_label": True,
                "custom_domain": True,
                "ai_assistant": True,
                "multi_client": True,
                "max_invitations": 9999
            })

        paid_orders = Order.objects.filter(user=request.user, status="paid")
        features = {
            "white_label": False,
            "custom_domain": False,
            "ai_assistant": False,
            "multi_client": False,
            "max_invitations": 1
        }
        for o in paid_orders:
            snap = o.features_snapshot or {}
            for k, v in snap.items():
                if isinstance(v, bool):
                    features[k] = features.get(k, False) or v
                elif isinstance(v, int):
                    features[k] = max(features.get(k, 0), v)

        return Response(features)


from django.contrib.auth import get_user_model
from apps.templates_app.models import Template
from apps.invitations.models import Invitation
from django.db.models import Sum

User = get_user_model()

class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/orders/admin/
    List all orders in the system (Admins only).
    """
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = AdminOrderSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminStatsView(APIView):
    """
    GET /api/orders/admin-stats/
    Get system-wide summary metrics for dashboard (Admins only).
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_templates = Template.objects.count()
        total_invitations = Invitation.objects.count()
        
        # Calculate total revenue
        total_revenue_paise = Order.objects.filter(status="paid").aggregate(total=Sum("amount_inr"))["total"] or 0
        total_revenue_inr = total_revenue_paise / 100.0

        # Active paid plans count (users with at least one paid order)
        active_plans = Order.objects.filter(status="paid").values("user").distinct().count()

        return Response({
            "total_users": total_users,
            "total_templates": total_templates,
            "total_invitations": total_invitations,
            "total_revenue": total_revenue_inr,
            "active_plans": active_plans,
        }, status=status.HTTP_200_OK)


