# Generated by Django 5.1 on 2024-12-15 06:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_alter_game_final_score_alter_game_player_two'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='type',
            field=models.CharField(choices=[('AI', 'Against AI'), ('LOCAL', 'Locally Played'), ('TOURNAMENT', 'Played in Tournament')], default='AI', max_length=20),
        ),
    ]
