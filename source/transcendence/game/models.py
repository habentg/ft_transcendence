from django.db import models

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
	final_score = models.CharField(max_length=20, blank=False, null=False, default="-")
	player_two = models.CharField(max_length=100, blank=False, null=False, default="player_two")
	type = models.CharField(max_length=20, choices=GAME_TYPE, default='AI')
	outcome = models.CharField(max_length=20, choices=END_RESULT, default='CANCELLED')
	start_time = models.DateTimeField(auto_now_add=True)
	tournament_id = models.BigIntegerField(null=True, blank=True, default=None)

	class Meta:
		db_table = 'game_table'
		ordering = ['id']
		
class Tournament(models.Model):
	id = models.BigAutoField(primary_key=True)
	type = models.IntegerField(default=4)
	games = models.ManyToManyField(Game)

	class Meta:
		db_table = 'tournament_table'
		ordering = ['id']

	def add_game(self, game):
		self.games.add(game)
		self.save()
