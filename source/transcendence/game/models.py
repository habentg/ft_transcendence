from django.db import models
from account.models import Player

""" table for game """
class Game(models.Model):
    GAME_TYPE = [
        ('AI', 'Against AI'),
        ('VERSUS', 'Player vs. Player'),
        ('TOURNAMENT', 'Played in Tournament')
    ]
    END_RESULT = [
        ('STARTED', 'Game Started'),
        ('WIN', 'You Won'),
        ('LOSE', 'You Lost'),
        ('CANCELLED', 'Game Cancelled')
    ]
    id = models.BigAutoField(primary_key=True)
    player_one = models.CharField(max_length=100, blank=False, null=False, default="player_one")
    player_two = models.CharField(max_length=100, blank=False, null=False, default="player_two")
    type = models.CharField(max_length=20, choices=GAME_TYPE, default='AI')
    final_score = models.CharField(max_length=20, blank=False, null=False, default="-")
    outcome = models.CharField(max_length=20, choices=END_RESULT, default='STARTED')
    start_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'game_table'
        ordering = ['id']


class Tournament(models.Model):
    id = models.BigAutoField(primary_key=True)
    games = models.ManyToManyField(Game)

    class Meta:
        db_table = 'tournament_table'
        ordering = ['id']

    def add_game(self, game):
        self.games.add(game)
        self.save()
