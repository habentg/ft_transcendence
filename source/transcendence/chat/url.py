from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from django.urls import include
from .views import *

notification_router = DefaultRouter()
notification_router.register(r'notifications', ChatViewSet, basename='chat_viewset')
