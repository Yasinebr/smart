# Generated by Django 5.1.7 on 2025-03-15 11:11

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FaceDetection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('input_image', models.ImageField(upload_to='face_detections/input/', verbose_name='input image')),
                ('output_image', models.ImageField(blank=True, null=True, upload_to='face_detections/output/', verbose_name='output image')),
                ('face_embedding', models.BinaryField(blank=True, null=True, verbose_name='face embedding')),
                ('face_count', models.PositiveIntegerField(default=0, verbose_name='face count')),
                ('faces_data', models.JSONField(blank=True, null=True, verbose_name='faces data')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=10, verbose_name='status')),
                ('processing_time', models.FloatField(blank=True, null=True, verbose_name='processing time (s)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'face detection',
                'verbose_name_plural': 'face detections',
            },
        ),
        migrations.CreateModel(
            name='LicensePlateDetection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('input_image', models.ImageField(upload_to='license_plate_detections/input/', verbose_name='input image')),
                ('output_image', models.ImageField(blank=True, null=True, upload_to='license_plate_detections/output/', verbose_name='output image')),
                ('license_plate_text', models.CharField(blank=True, max_length=20, null=True, verbose_name='license plate text')),
                ('confidence', models.FloatField(default=0.0, verbose_name='confidence')),
                ('bounding_box', models.JSONField(blank=True, null=True, verbose_name='bounding box')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending', max_length=10, verbose_name='status')),
                ('processing_time', models.FloatField(blank=True, null=True, verbose_name='processing time (s)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'license plate detection',
                'verbose_name_plural': 'license plate detections',
            },
        ),
    ]
