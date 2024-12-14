from django.urls import path, re_path
from game.views import *
from .views import GameViewSet
from rest_framework.routers import DefaultRouter

game_router = DefaultRouter()
game_router.register(r'game_viewset', GameViewSet, basename='game_viewset')
urlpatterns = game_router.urls