# Generated by Django 5.1 on 2024-11-21 03:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_player_is_guest'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='date_joined',
        ),
        migrations.RemoveField(
            model_name='player',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='player',
            name='is_staff',
        ),
        migrations.RemoveField(
            model_name='player',
            name='last_name',
        ),
    ]