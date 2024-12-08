from .views import *
from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from django.urls import include

notification_router = DefaultRouter()
notification_router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = notification_router.urls
""" Regex explanation:
    -> the parameter is named 'username'
    -> the parameter is a string of alphanumeric characters and hyphens
    -> has to be one or more characters long
    -> and optionally ends with a slash
"""
urlpatterns += [
    re_path(r'^friend_request/(?P<username>[\w-]+)/?$', FriendRequestView.as_view(), name='friend_request'),
    re_path(r'^friend_request_response/(?P<username>[\w-]+)/?$', FriendRequestResponseView.as_view(), name='response_friend_request'),
    re_path(r'^chat/?$', ChatView.as_view(), name='chat_page'),
]

