from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .serializers import PaymentSerializer, InvoiceSerializer, SubscriptionSerializer
from ..models import Payment, Invoice, Subscription
from utils.permissions import IsAdmin
from utils.exceptions import PaymentError
import uuid


class PaymentViewSet(viewsets.ModelViewSet):
    """ویوست پرداخت"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'payment_type', 'status', 'payment_gateway']
    ordering_fields = ['amount', 'payment_date', 'created_at']

    def get_queryset(self):
        """فیلتر کردن پرداخت‌ها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return Payment.objects.all()
        else:
            return Payment.objects.filter(user=user)

    def perform_create(self, serializer):
        """ذخیره پرداخت"""
        # اگر کاربر مدیر نباشد، فقط برای خودش می‌تواند پرداخت ایجاد کند
        if not self.request.user.is_admin and serializer.validated_data['user'].id != self.request.user.id:
            raise serializers.ValidationError(_('You can only create payments for yourself.'))

        serializer.save()

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """پردازش پرداخت"""
        payment = self.get_object()

        # بررسی مجوز دسترسی
        if payment.user != request.user and not request.user.is_admin:
            return Response(
                {'detail': _('You do not have permission to process this payment.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # بررسی وضعیت پرداخت
        if payment.status != Payment.PENDING:
            return Response(
                {'detail': _('Only pending payments can be processed.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # شبیه‌سازی پردازش پرداخت با درگاه پرداخت
        try:
            # در حالت واقعی، اینجا ارتباط با درگاه پرداخت انجام می‌شود
            payment.status = Payment.COMPLETED
            payment.transaction_id = f"TX-{uuid.uuid4().hex[:8].upper()}"
            payment.payment_date = timezone.now()
            payment.save()

            # به‌روزرسانی وضعیت آیتم مرتبط (جلسه پارک، رزرو، اشتراک)
            self._update_related_item(payment)

            # ایجاد فاکتور اگر وجود ندارد
            if not hasattr(payment, 'invoice'):
                Invoice.objects.create(
                    payment=payment,
                    invoice_number=f"INV-{payment.transaction_id}",
                    items=[{"type": payment.payment_type, "amount": payment.amount}],
                    is_paid=True
                )

            return Response(PaymentSerializer(payment).data)

        except Exception as e:
            # در حالت واقعی، خطای درگاه پرداخت می‌تواند پردازش شود
            payment.status = Payment.FAILED
            payment.save()
            raise PaymentError(detail=str(e))

    def _update_related_item(self, payment):
        """به‌روزرسانی آیتم مرتبط با پرداخت"""
        if payment.payment_type == Payment.PARKING_SESSION:
            # به‌روزرسانی جلسه پارک
            sessions = payment.parking_sessions.all()
            for session in sessions:
                session.is_paid = True
                session.save()

        elif payment.payment_type == Payment.RESERVATION:
            # به‌روزرسانی رزرو
            reservations = payment.reservations.all()
            for reservation in reservations:
                reservation.is_paid = True
                reservation.save()

        elif payment.payment_type == Payment.SUBSCRIPTION:
            # به‌روزرسانی اشتراک
            subscriptions = payment.subscriptions.all()
            for subscription in subscriptions:
                subscription.is_active = True
                subscription.save()

    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """بازگشت پول پرداخت"""
        payment = self.get_object()

        # بررسی مجوز دسترسی - فقط مدیر سیستم می‌تواند بازگشت پول انجام دهد
        if not request.user.is_admin:
            return Response(
                {'detail': _('You do not have permission to refund payments.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # بررسی وضعیت پرداخت
        if payment.status != Payment.COMPLETED:
            return Response(
                {'detail': _('Only completed payments can be refunded.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # شبیه‌سازی بازگشت پول
        try:
            # در حالت واقعی، اینجا ارتباط با درگاه پرداخت برای بازگشت پول انجام می‌شود
            payment.status = Payment.REFUNDED
            payment.save()

            # به‌روزرسانی وضعیت آیتم مرتبط
            if payment.payment_type == Payment.PARKING_SESSION:
                for session in payment.parking_sessions.all():
                    session.is_paid = False
                    session.save()

            elif payment.payment_type == Payment.RESERVATION:
                for reservation in payment.reservations.all():
                    reservation.is_paid = False
                    reservation.save()

            elif payment.payment_type == Payment.SUBSCRIPTION:
                for subscription in payment.subscriptions.all():
                    subscription.is_active = False
                    subscription.save()

            return Response(PaymentSerializer(payment).data)

        except Exception as e:
            raise PaymentError(detail=str(e))


class InvoiceViewSet(viewsets.ModelViewSet):
    """ویوست فاکتور"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['invoice_number', 'created_at']

    def get_queryset(self):
        """فیلتر کردن فاکتورها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return Invoice.objects.all()
        else:
            return Invoice.objects.filter(payment__user=user)

    def get_permissions(self):
        """تعیین مجوزهای دسترسی بر اساس عملیات"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ویوست اشتراک"""
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'subscription_type', 'period', 'is_active', 'auto_renew']
    ordering_fields = ['start_date', 'end_date', 'amount', 'created_at']

    def get_queryset(self):
        """فیلتر کردن اشتراک‌ها بر اساس نقش کاربر"""
        user = self.request.user
        if user.is_admin:
            return Subscription.objects.all()
        else:
            return Subscription.objects.filter(user=user)

    def perform_create(self, serializer):
        """ذخیره اشتراک"""
        # اگر کاربر مدیر نباشد، فقط برای خودش می‌تواند اشتراک ایجاد کند
        if not self.request.user.is_admin and serializer.validated_data['user'].id != self.request.user.id:
            raise serializers.ValidationError(_('You can only create subscriptions for yourself.'))

        serializer.save()

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """تمدید اشتراک"""
        subscription = self.get_object()

        # بررسی مجوز دسترسی
        if subscription.user != request.user and not request.user.is_admin:
            return Response(
                {'detail': _('You do not have permission to renew this subscription.')},
                status=status.HTTP_403_FORBIDDEN
            )

        # محاسبه تاریخ‌های جدید
        if timezone.now() > subscription.end_date:
            # اگر اشتراک منقضی شده است، از زمان فعلی شروع می‌شود
            start_date = timezone.now()
        else:
            # اگر هنوز منقضی نشده است، از زمان پایان قبلی شروع می‌شود
            start_date = subscription.end_date

        # محاسبه زمان پایان بر اساس دوره
        from dateutil.relativedelta import relativedelta

        if subscription.period == Subscription.MONTHLY:
            end_date = start_date + relativedelta(months=1)
        elif subscription.period == Subscription.QUARTERLY:
            end_date = start_date + relativedelta(months=3)
        elif subscription.period == Subscription.YEARLY:
            end_date = start_date + relativedelta(years=1)
        else:
            end_date = start_date + relativedelta(months=1)

        # ایجاد پرداخت جدید
        payment = Payment.objects.create(
            user=subscription.user,
            payment_type=Payment.SUBSCRIPTION,
            amount=subscription.amount,
            status=Payment.PENDING
        )

        # ایجاد اشتراک جدید
        new_subscription = Subscription.objects.create(
            user=subscription.user,
            subscription_type=subscription.subscription_type,
            period=subscription.period,
            start_date=start_date,
            end_date=end_date,
            is_active=False,  # فعال نمی‌شود تا پرداخت کامل شود
            auto_renew=subscription.auto_renew,
            amount=subscription.amount,
            payment=payment
        )

        return Response({
            'subscription': SubscriptionSerializer(new_subscription).data,
            'payment': PaymentSerializer(payment).data
        })

    @action(detail=True, methods=['post'])
    def cancel_auto_renew(self, request, pk=None):
        """لغو تمدید خودکار اشتراک"""
        subscription = self.get_object()

        # بررسی مجوز دسترسی
        if subscription.user != request.user and not request.user.is_admin:
            return Response(
                {'detail': _('You do not have permission to modify this subscription.')},
                status=status.HTTP_403_FORBIDDEN
            )

        subscription.auto_renew = False
        subscription.save()

        return Response(SubscriptionSerializer(subscription).data)