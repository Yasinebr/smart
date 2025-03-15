from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ParkingReportViewSet, FinancialReportViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'parking-reports', ParkingReportViewSet)
router.register(r'financial-reports', FinancialReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
