from rest_framework import serializers
from ..models import Payment, Invoice, Subscription
from django.utils.translation import gettext_lazy as _


class PaymentSerializer(serializers.ModelSerializer):
    """سریالایزر پرداخت"""

    is_successful = serializers.ReadOnlyField()

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'payment_type', 'amount', 'status', 'is_successful',
            'transaction_id', 'payment_gateway', 'payment_method', 'payment_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'transaction_id', 'payment_date', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    """سریالایزر فاکتور"""

    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'payment', 'invoice_number', 'items', 'tax_amount',
            'discount_amount', 'total_amount', 'is_paid', 'due_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['invoice_number', 'created_at', 'updated_at']

    def validate(self, data):
        """اعتبارسنجی داده‌های فاکتور"""
        if data.get('tax_amount', 0) < 0:
            raise serializers.ValidationError(_("Tax amount cannot be negative."))

        if data.get('discount_amount', 0) < 0:
            raise serializers.ValidationError(_("Discount amount cannot be negative."))

        return data


class SubscriptionSerializer(serializers.ModelSerializer):
    """سریالایزر اشتراک"""

    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'subscription_type', 'period', 'start_date',
            'end_date', 'is_active', 'auto_renew', 'amount', 'payment',
            'is_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """اعتبارسنجی داده‌های اشتراک"""
        if data.get('start_date') and data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError(_("End date must be after start date."))

        return data