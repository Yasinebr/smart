# Generated by Django 5.1.7 on 2025-03-15 11:11

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('parking', '0002_initial'),
        ('reports', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dashboards', to=settings.AUTH_USER_MODEL, verbose_name='مالک'),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='parking',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='dashboards', to='parking.parkinglocation', verbose_name='پارکینگ'),
        ),
        migrations.AddField(
            model_name='dashboardwidget',
            name='dashboard',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='widgets', to='reports.dashboard', verbose_name='داشبورد'),
        ),
        migrations.CreateModel(
            name='FinancialReport',
            fields=[
                ('report_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='reports.report')),
                ('financial_report_type', models.CharField(choices=[('revenue', 'Revenue'), ('expenses', 'Expenses'), ('profit_loss', 'Profit & Loss')], default='revenue', max_length=15, verbose_name='financial report type')),
                ('total_revenue', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='total revenue')),
                ('total_expenses', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='total expenses')),
                ('net_profit', models.DecimalField(decimal_places=2, default=0, max_digits=12, verbose_name='net profit')),
            ],
            options={
                'verbose_name': 'financial report',
                'verbose_name_plural': 'financial reports',
            },
            bases=('reports.report',),
        ),
        migrations.AddField(
            model_name='report',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_reports', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='monthlyreport',
            unique_together={('year', 'month')},
        ),
        migrations.AddField(
            model_name='reportschedule',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_schedules', to=settings.AUTH_USER_MODEL, verbose_name='ایجاد کننده'),
        ),
        migrations.AddField(
            model_name='reportschedule',
            name='parking',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='report_schedules', to='parking.parkinglocation', verbose_name='پارکینگ'),
        ),
        migrations.AddField(
            model_name='reportschedule',
            name='recipients',
            field=models.ManyToManyField(related_name='report_schedules', to=settings.AUTH_USER_MODEL, verbose_name='دریافت\u200cکنندگان'),
        ),
        migrations.CreateModel(
            name='ParkingReport',
            fields=[
                ('report_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='reports.report')),
                ('parking_report_type', models.CharField(choices=[('occupancy', 'Occupancy'), ('revenue', 'Revenue'), ('traffic', 'Traffic')], default='occupancy', max_length=10, verbose_name='parking report type')),
                ('parking_lot', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='parking.parkinglot')),
            ],
            options={
                'verbose_name': 'parking report',
                'verbose_name_plural': 'parking reports',
            },
            bases=('reports.report',),
        ),
    ]
