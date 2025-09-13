from django.urls import path, include
from .views import (
    AgentView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path("text_generation/", AgentView.as_view(), name="text_generation"),
    *router.urls,
]