from rest_framework import generics, permissions, viewsets
from django.db.models import Case, When, Value, IntegerField
from .models import Category, Template
from .serializers import CategorySerializer, TemplateListSerializer, TemplateDetailSerializer


class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    Public endpoint — lists all categories for the pill filter row.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.all()
    pagination_class = None  # Return full list without pagination


class TemplateListView(generics.ListAPIView):
    """
    GET /api/templates/
    Public endpoint — lists all active templates.
    Supports ?tier=classic|royal and ?category=<slug> filtering.
    """
    serializer_class = TemplateListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Template.objects.filter(is_active=True).prefetch_related("categories")
        tier = self.request.query_params.get("tier")
        category = self.request.query_params.get("category")
        price = self.request.query_params.get("price")  # "free" or "premium"
        sort = self.request.query_params.get("sort")    # "newest"

        if tier:
            qs = qs.filter(tier=tier)
        if category:
            qs = qs.filter(categories__slug=category)
        if price == "free":
            qs = qs.filter(price_inr=0)
        elif price == "premium":
            qs = qs.filter(price_inr__gt=0)

        if sort == "newest":
            qs = qs.annotate(
                is_new_tier=Case(
                    When(tier="new", then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by("-is_new_tier", "-created_at")
        elif sort == "price_low":
            qs = qs.order_by("price_inr", "sort_order", "name")
        elif sort == "price_high":
            qs = qs.order_by("-price_inr", "sort_order", "name")
        else:
            qs = qs.order_by("sort_order", "name")

        return qs


class TemplateDetailView(generics.RetrieveAPIView):
    """
    GET /api/templates/<slug>/
    Public endpoint — returns full template detail including field_schema and demo_content.
    """
    serializer_class = TemplateDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Template.objects.filter(is_active=True).prefetch_related("categories")
    lookup_field = "slug"


class AdminTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for superusers/staff to perform CRUD operations on templates.
    """
    queryset = Template.objects.all().prefetch_related("categories")
    serializer_class = TemplateDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "slug"


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for superusers/staff to perform CRUD operations on categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
