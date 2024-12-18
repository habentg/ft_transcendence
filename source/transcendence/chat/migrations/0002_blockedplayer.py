# Generated by Django 5.1 on 2024-12-16 07:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BlockedPlayer',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('blocked_players', models.ManyToManyField(related_name='blocked_players', to=settings.AUTH_USER_MODEL)),
                ('blocker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blocker', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'blocked_player',
            },
        ),
    ]
