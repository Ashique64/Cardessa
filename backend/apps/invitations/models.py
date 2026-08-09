import uuid
import secrets
from django.db import models
from django.conf import settings


def generate_slug():
    """Generate a short, URL-safe unique slug for shareable invitation links."""
    return secrets.token_urlsafe(8)


class Invitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    template = models.ForeignKey(
        "templates_app.Template",
        on_delete=models.PROTECT,
        related_name="invitations",
    )
    slug = models.SlugField(unique=True, default=generate_slug, max_length=20)
    # Phase 1.5: schema-driven content that matches template.field_schema keys.
    # e.g. { "groom_name": "Rahul", "bride_name": "Priya", "event_date": "2025-02-14", ... }
    # This is the single source of truth for all user customizations going forward.
    content = models.JSONField(
        default=dict,
        help_text="User-supplied content keyed by the template's field_schema field keys.",
    )

    # Legacy: kept for backward compatibility — migrated to content via data migration.
    # Do not write new data here; read from content instead.
    config = models.JSONField(default=dict)
    event_date = models.DateField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    # Phase 2: optional custom subdomain e.g. "rahul-priya"
    custom_subdomain = models.SlugField(unique=True, blank=True, null=True)
    # Phase 3: optional custom domain e.g. "invite.theirsite.com"
    custom_domain = models.CharField(max_length=255, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "invitations"
        ordering = ["-created_at"]
        verbose_name = "Invitation"
        verbose_name_plural = "Invitations"

    def __str__(self):
        return f"Invitation {self.slug} by {self.user.email}"


class RSVP(models.Model):
    STATUS_CHOICES = [
        ("attending", "Attending"),
        ("declined", "Declined"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invitation = models.ForeignKey(
        Invitation,
        on_delete=models.CASCADE,
        related_name="rsvps",
    )
    guest_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="attending")
    guest_count = models.PositiveIntegerField(default=1)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rsvps"
        ordering = ["-created_at"]
        verbose_name = "RSVP"
        verbose_name_plural = "RSVPs"

    def __str__(self):
        return f"{self.guest_name} — {self.status}"


