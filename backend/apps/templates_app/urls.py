from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryListView, TemplateListView, TemplateDetailView, AdminTemplateViewSet, AdminCategoryViewSet

router = DefaultRouter()
router.register("admin", AdminTemplateViewSet, basename="admin-template")
router.register("categories/admin", AdminCategoryViewSet, basename="admin-category")

urlpatterns = [
    path("", TemplateListView.as_view(), name="template-list"),
    path("", include(router.urls)),
    path("<slug:slug>/", TemplateDetailView.as_view(), name="template-detail"),
]
