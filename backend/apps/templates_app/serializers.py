from rest_framework import serializers
from .models import Category, Template


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "sort_order"]


class TemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the template gallery list view."""
    categories = CategorySerializer(many=True, read_only=True)
    thumbnail = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Template
        fields = [
            "id", "name", "slug", "tier", "price_inr", "is_new", "description",
            "thumbnail", "preview_url", "component_key",
            "categories", "style_tags", "sort_order",
        ]


class TemplateDetailSerializer(serializers.ModelSerializer):
    """Full serializer for the single template detail view — includes field_schema and demo_content."""
    categories = CategorySerializer(many=True, read_only=True)
    thumbnail = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        write_only=True,
        source="categories",
        required=False
    )

    class Meta:
        model = Template
        fields = [
            "id", "name", "slug", "tier", "price_inr", "is_new", "description",
            "thumbnail", "preview_url", "component_key",
            "categories", "category_ids", "field_schema", "demo_content",
            "animation_config", "style_tags", "is_active", "sort_order",
            "created_at", "updated_at",
        ]
