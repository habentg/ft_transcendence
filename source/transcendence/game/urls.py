from django.urls import path, re_path
from game.views import *
from .views import GameViewSet
from rest_framework.routers import DefaultRouter

game_router = DefaultRouter()
game_router.register(r'game_api', GameViewSet, basename='game_viewset')
urlpatterns = game_router.urls

urlpatterns += [
    re_path(r'^game/?$', GameView.as_view(), name='game'),
    re_path(r'^tournament/?$', TournamentView.as_view(), name='tournament'),
]