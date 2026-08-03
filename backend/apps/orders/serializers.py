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
