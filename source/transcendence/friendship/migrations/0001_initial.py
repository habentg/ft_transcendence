# Generated by Django 5.1 on 2024-10-24 23:43

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FriendList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('friends', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='friend_list', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]