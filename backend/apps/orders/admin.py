from django.contrib import admin
from .models import Plan, Order


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price_inr", "billing_type", "max_invitations", "is_active", "sort_order")
    list_filter = ("billing_type", "is_active")
    ordering = ("sort_order",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("razorpay_order_id", "user", "plan", "amount_inr", "status", "created_at")
    list_filter = ("status", "plan")
    search_fields = ("razorpay_order_id", "user__email")
    ordering = ("-created_at",)
    readonly_fields = ("razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "created_at", "updated_at")
