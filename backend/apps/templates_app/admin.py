from django.contrib import admin
from .models import Template


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "tier", "is_active", "sort_order", "created_at")
    list_filter = ("tier", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
