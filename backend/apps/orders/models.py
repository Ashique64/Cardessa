import uuid
from django.db import models
from django.conf import settings


class Plan(models.Model):
    BILLING_CHOICES = [
        ("one_time", "One-time"),
        ("yearly", "Yearly"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)          # Standard, Premium, Planner
    price_inr = models.PositiveIntegerField()         # in rupees e.g. 1299
    billing_type = models.CharField(max_length=20, choices=BILLING_CHOICES)
    max_invitations = models.PositiveIntegerField(default=1)
    # Feature flags: {"ai_text_writer": true, "custom_subdomain": true, ...}
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "plans"
        ordering = ["sort_order"]
        verbose_name = "Plan"
        verbose_name_plural = "Plans"

    def __str__(self):
        return f"{self.name} — ₹{self.price_inr}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="orders", null=True, blank=True)
    invitation = models.ForeignKey(
        "invitations.Invitation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    # Razorpay IDs
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    amount_inr = models.PositiveIntegerField()     # in paise (multiply rupees × 100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    # Entitlement flags inherited from plan at time of purchase (denormalized for safety)
    features_snapshot = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.razorpay_order_id} — {self.status}"
