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
    Generates 3 variations of invitation copy based on tone, couple names, details,
    and the target_field being filled (our_story, welcome_note, attribution_heading, attribution_names).
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
        target_field = request.data.get("target_field", "welcome_note").strip()

        variations = []

        # ── OUR STORY ─────────────────────────────────────────────────────────
        if target_field == "our_story":
            context = details or "a chance encounter that blossomed into love"
            if tone == "romantic":
                variations = [
                    f"It started as a simple hello — and grew into a forever. {groom} and {bride} met through {context}, and from that very moment, something magical began to unfold. Through laughter, adventures, and quiet moments, they found in each other a home. Today, they invite you to celebrate the love story that changed everything.",
                    f"Some love stories are written in the stars. {bride} and {groom} found each other in the most unexpected way — {context} — and since then, every day has felt like a page from a fairy tale. Their journey is one of patience, tenderness, and boundless joy, and now they are ready to begin the most beautiful chapter yet.",
                    f"They say love finds you when you least expect it. For {groom} and {bride}, it found them through {context}. What started as a spark quickly became an unquenchable flame — full of warmth, laughter, and an unspoken promise to always choose each other. This is their story, and it's just getting started.",
                ]
            elif tone == "formal":
                variations = [
                    f"{groom} and {bride} first crossed paths through {context}. Their relationship grew steadily from mutual respect and admiration into a deep and enduring love. Over time, they discovered in one another a partner, a confidant, and a companion for life. They now look forward to embarking on this new chapter together.",
                    f"The bond between {bride} and {groom} began with {context}. United by shared values, a profound understanding, and a genuine affection for one another, they have built a relationship grounded in trust and commitment. It is with great joy that they now prepare to celebrate their union.",
                    f"{groom} and {bride}'s relationship traces its roots to {context}. Through the passage of time, their connection deepened into a partnership built on loyalty, respect, and heartfelt devotion — a love that is both steadfast and sincere.",
                ]
            elif tone == "religious":
                variations = [
                    f"By the grace of the Almighty, {groom} and {bride} were brought together through {context}. Their love has been a divine blessing — a journey of faith, trust, and devotion to one another and to God. They believe it was written in the heavens that their paths would meet, and with grateful hearts, they now walk toward a sacred union.",
                    f"Allah/God's plan is perfect, and in His wisdom, {bride} and {groom} found each other through {context}. Their love is rooted in faith and nurtured by prayer. Every milestone in their journey has been a testament to His mercy and grace. They invite you to share in this blessed union.",
                    f"Through {context}, {groom} and {bride} were united — not by chance, but by Divine will. Their bond is one of spiritual companionship, mutual encouragement in faith, and love that honors the Creator. They are humbled and grateful for this sacred gift.",
                ]
            else:  # modern
                variations = [
                    f"Plot twist: {groom} and {bride} actually met through {context} — and honestly, we couldn't be happier it happened. What started as something casual turned into something neither of them saw coming: real, genuine, head-over-heels love. They laughed, they adventured, they grew — and now they're making it official. Come celebrate with them!",
                    f"Two people. One story. {bride} and {groom} found each other through {context} and decided fairly quickly that they were each other's person. No complicated love story — just two humans who genuinely vibe, make each other better, and want to celebrate that in style.",
                    f"{groom} slid into {bride}'s world through {context} and the rest, as they say, is history. Real talk: their love is the kind that's easy, exciting, and everything in between. Now they're throwing a party to celebrate, and you're invited.",
                ]

        # ── WELCOME NOTE ──────────────────────────────────────────────────────
        elif target_field == "welcome_note":
            context = details or "our wedding"
            if tone == "romantic":
                variations = [
                    f"Two hearts, one love, a lifetime to share. {groom} & {bride} invite you to witness the beginning of their happily ever after. Let's celebrate our love story at {context}.",
                    f"Once in a while, in the middle of an ordinary life, love gives us a fairy tale. Join us as {bride} and {groom} say 'I do' and walk hand-in-hand into forever at {context}.",
                    f"Love has brought us together, and we want to celebrate this beautiful blessing with our nearest and dearest. Come celebrate {groom} and {bride}'s big day at {context}.",
                ]
            elif tone == "formal":
                variations = [
                    f"Together with their families, {groom} and {bride} request the honor of your presence as they exchange wedding vows. Join us to celebrate their union at {context}.",
                    f"Mr. & Mrs. request the pleasure of your company at the marriage ceremony of their beloved children {bride} and {groom}. Your presence is highly appreciated at {context}.",
                    f"We invite you to share in our joy and support us as we, {groom} and {bride}, begin our life journey together. The wedding ceremony will be held at {context}.",
                ]
            elif tone == "religious":
                variations = [
                    f"By the grace of the Almighty, we invite you to bless the holy union of {groom} and {bride} as they bind their souls in marriage. May your blessings guide them at {context}.",
                    f"With divine blessings, {bride} & {groom} start their blessed journey of marital bliss. We request your presence and prayers on this sacred day at {context}.",
                    f"Love is a gift of the Divine. We invite you to join us in prayer and celebration as {groom} & {bride} are united in holy matrimony at {context}.",
                ]
            else:  # modern
                variations = [
                    f"No rules, no stress, just love and celebration! {groom} and {bride} are getting married, and we want you there. Join the party at {context}!",
                    f"We're making it official! {bride} & {groom} are tying the knot. Grab your dancing shoes and join us for an unforgettable celebration at {context}.",
                    f"Finally! {groom} & {bride} are getting hitched. Come for the love, stay for the food and drinks. Celebrations kick off at {context}.",
                ]

        # ── ATTRIBUTION HEADING ───────────────────────────────────────────────
        elif target_field == "attribution_heading":
            if tone == "romantic":
                variations = [
                    "With all our love,",
                    "Forever yours,",
                    "With love & gratitude,",
                ]
            elif tone == "formal":
                variations = [
                    "Warmest regards,",
                    "With sincere appreciation,",
                    "Respectfully yours,",
                ]
            elif tone == "religious":
                variations = [
                    "With Allah's blessings,",
                    "In God's grace,",
                    "Barakallah feekum,",
                ]
            else:  # modern
                variations = [
                    "With love & good vibes,",
                    "Cheers & love,",
                    "XOXO,",
                ]

        # ── ATTRIBUTION NAMES ─────────────────────────────────────────────────
        elif target_field == "attribution_names":
            context = details or ""
            family_note = f" & {context}" if context else ""
            if tone == "formal":
                variations = [
                    f"The families of {bride} & {groom}",
                    f"{bride} & {groom}{family_note}",
                    f"Mr. & Mrs. {groom.split()[-1]} and family",
                ]
            elif tone == "religious":
                variations = [
                    f"{groom} & {bride}{family_note}",
                    f"The families of {bride} and {groom}",
                    f"{bride} & {groom}, with family blessings",
                ]
            else:
                variations = [
                    f"{groom} & {bride}",
                    f"{bride} & {groom}{family_note}",
                    f"{groom}, {bride} & families",
                ]

        # ── FALLBACK ──────────────────────────────────────────────────────────
        else:
            context = details or "our celebration"
            variations = [
                f"{groom} & {bride} warmly invite you to join them at {context}.",
                f"Please join {bride} and {groom} as they celebrate their special day at {context}.",
                f"With hearts full of joy, {groom} and {bride} invite you to be part of {context}.",
            ]

        return Response({
            "variations": variations
        }, status=status.HTTP_200_OK)




