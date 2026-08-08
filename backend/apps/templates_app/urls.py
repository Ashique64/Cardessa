from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TemplateListView, TemplateDetailView, AdminTemplateViewSet

router = DefaultRouter()
router.register("admin", AdminTemplateViewSet, basename="admin-template")

urlpatterns = [
    path("", TemplateListView.as_view(), name="template-list"),
    path("", include(router.urls)),
    path("<slug:slug>/", TemplateDetailView.as_view(), name="template-detail"),
]
