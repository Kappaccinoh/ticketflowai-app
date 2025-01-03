from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.DocumentViewSet, basename='documents')

urlpatterns = [
    path('', include(router.urls)),
]