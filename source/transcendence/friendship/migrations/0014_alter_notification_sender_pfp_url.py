# Generated by Django 5.1 on 2024-12-07 15:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('friendship', '0013_notification_sender_pfp_url_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='sender_pfp_url',
            field=models.CharField(default=None, max_length=150, null=True),
        ),
    ]
