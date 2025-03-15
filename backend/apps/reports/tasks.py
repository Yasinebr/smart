import os
import json
import csv
import time
from datetime import datetime, timedelta
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, Q
from django.db import connection
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib

matplotlib.use('Agg')  # استفاده از backend غیر تعاملی

from .models import Report, ParkingReport, FinancialReport
from apps.parking.models import ParkingLot, ParkingZone, ParkingSlot, ParkingSession, ParkingReservation
from apps.payments.models import Payment, Invoice, Subscription


@shared_task
def generate_parking_report(report_id):
    """
    تسک برای تولید گزارش پارکینگ به صورت ناهمگام

    Args:
        report_id: شناسه گزارش
    """
    try:
        # دریافت گزارش
        report = ParkingReport.objects.get(id=report_id)

        # به‌روزرسانی وضعیت
        report.status = Report.PENDING
        report.save()

        # دریافت اطلاعات مورد نیاز
        parking_lot = report.parking_lot
        start_date = report.start_date
        end_date = report.end_date
        report_type = report.parking_report_type

        # فیلتر جلسات پارکینگ بر اساس بازه زمانی
        sessions = ParkingSession.objects.filter(
            parking_lot=parking_lot,
            entry_time__date__gte=start_date,
            entry_time__date__lte=end_date
        )

        # داده‌های گزارش
        report_data = {
            'parking_lot_name': parking_lot.name,
            'report_type': report_type,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'generated_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data': {}
        }

        # تولید گزارش بر اساس نوع
        if report_type == ParkingReport.OCCUPANCY:
            # گزارش اشغال
            report_data['data'] = generate_occupancy_report(parking_lot, sessions, start_date, end_date)
            chart_file = create_occupancy_chart(report_data['data'], parking_lot.name, start_date, end_date)

        elif report_type == ParkingReport.REVENUE:
            # گزارش درآمد
            report_data['data'] = generate_revenue_report(parking_lot, sessions, start_date, end_date)
            chart_file = create_revenue_chart(report_data['data'], parking_lot.name, start_date, end_date)

        elif report_type == ParkingReport.TRAFFIC:
            # گزارش ترافیک
            report_data['data'] = generate_traffic_report(parking_lot, sessions, start_date, end_date)
            chart_file = create_traffic_chart(report_data['data'], parking_lot.name, start_date, end_date)

        # ذخیره داده‌های گزارش
        report.data = report_data

        # ذخیره فایل گزارش
        if chart_file:
            # مسیر فایل نسبت به MEDIA_ROOT
            relative_path = os.path.relpath(chart_file, settings.MEDIA_ROOT)
            report.file = relative_path

        # به‌روزرسانی وضعیت
        report.status = Report.COMPLETED
        report.save()

        return True

    except ParkingReport.DoesNotExist:
        return False
    except Exception as e:
        # ثبت خطا و به‌روزرسانی وضعیت
        if 'report' in locals():
            report.status = Report.FAILED
            report.data = {'error': str(e)}
            report.save()

        return False


def generate_occupancy_report(parking_lot, sessions, start_date, end_date):
    """
    تولید داده‌های گزارش اشغال پارکینگ

    Args:
        parking_lot: پارکینگ
        sessions: جلسات پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        داده‌های گزارش
    """
    # تعداد روزها
    days = (end_date - start_date).days + 1

    # آماده‌سازی داده‌ها
    daily_data = []
    current_date = start_date

    for _ in range(days):
        day_sessions = sessions.filter(
            entry_time__date=current_date
        )

        # داده‌های روزانه
        date_str = current_date.strftime('%Y-%m-%d')
        max_occupancy = day_sessions.count()
        avg_duration = day_sessions.exclude(exit_time=None).aggregate(
            avg_duration=Avg(F('exit_time') - F('entry_time'))
        )['avg_duration']

        if avg_duration:
            avg_duration_hours = avg_duration.total_seconds() / 3600
        else:
            avg_duration_hours = 0

        # محاسبه اشغال در هر ساعت
        hourly_occupancy = []
        for hour in range(24):
            hour_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)

            # تعداد خودروهای حاضر در آن ساعت
            active_sessions = sessions.filter(
                Q(entry_time__lt=hour_end) &
                (Q(exit_time__gt=hour_start) | Q(exit_time=None))
            ).count()

            hourly_occupancy.append({
                'hour': hour,
                'occupancy': active_sessions
            })

        daily_data.append({
            'date': date_str,
            'max_occupancy': max_occupancy,
            'avg_duration_hours': round(avg_duration_hours, 2),
            'hourly_occupancy': hourly_occupancy
        })

        current_date += timedelta(days=1)

    # داده‌های کل دوره
    total_sessions = sessions.count()
    avg_duration = sessions.exclude(exit_time=None).aggregate(
        avg_duration=Avg(F('exit_time') - F('entry_time'))
    )['avg_duration']

    if avg_duration:
        avg_duration_hours = avg_duration.total_seconds() / 3600
    else:
        avg_duration_hours = 0

    # زون‌های پارکینگ
    zones_data = []
    for zone in ParkingZone.objects.filter(parking_lot=parking_lot):
        zone_sessions = sessions.filter(spot__zone=zone)

        zones_data.append({
            'zone_name': zone.name,
            'zone_type': zone.get_zone_type_display(),
            'capacity': zone.capacity,
            'total_sessions': zone_sessions.count()
        })

    # ساختار نهایی گزارش
    return {
        'total_sessions': total_sessions,
        'avg_duration_hours': round(avg_duration_hours, 2),
        'zones_data': zones_data,
        'daily_data': daily_data
    }


def generate_revenue_report(parking_lot, sessions, start_date, end_date):
    """
    تولید داده‌های گزارش درآمد پارکینگ

    Args:
        parking_lot: پارکینگ
        sessions: جلسات پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        داده‌های گزارش
    """
    # تعداد روزها
    days = (end_date - start_date).days + 1

    # آماده‌سازی داده‌ها
    daily_data = []
    current_date = start_date

    for _ in range(days):
        day_sessions = sessions.filter(
            entry_time__date=current_date
        )

        # محاسبه درآمد روزانه
        date_str = current_date.strftime('%Y-%m-%d')
        total_revenue = day_sessions.aggregate(Sum('amount_due'))['amount_due__sum'] or 0
        paid_revenue = day_sessions.filter(is_paid=True).aggregate(Sum('amount_due'))['amount_due__sum'] or 0
        unpaid_revenue = total_revenue - paid_revenue

        daily_data.append({
            'date': date_str,
            'total_revenue': round(float(total_revenue), 2),
            'paid_revenue': round(float(paid_revenue), 2),
            'unpaid_revenue': round(float(unpaid_revenue), 2),
            'sessions_count': day_sessions.count()
        })

        current_date += timedelta(days=1)

    # داده‌های کل دوره
    total_revenue = sessions.aggregate(Sum('amount_due'))['amount_due__sum'] or 0
    paid_revenue = sessions.filter(is_paid=True).aggregate(Sum('amount_due'))['amount_due__sum'] or 0
    unpaid_revenue = total_revenue - paid_revenue

    # زون‌های پارکینگ
    zones_data = []
    for zone in ParkingZone.objects.filter(parking_lot=parking_lot):
        zone_sessions = sessions.filter(spot__zone=zone)
        zone_revenue = zone_sessions.aggregate(Sum('amount_due'))['amount_due__sum'] or 0

        zones_data.append({
            'zone_name': zone.name,
            'zone_type': zone.get_zone_type_display(),
            'revenue': round(float(zone_revenue), 2),
            'sessions_count': zone_sessions.count()
        })

    # ساختار نهایی گزارش
    return {
        'total_revenue': round(float(total_revenue), 2),
        'paid_revenue': round(float(paid_revenue), 2),
        'unpaid_revenue': round(float(unpaid_revenue), 2),
        'zones_data': zones_data,
        'daily_data': daily_data
    }


def generate_traffic_report(parking_lot, sessions, start_date, end_date):
    """
    تولید داده‌های گزارش ترافیک پارکینگ

    Args:
        parking_lot: پارکینگ
        sessions: جلسات پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        داده‌های گزارش
    """
    # تعداد روزها
    days = (end_date - start_date).days + 1

    # آماده‌سازی داده‌ها
    daily_data = []
    current_date = start_date

    for _ in range(days):
        # محاسبه ورود و خروج روزانه
        date_str = current_date.strftime('%Y-%m-%d')

        entries = sessions.filter(
            entry_time__date=current_date
        ).count()

        exits = sessions.filter(
            exit_time__date=current_date
        ).count()

        # محاسبه ترافیک در هر ساعت
        hourly_traffic = []
        for hour in range(24):
            hour_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)

            hour_entries = sessions.filter(
                entry_time__gte=hour_start,
                entry_time__lt=hour_end
            ).count()

            hour_exits = sessions.filter(
                exit_time__gte=hour_start,
                exit_time__lt=hour_end
            ).count()

            hourly_traffic.append({
                'hour': hour,
                'entries': hour_entries,
                'exits': hour_exits
            })

        daily_data.append({
            'date': date_str,
            'entries': entries,
            'exits': exits,
            'hourly_traffic': hourly_traffic
        })

        current_date += timedelta(days=1)

    # ساختار نهایی گزارش
    return {
        'total_entries': sessions.count(),
        'total_exits': sessions.filter(exit_time__isnull=False).count(),
        'active_sessions': sessions.filter(exit_time__isnull=True).count(),
        'daily_data': daily_data
    }


def create_occupancy_chart(data, parking_lot_name, start_date, end_date):
    """
    ایجاد نمودار برای گزارش اشغال

    Args:
        data: داده‌های گزارش
        parking_lot_name: نام پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        مسیر فایل نمودار
    """
    try:
        # تنظیم فونت برای پشتیبانی از زبان فارسی
        plt.rcParams['font.family'] = 'DejaVu Sans'

        # ایجاد دیتافریم
        daily_data = data['daily_data']

        dates = [item['date'] for item in daily_data]
        max_occupancy = [item['max_occupancy'] for item in daily_data]

        # رسم نمودار
        plt.figure(figsize=(12, 8))
        plt.bar(dates, max_occupancy, color='blue')
        plt.title(f'گزارش اشغال پارکینگ - {parking_lot_name}')
        plt.xlabel('تاریخ')
        plt.ylabel('تعداد خودروها')
        plt.xticks(rotation=45)
        plt.tight_layout()

        # ایجاد دایرکتوری برای ذخیره فایل
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        # ذخیره فایل
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        file_path = os.path.join(reports_dir, f"occupancy_{parking_lot_name.replace(' ', '_')}_{date_range}.png")
        plt.savefig(file_path)
        plt.close()

        return file_path

    except Exception as e:
        print(f"Error creating occupancy chart: {str(e)}")
        return None


def create_revenue_chart(data, parking_lot_name, start_date, end_date):
    """
    ایجاد نمودار برای گزارش درآمد

    Args:
        data: داده‌های گزارش
        parking_lot_name: نام پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        مسیر فایل نمودار
    """
    try:
        # تنظیم فونت برای پشتیبانی از زبان فارسی
        plt.rcParams['font.family'] = 'DejaVu Sans'

        # ایجاد دیتافریم
        daily_data = data['daily_data']

        dates = [item['date'] for item in daily_data]
        paid_revenue = [item['paid_revenue'] for item in daily_data]
        unpaid_revenue = [item['unpaid_revenue'] for item in daily_data]

        # رسم نمودار
        plt.figure(figsize=(12, 8))

        plt.bar(dates, paid_revenue, color='green', label='پرداخت شده')
        plt.bar(dates, unpaid_revenue, bottom=paid_revenue, color='red', label='پرداخت نشده')

        plt.title(f'گزارش درآمد پارکینگ - {parking_lot_name}')
        plt.xlabel('تاریخ')
        plt.ylabel('درآمد (تومان)')
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()

        # ایجاد دایرکتوری برای ذخیره فایل
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        # ذخیره فایل
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        file_path = os.path.join(reports_dir, f"revenue_{parking_lot_name.replace(' ', '_')}_{date_range}.png")
        plt.savefig(file_path)
        plt.close()

        return file_path

    except Exception as e:
        print(f"Error creating revenue chart: {str(e)}")
        return None


def create_traffic_chart(data, parking_lot_name, start_date, end_date):
    """
    ایجاد نمودار برای گزارش ترافیک

    Args:
        data: داده‌های گزارش
        parking_lot_name: نام پارکینگ
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        مسیر فایل نمودار
    """
    try:
        # تنظیم فونت برای پشتیبانی از زبان فارسی
        plt.rcParams['font.family'] = 'DejaVu Sans'

        # ایجاد دیتافریم
        daily_data = data['daily_data']

        dates = [item['date'] for item in daily_data]
        entries = [item['entries'] for item in daily_data]
        exits = [item['exits'] for item in daily_data]

        # رسم نمودار
        plt.figure(figsize=(12, 8))

        x = range(len(dates))
        width = 0.35

        plt.bar([i - width / 2 for i in x], entries, width, color='blue', label='ورود')
        plt.bar([i + width / 2 for i in x], exits, width, color='orange', label='خروج')

        plt.title(f'گزارش ترافیک پارکینگ - {parking_lot_name}')
        plt.xlabel('تاریخ')
        plt.ylabel('تعداد خودروها')
        plt.xticks(x, dates, rotation=45)
        plt.legend()
        plt.tight_layout()

        # ایجاد دایرکتوری برای ذخیره فایل
        reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
        os.makedirs(reports_dir, exist_ok=True)

        # ذخیره فایل
        date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
        file_path = os.path.join(reports_dir, f"traffic_{parking_lot_name.replace(' ', '_')}_{date_range}.png")
        plt.savefig(file_path)
        plt.close()

        return file_path

    except Exception as e:
        print(f"Error creating traffic chart: {str(e)}")
        return None


@shared_task
def generate_financial_report(report_id):
    """
    تسک برای تولید گزارش مالی به صورت ناهمگام

    Args:
        report_id: شناسه گزارش
    """
    try:
        # دریافت گزارش
        report = FinancialReport.objects.get(id=report_id)

        # به‌روزرسانی وضعیت
        report.status = Report.PENDING
        report.save()

        # دریافت اطلاعات مورد نیاز
        start_date = report.start_date
        end_date = report.end_date
        report_type = report.financial_report_type

        # فیلتر داده‌ها بر اساس بازه زمانی
        payments = Payment.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )

        # داده‌های گزارش
        report_data = {
            'report_type': report_type,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'generated_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data': {}
        }

        # تولید گزارش بر اساس نوع
        if report_type == FinancialReport.REVENUE:
            # گزارش درآمد
            total_revenue, report_data['data'] = generate_financial_revenue_report(payments, start_date, end_date)
            chart_file = create_financial_revenue_chart(report_data['data'], start_date, end_date)

            # به‌روزرسانی مقادیر مالی
            report.total_revenue = total_revenue
            report.total_expenses = 0
            report.net_profit = total_revenue

        elif report_type == FinancialReport.EXPENSES:
            # گزارش هزینه‌ها
            total_expenses, report_data['data'] = generate_financial_expenses_report(start_date, end_date)
            chart_file = create_financial_expenses_chart(report_data['data'], start_date, end_date)

            # به‌روزرسانی مقادیر مالی
            report.total_revenue = 0
            report.total_expenses = total_expenses
            report.net_profit = -total_expenses

        elif report_type == FinancialReport.PROFIT_LOSS:
            # گزارش سود و زیان
            total_revenue, revenue_data = generate_financial_revenue_report(payments, start_date, end_date)
            total_expenses, expenses_data = generate_financial_expenses_report(start_date, end_date)
            net_profit = total_revenue - total_expenses

            report_data['data'] = {
                'total_revenue': round(float(total_revenue), 2),
                'total_expenses': round(float(total_expenses), 2),
                'net_profit': round(float(net_profit), 2),
                'revenue_data': revenue_data,
                'expenses_data': expenses_data
            }

            chart_file = create_financial_profit_loss_chart(report_data['data'], start_date, end_date)

            # به‌روزرسانی مقادیر مالی
            report.total_revenue = total_revenue
            report.total_expenses = total_expenses
            report.net_profit = net_profit

        # ذخیره داده‌های گزارش
        report.data = report_data

        # ذخیره فایل گزارش
        if chart_file:
            # مسیر فایل نسبت به MEDIA_ROOT
            relative_path = os.path.relpath(chart_file, settings.MEDIA_ROOT)
            report.file = relative_path

        # به‌روزرسانی وضعیت
        report.status = Report.COMPLETED
        report.save()

        return True

    except FinancialReport.DoesNotExist:
        return False
    except Exception as e:
        # ثبت خطا و به‌روزرسانی وضعیت
        if 'report' in locals():
            report.status = Report.FAILED
            report.data = {'error': str(e)}
            report.save()

        return False


def generate_financial_revenue_report(payments, start_date, end_date):
    """
    تولید داده‌های گزارش درآمد مالی

    Args:
        payments: پرداخت‌ها
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        کل درآمد و داده‌های گزارش
    """
    # تعداد روزها
    days = (end_date - start_date).days + 1

    # آماده‌سازی داده‌ها
    daily_data = []
    current_date = start_date

    # کل درآمد
    total_revenue = payments.filter(status=Payment.COMPLETED).aggregate(Sum('amount'))['amount__sum'] or 0

    # درآمد به تفکیک نوع
    revenue_by_type = []
    for payment_type, display_type in Payment.PAYMENT_TYPE_CHOICES:
        type_payments = payments.filter(
            payment_type=payment_type,
            status=Payment.COMPLETED
        )

        type_amount = type_payments.aggregate(Sum('amount'))['amount__sum'] or 0

        revenue_by_type.append({
            'payment_type': display_type,
            'amount': round(float(type_amount), 2),
            'count': type_payments.count(),
            'percentage': round(float(type_amount / total_revenue * 100), 2) if total_revenue > 0 else 0
        })

    # درآمد روزانه
    for _ in range(days):
        date_str = current_date.strftime('%Y-%m-%d')

        # پرداخت‌های روز
        day_payments = payments.filter(
            created_at__date=current_date,
            status=Payment.COMPLETED
        )

        # کل درآمد روز
        day_revenue = day_payments.aggregate(Sum('amount'))['amount__sum'] or 0

        # درآمد روز به تفکیک نوع
        day_revenue_by_type = []
        for payment_type, display_type in Payment.PAYMENT_TYPE_CHOICES:
            type_payments = day_payments.filter(payment_type=payment_type)
            type_amount = type_payments.aggregate(Sum('amount'))['amount__sum'] or 0

            day_revenue_by_type.append({
                'payment_type': display_type,
                'amount': round(float(type_amount), 2),
                'count': type_payments.count()
            })

        daily_data.append({
            'date': date_str,
            'total_revenue': round(float(day_revenue), 2),
            'revenue_by_type': day_revenue_by_type
        })

        current_date += timedelta(days=1)

    # ساختار نهایی گزارش
    return total_revenue, {
        'total_revenue': round(float(total_revenue), 2),
        'total_payments': payments.filter(status=Payment.COMPLETED).count(),
        'revenue_by_type': revenue_by_type,
        'daily_data': daily_data
    }


def generate_financial_expenses_report(start_date, end_date):
    """
    تولید داده‌های گزارش هزینه‌های مالی

    Args:
        start_date: تاریخ شروع
        end_date: تاریخ پایان

    Returns:
        کل هزینه‌ها و داده‌های گزارش
    """
    # این تابع می‌تواند هزینه‌های واقعی را از سیستم حسابداری دریافت کند
    # اما در اینجا برای نمونه، هزینه‌های ثابت و متغیر را شبیه‌سازی می‌کنیم

    # تعداد روزها
    days = (end_date - start_date).days + 1

    # هزینه‌های ثابت ماهانه
    monthly_fixed_expenses = {
        'اجاره': 15000000,
        'حقوق کارکنان': 25000000,
        'بیمه': 5000000,
        'نگهداری سیستم': 2000000
    }

    # هزینه‌های متغیر روزانه
    daily_variable_expenses = {
        'برق و آب': 100000,
        'تعمیرات': 50000,
        'متفرقه': 30000
    }

    # آماده‌سازی داده‌ها
    daily_data = []
    current_date = start_date
    total_expenses = 0

    for _ in range(days):
        date_str = current_date.strftime('%Y-%m-%d')

        # هزینه‌های ثابت روزانه (سهم روزانه از هزینه‌های ماهانه)
        day_fixed_expenses = {}
        day_fixed_total = 0

        for expense_name, expense_amount in monthly_fixed_expenses.items():
            day_amount = expense_amount / 30  # تقسیم بر 30 روز
            day_fixed_expenses[expense_name] = day_amount
            day_fixed_total += day_amount

        # هزینه‌های متغیر روزانه
        day_variable_expenses = {}
        day_variable_total = 0

        for expense_name, expense_amount in daily_variable_expenses.items():
            # افزودن تغییرات تصادفی به هزینه‌های متغیر
            import random
            variation = random.uniform(0.8, 1.2)
            day_amount = expense_amount * variation

            day_variable_expenses[expense_name] = day_amount
            day_variable_total += day_amount

        # کل هزینه‌های روز
        day_total = day_fixed_total + day_variable_total
        total_expenses += day_total

        daily_data.append({
            'date': date_str,
            'fixed_expenses': {
                'total': round(day_fixed_total, 2),
                'details': {k: round(v, 2) for k, v in day_fixed_expenses.items()}
            },
            'variable_expenses': {
                'total': round(day_variable_total, 2),
                'details': {k: round(v, 2) for k, v in day_variable_expenses.items()}
            },
            'total': round(day_total, 2)
        })

        current_date += timedelta(days=1)

        # ساختار نهایی گزارش
    return total_expenses, {
        'total_expenses': round(total_expenses, 2),
        'fixed_expenses': {
            'total': round(sum(monthly_fixed_expenses.values()) / 30 * days, 2),
            'details': {k: round(v / 30 * days, 2) for k, v in monthly_fixed_expenses.items()}
        },
        'variable_expenses': {
            'total': round(total_expenses - (sum(monthly_fixed_expenses.values()) / 30 * days), 2)
        },
        'daily_data': daily_data
    }

    def create_financial_revenue_chart(data, start_date, end_date):
        """
        ایجاد نمودار برای گزارش درآمد مالی

        Args:
            data: داده‌های گزارش
            start_date: تاریخ شروع
            end_date: تاریخ پایان

        Returns:
            مسیر فایل نمودار
        """
        try:
            # تنظیم فونت برای پشتیبانی از زبان فارسی
            plt.rcParams['font.family'] = 'DejaVu Sans'

            # ایجاد دیتافریم
            daily_data = data['daily_data']

            dates = [item['date'] for item in daily_data]
            revenues = [item['total_revenue'] for item in daily_data]

            # رسم نمودار
            plt.figure(figsize=(12, 8))
            plt.bar(dates, revenues, color='green')
            plt.title(f'گزارش درآمد مالی')
            plt.xlabel('تاریخ')
            plt.ylabel('درآمد (تومان)')
            plt.xticks(rotation=45)
            plt.tight_layout()

            # ایجاد دایرکتوری برای ذخیره فایل
            reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
            os.makedirs(reports_dir, exist_ok=True)

            # ذخیره فایل
            date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
            file_path = os.path.join(reports_dir, f"financial_revenue_{date_range}.png")
            plt.savefig(file_path)
            plt.close()

            # ایجاد نمودار دایره‌ای برای درآمد به تفکیک نوع
            plt.figure(figsize=(10, 8))

            revenue_by_type = data['revenue_by_type']
            labels = [item['payment_type'] for item in revenue_by_type]
            amounts = [item['amount'] for item in revenue_by_type]

            if sum(amounts) > 0:  # اگر درآمدی وجود داشته باشد
                plt.pie(amounts, labels=labels, autopct='%1.1f%%', startangle=140)
                plt.axis('equal')
                plt.title('درآمد به تفکیک نوع')

                # ذخیره فایل
                file_path2 = os.path.join(reports_dir, f"financial_revenue_by_type_{date_range}.png")
                plt.savefig(file_path2)
                plt.close()

            return file_path

        except Exception as e:
            print(f"Error creating financial revenue chart: {str(e)}")
            return None

    def create_financial_expenses_chart(data, start_date, end_date):
        """
        ایجاد نمودار برای گزارش هزینه‌های مالی

        Args:
            data: داده‌های گزارش
            start_date: تاریخ شروع
            end_date: تاریخ پایان

        Returns:
            مسیر فایل نمودار
        """
        try:
            # تنظیم فونت برای پشتیبانی از زبان فارسی
            plt.rcParams['font.family'] = 'DejaVu Sans'

            # ایجاد دیتافریم
            daily_data = data['daily_data']

            dates = [item['date'] for item in daily_data]
            fixed_expenses = [item['fixed_expenses']['total'] for item in daily_data]
            variable_expenses = [item['variable_expenses']['total'] for item in daily_data]

            # رسم نمودار
            plt.figure(figsize=(12, 8))

            plt.bar(dates, fixed_expenses, color='blue', label='هزینه‌های ثابت')
            plt.bar(dates, variable_expenses, bottom=fixed_expenses, color='red', label='هزینه‌های متغیر')

            plt.title(f'گزارش هزینه‌های مالی')
            plt.xlabel('تاریخ')
            plt.ylabel('هزینه (تومان)')
            plt.legend()
            plt.xticks(rotation=45)
            plt.tight_layout()

            # ایجاد دایرکتوری برای ذخیره فایل
            reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
            os.makedirs(reports_dir, exist_ok=True)

            # ذخیره فایل
            date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
            file_path = os.path.join(reports_dir, f"financial_expenses_{date_range}.png")
            plt.savefig(file_path)
            plt.close()

            # ایجاد نمودار دایره‌ای برای هزینه‌های ثابت
            plt.figure(figsize=(10, 8))

            fixed_expenses = data['fixed_expenses']['details']
            labels = list(fixed_expenses.keys())
            amounts = list(fixed_expenses.values())

            plt.pie(amounts, labels=labels, autopct='%1.1f%%', startangle=140)
            plt.axis('equal')
            plt.title('هزینه‌های ثابت به تفکیک نوع')

            # ذخیره فایل
            file_path2 = os.path.join(reports_dir, f"financial_fixed_expenses_{date_range}.png")
            plt.savefig(file_path2)
            plt.close()

            return file_path

        except Exception as e:
            print(f"Error creating financial expenses chart: {str(e)}")
            return None

    def create_financial_profit_loss_chart(data, start_date, end_date):
        """
        ایجاد نمودار برای گزارش سود و زیان

        Args:
            data: داده‌های گزارش
            start_date: تاریخ شروع
            end_date: تاریخ پایان

        Returns:
            مسیر فایل نمودار
        """
        try:
            # تنظیم فونت برای پشتیبانی از زبان فارسی
            plt.rcParams['font.family'] = 'DejaVu Sans'

            # ایجاد نمودار ستونی برای مقایسه درآمد، هزینه و سود
            plt.figure(figsize=(8, 8))

            labels = ['درآمد', 'هزینه', 'سود خالص']
            values = [data['total_revenue'], data['total_expenses'], data['net_profit']]
            colors = ['green', 'red', 'blue']

            plt.bar(labels, values, color=colors)
            plt.title(f'گزارش سود و زیان')
            plt.ylabel('مبلغ (تومان)')
            plt.tight_layout()

            # ایجاد دایرکتوری برای ذخیره فایل
            reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
            os.makedirs(reports_dir, exist_ok=True)

            # ذخیره فایل
            date_range = f"{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"
            file_path = os.path.join(reports_dir, f"financial_profit_loss_{date_range}.png")
            plt.savefig(file_path)
            plt.close()

            # ایجاد نمودار روند درآمد و هزینه روزانه
            daily_revenue = [item['total_revenue'] for item in data['revenue_data']['daily_data']]
            daily_expense = [item['total'] for item in data['expenses_data']['daily_data']]
            dates = [item['date'] for item in data['revenue_data']['daily_data']]

            plt.figure(figsize=(12, 8))
            plt.plot(dates, daily_revenue, 'g-', label='درآمد')
            plt.plot(dates, daily_expense, 'r-', label='هزینه')
            plt.fill_between(dates, daily_revenue, daily_expense,
                             where=[r > e for r, e in zip(daily_revenue, daily_expense)],
                             facecolor='blue', alpha=0.3, label='سود')
            plt.fill_between(dates, daily_revenue, daily_expense,
                             where=[r <= e for r, e in zip(daily_revenue, daily_expense)],
                             facecolor='orange', alpha=0.3, label='زیان')

            plt.title('روند درآمد و هزینه روزانه')
            plt.xlabel('تاریخ')
            plt.ylabel('مبلغ (تومان)')
            plt.legend()
            plt.xticks(rotation=45)
            plt.tight_layout()

            # ذخیره فایل
            file_path2 = os.path.join(reports_dir, f"financial_daily_trend_{date_range}.png")
            plt.savefig(file_path2)
            plt.close()

            return file_path

        except Exception as e:
            print(f"Error creating financial profit/loss chart: {str(e)}")
            return None