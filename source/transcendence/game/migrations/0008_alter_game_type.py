from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_alter_game_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='type',
            field=models.CharField(choices=[('AI', 'Against AI'), ('VERSUS', 'Player vs. Player'), ('TOURNAMENT', 'Played in Tournament')], default='AI', max_length=20),
        ),
    ]
