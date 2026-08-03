import uuid
from django.db import models


class Template(models.Model):
    TIER_CHOICES = [
        ("classic", "Classic"),
        ("royal", "Royal"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default="classic")
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="templates/thumbnails/", blank=True, null=True)
    preview_url = models.URLField(blank=True)
    # JSON config that drives animation selection per template
    # e.g. {"hero": "kinetic-typography", "gallery": "tilt-cards", "ambient": "gradient-mesh"}
    animation_config = models.JSONField(default=dict)
    # Style tags: minimalist, royal, bohemian, modern, traditional
    style_tags = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "templates"
        ordering = ["sort_order", "name"]
        verbose_name = "Template"
        verbose_name_plural = "Templates"

    def __str__(self):
        return f"{self.name} ({self.tier})"
