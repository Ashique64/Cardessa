from rest_framework import serializers
from .models import Template


class TemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the template gallery list view."""

    class Meta:
        model = Template
        fields = [
            "id", "name", "slug", "tier", "description",
            "thumbnail", "preview_url", "animation_config",
            "style_tags", "sort_order",
        ]


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the single template detail view."""

    class Meta:
        model = Template
        fields = "__all__"
