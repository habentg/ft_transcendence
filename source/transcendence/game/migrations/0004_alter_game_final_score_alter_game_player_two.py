# Generated by Django 5.1 on 2024-12-15 06:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_alter_game_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='final_score',
            field=models.CharField(default='-', max_length=20),
        ),
        migrations.AlterField(
            model_name='game',
            name='player_two',
            field=models.CharField(default='AI', max_length=100),
        ),
    ]