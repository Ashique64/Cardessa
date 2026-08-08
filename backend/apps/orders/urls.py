from django.urls import path
from .views import (
    PlanListView, OrderCreateView, OrderVerifyView,
    PaymentWebhookView, UserHasPlanView, AdminOrderListView, AdminStatsView
)

urlpatterns = [
    path("plans/", PlanListView.as_view(), name="plan-list"),
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("verify/", OrderVerifyView.as_view(), name="order-verify"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("check-plan/", UserHasPlanView.as_view(), name="check-plan"),
    path("admin/", AdminOrderListView.as_view(), name="admin-orders"),
    path("admin-stats/", AdminStatsView.as_view(), name="admin-stats"),
]
