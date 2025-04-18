# Generated by Django 5.1 on 2024-12-16 10:15

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0009_player_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='blocked_users',
            field=models.ManyToManyField(blank=True, related_name='players_blocked_list', to=settings.AUTH_USER_MODEL),
        ),
    ]
