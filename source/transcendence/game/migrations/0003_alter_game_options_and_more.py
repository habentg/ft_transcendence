# Generated by Django 5.1 on 2024-12-15 05:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_alter_game_game_outcome_alter_game_game_score_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='game',
            options={'ordering': ['-start_time']},
        ),
        migrations.RenameField(
            model_name='game',
            old_name='game_score',
            new_name='final_score',
        ),
        migrations.RenameField(
            model_name='game',
            old_name='game_outcome',
            new_name='outcome',
        ),
        migrations.RenameField(
            model_name='game',
            old_name='game_time',
            new_name='start_time',
        ),
        migrations.RenameField(
            model_name='game',
            old_name='game_type',
            new_name='type',
        ),
    ]
