from rest_framework import serializers
from .models import Plan, Order


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "name", "price_inr", "billing_type", "max_invitations", "features", "sort_order"]


class OrderCreateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()


class OrderSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "plan", "razorpay_order_id", "amount_inr",
            "status", "features_snapshot", "created_at",
        ]
        read_only_fields = fields


class AdminOrderSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "user_email", "plan_name", "razorpay_order_id", "razorpay_payment_id",
            "amount_inr", "status", "created_at"
        ]
        read_only_fields = fields

    def get_plan_name(self, obj):
        if obj.plan:
            return obj.plan.name
        if obj.invitation and obj.invitation.template:
            return f"Template: {obj.invitation.template.name}"
        return "Custom Invitation"

