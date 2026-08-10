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
        template = serializer.validated_data.get("template")
        content = serializer.validated_data.get("content")
        if (not content or content == {}) and template:
            serializer.validated_data["content"] = template.demo_content or {}
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


class InvitationRSVPListView(generics.ListCreateAPIView):
    """
    GET  /api/invitations/<slug>/rsvps/ — List guest responses for owner's invitation.
    POST /api/invitations/<slug>/rsvps/ — Manually add a guest offline (owner only).
    """
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        try:
            invitation = Invitation.objects.get(slug=slug, user=self.request.user)
        except Invitation.DoesNotExist:
            raise NotFound("Invitation not found or you are not the owner.")
        
        qs = invitation.rsvps.all()
        
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(guest_name__icontains=search)
            
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
            
        return qs

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        try:
            invitation = Invitation.objects.get(slug=slug, user=self.request.user)
        except Invitation.DoesNotExist:
            raise NotFound("Invitation not found or you are not the owner.")
        serializer.save(invitation=invitation)


class ResolveCustomDomainView(generics.RetrieveAPIView):
    """
    GET /api/invitations/resolve-domain/?domain=<domain>
    Public endpoint to retrieve invitation details based on custom domain or custom subdomain.
    """
    serializer_class = InvitationPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        domain = self.request.query_params.get("domain", "").strip().lower()
        if not domain:
            raise NotFound("Missing domain parameter.")

        # 1. Direct lookup by custom_domain (e.g., invite.couple.com)
        try:
            return Invitation.objects.get(custom_domain=domain, is_published=True)
        except Invitation.DoesNotExist:
            pass

        # 2. Lookup by custom_subdomain (e.g., rahul-priya.cardessa.in or rahul-priya.localhost)
        subdomain = domain
        for suffix in [".cardessa.in", ".localhost", "localhost"]:
            if domain.endswith(suffix):
                subdomain = domain[:-len(suffix)].rstrip(".")
                break

        try:
            return Invitation.objects.get(custom_subdomain=subdomain, is_published=True)
        except Invitation.DoesNotExist:
            raise NotFound(f"No invitation found for domain '{domain}'.")


from rest_framework.views import APIView

class AICopyGeneratorView(APIView):
    """
    POST /api/invitations/ai-write/
    Generates 3 variations of invitation copy templates based on tone, couple names, and key details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.orders.models import Order
        is_admin = request.user.is_superuser or request.user.is_staff
        has_ai = Order.objects.filter(
            user=request.user,
            status="paid",
            features_snapshot__ai_assistant=True
        ).exists()

        if not is_admin and not has_ai:
            return Response(
                {"error": "AI Assistant is only available on premium subscription tiers."},
                status=status.HTTP_403_FORBIDDEN
            )

        tone = request.data.get("tone", "romantic").lower()
        groom = request.data.get("groom_name", "Groom").strip()
        bride = request.data.get("bride_name", "Bride").strip()
        details = request.data.get("details", "").strip()

        if tone == "formal":
            v1 = f"Together with their families, {groom} and {bride} request the honor of your presence as they exchange wedding vows. Join us to celebrate their union at {details or 'the ceremony'}."
            v2 = f"Mr. & Mrs. request the pleasure of your company at the marriage ceremony of their beloved children {bride} and {groom}. Your presence is highly appreciated at {details or 'the auspicious occasion'}."
            v3 = f"We invite you to share in our joy and support us as we, {groom} and {bride}, begin our life journey together. The wedding ceremony will be held at {details or 'the venue'}."
        elif tone == "romantic":
            v1 = f"Two hearts, one love, a lifetime to share. {groom} & {bride} invite you to witness the beginning of their happily ever after. Let's celebrate our love story at {details or 'our wedding'}."
            v2 = f"Once in a while, in the middle of an ordinary life, love gives us a fairy tale. Join us as {bride} and {groom} say 'I do' and walk hand-in-hand into forever at {details or 'our celebration'}."
            v3 = f"Love has brought us together, and we want to celebrate this beautiful blessing with our nearest and dearest. Come celebrate {groom} and {bride}'s big day at {details or 'the wedding site'}."
        elif tone == "religious":
            v1 = f"By the grace of the Almighty, we invite you to bless the holy union of {groom} and {bride} as they bind their souls in marriage. May your blessings guide them at {details or 'the holy union'}."
            v2 = f"With divine blessings, {bride} & {groom} start their blessed journey of marital bliss. We request your presence and prayers on this sacred day at {details or 'the ceremony'}."
            v3 = f"Love is a gift of the Divine. We invite you to join us in prayer and celebration as {groom} & {bride} are united in holy matrimony at {details or 'the wedding sanctuary'}."
        else:
            v1 = f"No rules, no stress, just love and celebration! {groom} and {bride} are getting married, and we want you there. Join the party at {details or 'the venue'}!"
            v2 = f"We're making it official! {bride} & {groom} are tying the knot. Grab your dancing shoes and join us for an unforgettable celebration at {details or 'our wedding day'}."
            v3 = f"Finally! {groom} & {bride} are getting hitched. Come for the love, stay for the food and drinks. Celebrations kick off at {details or 'the venue'}."

        return Response({
            "variations": [v1, v2, v3]
        }, status=status.HTTP_200_OK)




