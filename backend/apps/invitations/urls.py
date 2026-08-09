from django.urls import path
from .views import (
    InvitationListCreateView,
    InvitationDetailView,
    RSVPCreateView,
    InvitationRSVPListView,
    ResolveCustomDomainView,
    AICopyGeneratorView,
)

urlpatterns = [
    path("", InvitationListCreateView.as_view(), name="invitation-list-create"),
    path("resolve-domain/", ResolveCustomDomainView.as_view(), name="resolve-domain"),
    path("ai-write/", AICopyGeneratorView.as_view(), name="ai-write"),
    path("<slug:slug>/", InvitationDetailView.as_view(), name="invitation-detail"),
    path("<slug:slug>/rsvp/", RSVPCreateView.as_view(), name="rsvp-create"),
    path("<slug:slug>/rsvps/", InvitationRSVPListView.as_view(), name="invitation-rsvps"),
]


