import uuid
from django.db import models


class Category(models.Model):
    """
    Template category — powers the pill filter row on the gallery page.
    e.g. Wedding, Naming Ceremony, House Warming, Birthday Party, etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    # Icon identifier (e.g. a Lucide/FontAwesome icon name or emoji)
    icon = models.CharField(max_length=50, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "template_categories"
        ordering = ["sort_order", "name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Template(models.Model):
    TIER_CHOICES = [
        ("new", "New"),
        ("standard", "Standard"),
        ("premium", "Premium"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default="standard")
    price_inr = models.PositiveIntegerField(default=999, help_text="Price in INR. 0 means free.")
    is_new = models.BooleanField(default=False, help_text="Mark if this template is newly added.")
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to="templates/thumbnails/", blank=True, null=True)
    preview_url = models.URLField(blank=True)

    # Phase 1.5: maps to a React component key in the frontend registry
    # e.g. "ivory-bloom", "floral-arch", "premium-gold", "begin-forever"
    component_key = models.CharField(max_length=100, blank=True, default="ivory-bloom")

    # Phase 1.5: M2M categories (Wedding, Engagement, Birthday, etc.)
    categories = models.ManyToManyField(Category, blank=True, related_name="templates")

    # Phase 1.5: declares every user-editable field for this specific design.
    # Structure: { "fields": [ { "key", "type", "label", "required", ...constraints } ] }
    # Supported types: text, textarea, date, time, image, image_gallery,
    #                  audio, color, toggle, select
    field_schema = models.JSONField(
        default=dict,
        help_text=(
            'Defines editable fields for this template. '
            'Format: {"fields": [{"key": "groom_name", "type": "text", '
            '"label": "Groom\'s Name", "max_length": 40, "required": true}, ...]}'
        ),
    )

    # Phase 1.5: sample content that feeds the /templates/[slug] public preview.
    # Keys must match those defined in field_schema.
    demo_content = models.JSONField(
        default=dict,
        help_text="Sample content to display on the public template preview page.",
    )

    # Legacy JSON config that drives animation selection per template
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
