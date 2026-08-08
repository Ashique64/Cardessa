from django.contrib import admin
from .models import Invitation, RSVP


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ("slug", "user", "template", "is_published", "event_date", "created_at")
    list_filter = ("is_published", "template__tier")
    search_fields = ("slug", "user__email")
    ordering = ("-created_at",)
    readonly_fields = ("slug", "created_at", "updated_at")


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ("guest_name", "invitation", "status", "guest_count", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("guest_name", "email", "phone", "invitation__slug")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)


