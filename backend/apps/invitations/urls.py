from django.urls import path
from .views import (
    InvitationListCreateView,
    InvitationDetailView,
    RSVPCreateView,
    InvitationRSVPListView,
)

urlpatterns = [
    path("", InvitationListCreateView.as_view(), name="invitation-list-create"),
    path("<slug:slug>/", InvitationDetailView.as_view(), name="invitation-detail"),
    path("<slug:slug>/rsvp/", RSVPCreateView.as_view(), name="rsvp-create"),
    path("<slug:slug>/rsvps/", InvitationRSVPListView.as_view(), name="invitation-rsvps"),
]


