from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ParkingLotViewSet,
    ParkingZoneViewSet,
    ParkingSpotViewSet,
    ParkingSessionViewSet,
    ParkingReservationViewSet
)

router = DefaultRouter()
router.register(r'parking-lots', ParkingLotViewSet)
router.register(r'zones', ParkingZoneViewSet)
router.register(r'spots', ParkingSpotViewSet)
router.register(r'sessions', ParkingSessionViewSet)
router.register(r'reservations', ParkingReservationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]