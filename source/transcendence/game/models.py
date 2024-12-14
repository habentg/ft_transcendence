from django.db import models
from account.models import Player

""" table for game """
class Game(models.Model):
    GAME_TYPE = [
        ('AI', 'Against AI'),
        ('LOCAL', 'Locally Played'),
        ('TOURNAMENT', 'Played in Tournament')
    ]
    END_RESULT = [
        ('WIN', 'Win'),
        ('LOSS', 'Loss'),
        ('CANCELLED', 'Cancelled')
    ]
    id = models.BigAutoField(primary_key=True)
    player_one = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="player_one")
    player_two = models.CharField(max_length=100, blank=False, null=False, default="Dummy")
    game_time = models.DateTimeField(auto_now_add=True)
    game_type = models.CharField(max_length=20, choices=GAME_TYPE)
    game_score = models.CharField(max_length=20, blank=True, null=True)
    game_outcome = models.CharField(max_length=20, choices=END_RESULT)

    class Meta:
        db_table = 'game_table'
        ordering = ['-game_time']