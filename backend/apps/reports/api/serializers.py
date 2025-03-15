from rest_framework import serializers
from ..models import Report, ParkingReport, FinancialReport
from django.utils.translation import gettext_lazy as _


class ReportSerializer(serializers.ModelSerializer):
    """سریالایزر گزارش پایه"""

    class Meta:
        model = Report
        fields = [
            'id', 'report_type', 'start_date', 'end_date', 'created_by',
            'data', 'status', 'file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['data', 'status', 'file', 'created_at', 'updated_at']

    def validate(self, data):
        """اعتبارسنجی داده‌های گزارش"""
        if data.get('start_date') and data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError(_("End date must be after start date."))

        return data


class ParkingReportSerializer(serializers.ModelSerializer):
    """سریالایزر گزارش پارکینگ"""

    class Meta:
        model = ParkingReport
        fields = [
            'id', 'report_type', 'start_date', 'end_date', 'created_by',
            'data', 'status', 'file', 'parking_lot', 'parking_report_type',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['data', 'status', 'file', 'created_at', 'updated_at']

    def validate(self, data):
        """اعتبارسنجی داده‌های گزارش"""
        if data.get('start_date') and data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError(_("End date must be after start date."))

        return data


class FinancialReportSerializer(serializers.ModelSerializer):
    """سریالایزر گزارش مالی"""

    class Meta:
        model = FinancialReport
        fields = [
            'id', 'report_type', 'start_date', 'end_date', 'created_by',
            'data', 'status', 'file', 'financial_report_type',
            'total_revenue', 'total_expenses', 'net_profit',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'data', 'status', 'file', 'total_revenue', 'total_expenses',
            'net_profit', 'created_at', 'updated_at'
        ]

    def validate(self, data):
        """اعتبارسنجی داده‌های گزارش"""
        if data.get('start_date') and data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError(_("End date must be after start date."))

        return data