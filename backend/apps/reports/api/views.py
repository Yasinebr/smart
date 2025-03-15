from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .serializers import ReportSerializer, ParkingReportSerializer, FinancialReportSerializer
from ..models import Report, ParkingReport, FinancialReport
from utils.permissions import IsAdmin, IsParkingManager
from ..tasks import generate_parking_report, generate_financial_report
from apps.parking.models import ParkingLot, ParkingSession
from apps.payments.models import Payment


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ویوست گزارش پایه"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_type', 'status', 'created_by']
    ordering_fields = ['start_date', 'end_date', 'created_at']

    def get_queryset(self):
        """فیلتر کردن گزارش‌ها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return Report.objects.all()
        elif user.is_parking_manager:
            # مدیر پارکینگ فقط گزارش‌های ایجاد شده توسط خود را می‌بیند
            return Report.objects.filter(created_by=user)
        else:
            # کاربران عادی هیچ گزارشی نمی‌بینند
            return Report.objects.none()


class ParkingReportViewSet(viewsets.ModelViewSet):
    """ویوست گزارش پارکینگ"""
    queryset = ParkingReport.objects.all()
    serializer_class = ParkingReportSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsParkingManager)]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_type', 'status', 'created_by', 'parking_lot', 'parking_report_type']
    ordering_fields = ['start_date', 'end_date', 'created_at']

    def get_queryset(self):
        """فیلتر کردن گزارش‌ها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return ParkingReport.objects.all()
        elif user.is_parking_manager:
            # مدیر پارکینگ فقط گزارش‌های پارکینگ‌های خود و گزارش‌های ایجاد شده توسط خود را می‌بیند
            return ParkingReport.objects.filter(
                parking_lot__manager=user
            ) | ParkingReport.objects.filter(
                created_by=user
            )
        else:
            # کاربران عادی هیچ گزارشی نمی‌بینند
            return ParkingReport.objects.none()

    def perform_create(self, serializer):
        """ذخیره گزارش و شروع تسک تولید گزارش"""
        report = serializer.save(
            created_by=self.request.user,
            status=Report.PENDING,
            data={}
        )

        # اجرای تسک تولید گزارش به صورت ناهمگام
        generate_parking_report.delay(report.id)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """تولید مجدد گزارش"""
        report = self.get_object()

        if report.status == Report.PENDING:
            return Response(
                {'detail': _('Report is already being generated.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # به‌روزرسانی وضعیت و شروع مجدد تسک
        report.status = Report.PENDING
        report.save()

        generate_parking_report.delay(report.id)

        return Response({'status': 'Report regeneration started.'})


class FinancialReportViewSet(viewsets.ModelViewSet):
    """ویوست گزارش مالی"""
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [IsAuthenticated, IsAdmin]  # فقط مدیران سیستم دسترسی دارند
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_type', 'status', 'created_by', 'financial_report_type']
    ordering_fields = ['start_date', 'end_date', 'created_at']

    def perform_create(self, serializer):
        """ذخیره گزارش و شروع تسک تولید گزارش"""
        report = serializer.save(
            created_by=self.request.user,
            status=Report.PENDING,
            data={},
            total_revenue=0,
            total_expenses=0,
            net_profit=0
        )

        # اجرای تسک تولید گزارش به صورت ناهمگام
        generate_financial_report.delay(report.id)

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """تولید مجدد گزارش"""
        report = self.get_object()

        if report.status == Report.PENDING:
            return Response(
                {'detail': _('Report is already being generated.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # به‌روزرسانی وضعیت و شروع مجدد تسک
        report.status = Report.PENDING
        report.save()

        generate_financial_report.delay(report.id)

        return Response({'status': 'Report regeneration started.'})