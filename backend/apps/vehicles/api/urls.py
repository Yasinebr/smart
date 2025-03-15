from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleCategoryViewSet

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)
router.register(r'categories', VehicleCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]