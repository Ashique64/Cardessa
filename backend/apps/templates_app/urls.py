from django.urls import path
from .views import TemplateListView, TemplateDetailView

urlpatterns = [
    path("", TemplateListView.as_view(), name="template-list"),
    path("<slug:slug>/", TemplateDetailView.as_view(), name="template-detail"),
]
