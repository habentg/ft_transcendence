# Generated by Django 5.1 on 2024-12-15 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_alter_game_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='outcome',
            field=models.CharField(choices=[('STARTED', 'Game Started'), ('WIN', 'You Won'), ('LOSE', 'You Lost'), ('CANCELLED', 'Game Cancelled')], default='STARTED', max_length=20),
        ),
    ]
