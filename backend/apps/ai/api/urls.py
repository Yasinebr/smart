from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicensePlateDetectionViewSet,FaceDetectionViewSet

router = DefaultRouter()
router.register(r'license-plate', LicensePlateDetectionViewSet)
router.register(r'face', FaceDetectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]