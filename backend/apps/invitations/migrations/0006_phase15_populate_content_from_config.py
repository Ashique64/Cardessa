"""
Data migration — Phase 1.5
Populate Invitation.content from Invitation.config for all existing rows
so that the new schema-driven editor can read a consistent content dict.

Also seeds the field_schema on any existing "Ivory Bloom" Template rows
so they round-trip through the new generic editor with zero visible change.
"""
from django.db import migrations
from django.db.models import Q

IVORY_BLOOM_FIELD_SCHEMA = {
    "fields": [
        {"key": "groom_name",    "type": "text",     "label": "Groom's Name",      "max_length": 40,  "required": True},
        {"key": "bride_name",    "type": "text",     "label": "Bride's Name",       "max_length": 40,  "required": True},
        {"key": "event_date",    "type": "date",     "label": "Wedding Date",                          "required": True},
        {"key": "event_time",    "type": "time",     "label": "Ceremony Time",                         "required": False},
        {"key": "venue_name",    "type": "text",     "label": "Venue Name",         "max_length": 100, "required": True},
        {"key": "venue_address", "type": "textarea", "label": "Venue Address",                         "required": False},
        {"key": "couple_photo",  "type": "image",    "label": "Couple Photo",       "aspect_ratio": "4:5", "required": False},
        {"key": "accent_color",  "type": "color",    "label": "Accent Colour",
         "options": ["#C9A66B", "#7A8B6F", "#8E3B46", "#4A6FA5", "#2D6A4F"],       "required": False},
        {"key": "music_enabled", "type": "toggle",   "label": "Background Music",                      "required": False},
        {"key": "music_url",     "type": "audio",    "label": "Music File",                            "required": False},
    ]
}

IVORY_BLOOM_DEMO_CONTENT = {
    "groom_name":    "Rahul",
    "bride_name":    "Priya",
    "event_date":    "2025-02-14",
    "event_time":    "18:00",
    "venue_name":    "The Grand Pavilion",
    "venue_address": "123, Orchid Road, Kochi, Kerala 682001",
    "accent_color":  "#C9A66B",
    "music_enabled": True,
}


def populate_content_from_config(apps, schema_editor):
    """Copy existing config dict into the new content field."""
    Invitation = apps.get_model("invitations", "Invitation")
    for invitation in Invitation.objects.all():
        if invitation.config and not invitation.content:
            invitation.content = invitation.config.copy()
            invitation.save(update_fields=["content"])


def seed_ivory_bloom_schema(apps, schema_editor):
    """
    Register field_schema + demo_content on all existing Template rows
    whose component_key is 'ivory-bloom' (or whose name contains 'Ivory Bloom').
    """
    Template = apps.get_model("templates_app", "Template")
    for tmpl in Template.objects.filter(
        Q(component_key="ivory-bloom") | Q(name__icontains="Ivory Bloom")
    ):
        if not tmpl.field_schema:
            tmpl.field_schema = IVORY_BLOOM_FIELD_SCHEMA
        if not tmpl.demo_content:
            tmpl.demo_content = IVORY_BLOOM_DEMO_CONTENT
        if not tmpl.component_key:
            tmpl.component_key = "ivory-bloom"
        tmpl.save(update_fields=["field_schema", "demo_content", "component_key"])


def reverse_populate_content(apps, schema_editor):
    """No-op — content field is additive; reversing just leaves it empty."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("invitations", "0005_phase15_schema_content_fields"),
        ("templates_app", "0003_phase15_schema_content_fields"),
    ]

    operations = [
        migrations.RunPython(populate_content_from_config, reverse_code=reverse_populate_content),
        migrations.RunPython(seed_ivory_bloom_schema, reverse_code=migrations.RunPython.noop),
    ]
