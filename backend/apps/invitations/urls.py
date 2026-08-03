from django.urls import path
from .views import (
    InvitationListCreateView,
    InvitationDetailView,
)

urlpatterns = [
    path("", InvitationListCreateView.as_view(), name="invitation-list-create"),
    path("<slug:slug>/", InvitationDetailView.as_view(), name="invitation-detail"),
]


