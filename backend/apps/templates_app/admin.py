from django.contrib import admin
from .models import Category, Template


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "icon", "sort_order")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "component_key", "tier", "is_active", "sort_order", "created_at")
    list_filter = ("tier", "is_active", "categories")
    search_fields = ("name", "slug", "component_key")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    filter_horizontal = ("categories",)

    fieldsets = (
        ("Identity", {
            "fields": ("name", "slug", "component_key", "tier", "categories", "description", "thumbnail", "preview_url"),
        }),
        ("Schema-Driven Content (Phase 1.5)", {
            "fields": ("field_schema", "demo_content"),
            "description": (
                "field_schema: defines editable fields shown in the Editor for this design. "
                "demo_content: sample data fed to the /templates/[slug] public preview."
            ),
        }),
        ("Legacy Config", {
            "classes": ("collapse",),
            "fields": ("animation_config", "style_tags"),
        }),
        ("Visibility", {
            "fields": ("is_active", "sort_order"),
        }),
    )
