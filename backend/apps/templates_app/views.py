from rest_framework import generics, permissions
from .models import Template
from .serializers import TemplateListSerializer, TemplateDetailSerializer


class TemplateListView(generics.ListAPIView):
    """
    GET /api/templates/
    Public endpoint — lists all active templates.
    Supports ?tier=classic|royal and ?style_tag=minimalist filtering.
    """
    serializer_class = TemplateListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Template.objects.filter(is_active=True)
        tier = self.request.query_params.get("tier")
        if tier:
            qs = qs.filter(tier=tier)
        return qs


class TemplateDetailView(generics.RetrieveAPIView):
    """
    GET /api/templates/<slug>/
    Public endpoint — returns full template detail.
    """
    serializer_class = TemplateDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Template.objects.filter(is_active=True)
    lookup_field = "slug"
