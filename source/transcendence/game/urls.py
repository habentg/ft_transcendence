from django.urls import path, re_path
from game.views import *
# from .views import GameViewSet
# from rest_framework.routers import DefaultRouter

# game_router = DefaultRouter()
# game_router.register(r'game_api', GameViewSet, basename='game_viewset')
# urlpatterns = game_router.urls

urlpatterns = [
    re_path(r'^game/?$', GameView.as_view(), name='game'),
    re_path(r'^game_history/?$', PlayerGameHistoryView.as_view(), name='game_history'),
    re_path(r'^tournament/?$', TournamentView.as_view(), name='tournament'),
    re_path(r'^retrieve_tournament/?$', TournamentRetrievalView.as_view(), name='tournament_retrieval'),
    re_path(r'^leaderboard/?$', LeaderBoardView.as_view(), name='leaderboard'),
]