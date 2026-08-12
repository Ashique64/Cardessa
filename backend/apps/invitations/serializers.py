from rest_framework import serializers
from .models import Invitation, RSVP


# ---------------------------------------------------------------------------
# Content validation helpers
# ---------------------------------------------------------------------------

ALLOWED_FIELD_TYPES = {
    "text", "textarea", "date", "time",
    "image", "image_gallery", "audio",
    "color", "toggle", "select",
}


def validate_content_against_schema(content: dict, field_schema: dict) -> None:
    """
    Hand-rolled validator: checks that every required field in field_schema
    is present in content, and that no unknown keys are submitted.

    Raises serializers.ValidationError on the first problem found.
    """
    if not field_schema or "fields" not in field_schema:
        # Template has no schema yet — skip validation (legacy / unconfigured template)
        return

    schema_fields = field_schema.get("fields", [])
    
    STANDARD_KEYS = {
        "bride_name", "groom_name", "name_display_order", "ceremony_type", "bride_parents", "groom_parents",
        "event_date", "event_time", "end_date_time", "venue_name", "venue_address", "google_map_link",
        "accent_color", "bg_color",
        "welcome_note", "attribution_heading", "attribution_names",
        "our_story",
        "couple_photo",
        "photo_album_enabled", "photo_album",
        "rsvp_enabled",
        "music_url", "music_enabled",
        "hide_branding",
        # Custom UI flags
        "parents_enabled", "end_time_enabled", "google_map_enabled", "attributions_enabled", "our_story_enabled",
    }
    schema_keys = {f["key"] for f in schema_fields} | STANDARD_KEYS

    # 1. Reject completely unknown keys (prevents content pollution)
    unknown = set(content.keys()) - schema_keys
    if unknown:
        raise serializers.ValidationError(
            {"content": f"Unknown field(s) for this template: {', '.join(sorted(unknown))}"}
        )

    # 2. Check required fields are present and non-empty
    for field_def in schema_fields:
        key = field_def["key"]
        required = field_def.get("required", False)
        value = content.get(key)

        if required and (value is None or value == "" or value == [] or value == {}):
            label = field_def.get("label", key)
            raise serializers.ValidationError(
                {"content": f"'{label}' is required."}
            )

        # 3. Type-level checks
        field_type = field_def.get("type")
        if value is None:
            continue

        if field_type == "color" and "options" in field_def:
            if value not in field_def["options"]:
                label = field_def.get("label", key)
                raise serializers.ValidationError(
                    {"content": f"'{label}' must be one of: {', '.join(field_def['options'])}"}
                )

        if field_type == "select" and "options" in field_def:
            valid_values = [o["value"] if isinstance(o, dict) else o for o in field_def["options"]]
            if value not in valid_values:
                label = field_def.get("label", key)
                raise serializers.ValidationError(
                    {"content": f"'{label}' must be one of: {', '.join(map(str, valid_values))}"}
                )

        if field_type == "text" and "max_length" in field_def:
            if isinstance(value, str) and len(value) > field_def["max_length"]:
                label = field_def.get("label", key)
                raise serializers.ValidationError(
                    {"content": f"'{label}' must be {field_def['max_length']} characters or fewer."}
                )

        if field_type == "toggle" and value not in (True, False):
            label = field_def.get("label", key)
            raise serializers.ValidationError(
                {"content": f"'{label}' must be true or false."}
            )


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class InvitationSerializer(serializers.ModelSerializer):
    """Used for create, retrieve, and partial update (PATCH)."""

    hide_branding = serializers.SerializerMethodField()
    couple_name = serializers.SerializerMethodField()
    template_name = serializers.CharField(source="template.name", read_only=True)
    status = serializers.SerializerMethodField()
    price = serializers.IntegerField(source="template.price_inr", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "id", "slug", "template", "template_name", "couple_name", "price",
            "content",      # Phase 1.5: schema-driven content dict
            "config",       # Legacy — kept for backward compat, read-only via API
            "event_date",
            "is_published", "is_paid", "custom_subdomain", "custom_domain",
            "created_at", "updated_at",
            "hide_branding", "status",
        ]
        read_only_fields = ["id", "slug", "config", "created_at", "updated_at"]

    def get_hide_branding(self, obj):
        # Admin bypass
        if obj.user.is_superuser or obj.user.is_staff:
            return obj.content.get("hide_branding", False) == True

        # Check active orders for white_label entitlement
        from apps.orders.models import Order
        has_white_label = Order.objects.filter(
            user=obj.user,
            status="paid",
            features_snapshot__white_label=True
        ).exists()

        if has_white_label:
            return obj.content.get("hide_branding", False) == True

        return False

    def get_couple_name(self, obj):
        bride = obj.content.get("bride_name", "")
        groom = obj.content.get("groom_name", "")
        if bride and groom:
            return f"{bride} & {groom}"
        return bride or groom or "Untitled Invitation"

    def get_status(self, obj):
        return "published" if obj.is_published else "draft"

    def validate(self, attrs):
        """Validate content against the template's field_schema on create and PATCH."""
        content = attrs.get("content")
        if content is None:
            # PATCH may omit content — only validate when it's being changed
            return attrs

        # Resolve the template — from attrs (new template on swap) or existing instance
        template = attrs.get("template")
        if template is None and self.instance is not None:
            template = self.instance.template

        if template is not None and hasattr(template, "field_schema"):
            validate_content_against_schema(content, template.field_schema)

        return attrs

    def update(self, instance, validated_data):
        """On PATCH, also mirror content → config to keep legacy readers working."""
        instance = super().update(instance, validated_data)
        if "content" in validated_data:
            instance.config = instance.content
            instance.save(update_fields=["config"])
        return instance


class InvitationPublicSerializer(serializers.ModelSerializer):
    """
    Public (guest-facing) serializer — returns only what the guest needs
    to render the invitation. No user PII exposed.
    Includes field_schema + component_key so the frontend TemplateRenderer
    knows which component to mount and what data it receives.
    """
    template_slug = serializers.SlugRelatedField(
        source="template", slug_field="slug", read_only=True
    )
    template_name = serializers.CharField(source="template.name", read_only=True)
    component_key = serializers.CharField(source="template.component_key", read_only=True)
    field_schema = serializers.JSONField(source="template.field_schema", read_only=True)
    animation_config = serializers.JSONField(source="template.animation_config", read_only=True)
    couple_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    hide_branding = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = [
            "slug", "template_slug", "template_name", "component_key",
            "field_schema", "animation_config",
            "content", "config", "event_date", "is_published", "is_paid",
            "hide_branding", "couple_name", "status",
        ]

    def get_hide_branding(self, obj):
        # Admin bypass
        if obj.user.is_superuser or obj.user.is_staff:
            return obj.content.get("hide_branding", False) == True

        # Check active orders for white_label entitlement
        from apps.orders.models import Order
        has_white_label = Order.objects.filter(
            user=obj.user,
            status="paid",
            features_snapshot__white_label=True
        ).exists()

        if has_white_label:
            return obj.content.get("hide_branding", False) == True

        return False

    def get_couple_name(self, obj):
        bride = obj.content.get("bride_name", "")
        groom = obj.content.get("groom_name", "")
        if bride and groom:
            return f"{bride} & {groom}"
        return bride or groom or "Untitled Invitation"

    def get_status(self, obj):
        return "published" if obj.is_published else "draft"


class RSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = [
            "id", "guest_name", "email", "phone", "status",
            "guest_count", "message", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
