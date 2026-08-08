from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from .models import Invitation, RSVP
from .serializers import InvitationSerializer, InvitationPublicSerializer, RSVPSerializer


class InvitationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/invitations/  — list the authenticated user's invitations
    POST /api/invitations/  — create a new invitation
    """
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invitation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InvitationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/invitations/<slug>/  — retrieves full config if owner; returns public guest config if published and not owner.
    PATCH  /api/invitations/<slug>/  — updates invitation config (owner only).
    DELETE /api/invitations/<slug>/  — deletes invitation (owner only).
    """
    queryset = Invitation.objects.all()
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        slug = self.kwargs.get("slug")
        try:
            invitation = Invitation.objects.get(slug=slug)
        except Invitation.DoesNotExist:
            return InvitationSerializer

        # If user is authenticated and is the owner, return full serializer
        if self.request.user.is_authenticated and invitation.user == self.request.user:
            return InvitationSerializer
        
        # Default/Guest view
        return InvitationPublicSerializer

    def get_object(self):
        slug = self.kwargs.get("slug")
        try:
            invitation = Invitation.objects.get(slug=slug)
        except Invitation.DoesNotExist:
            raise NotFound("Invitation not found.")

        # Check permissions for GET
        if self.request.method == "GET":
            # If owner, return
            if self.request.user.is_authenticated and invitation.user == self.request.user:
                return invitation
            # If not owner, must be published
            if invitation.is_published:
                return invitation
            raise PermissionDenied("This invitation is not published yet.")
        
        # Check permissions for PATCH/DELETE
        if invitation.user != self.request.user:
            raise PermissionDenied("You are not the owner of this invitation.")
        
        return invitation


class RSVPCreateView(generics.CreateAPIView):
    """
    POST /api/invitations/<slug>/rsvp/
    Public endpoint to let guests RSVP to an invitation.
    """
    serializer_class = RSVPSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        try:
            invitation = Invitation.objects.get(slug=slug)
        except Invitation.DoesNotExist:
            raise NotFound("Invitation not found.")
        serializer.save(invitation=invitation)



