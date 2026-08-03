from rest_framework import serializers
from .models import Invitation


class InvitationSerializer(serializers.ModelSerializer):
    """Used for create, retrieve, update."""

    class Meta:
        model = Invitation
        fields = [
            "id", "slug", "template", "config", "event_date",
            "is_published", "custom_subdomain", "custom_domain",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class InvitationPublicSerializer(serializers.ModelSerializer):
    """
    Public (guest-facing) serializer — returns only what the guest needs
    to render the invitation. No user PII exposed.
    """
    template_slug = serializers.SlugRelatedField(
        source="template", slug_field="slug", read_only=True
    )
    animation_config = serializers.JSONField(source="template.animation_config", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "slug", "template_slug", "animation_config",
            "config", "event_date", "is_published",
        ]

