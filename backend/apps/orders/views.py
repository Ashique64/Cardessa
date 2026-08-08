import hmac
import hashlib
import razorpay
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Plan, Order
from .serializers import PlanSerializer, OrderCreateSerializer, OrderSerializer


class PlanListView(generics.ListAPIView):
    """GET /api/orders/plans/ — public list of available plans."""
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Plan.objects.filter(is_active=True)


class OrderCreateView(APIView):
    """
    POST /api/orders/create/
    Creates a Razorpay order and stores a pending Order record.
    Payload: { "plan_id": "<uuid>" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        # Razorpay expects amount in paise (rupees × 100)
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

        if not hmac.compare_digest(expected_signature, rz_signature):
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
            Order.objects.filter(
                razorpay_order_id=rz_order_id, status="pending"
            ).update(status="paid", razorpay_payment_id=rz_payment_id)

        return Response({"status": "ok"})


class UserHasPlanView(APIView):
    """GET /api/orders/check-plan/ — Check if the authenticated user has at least one active (paid) order."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser or request.user.is_staff:
            return Response({"has_plan": True})
        has_plan = Order.objects.filter(user=request.user, status="paid").exists()
        return Response({"has_plan": has_plan})

