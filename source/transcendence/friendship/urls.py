from .views import *
from django.urls import path, re_path

""" Regex explanation:
    -> the parameter is named 'username'
    -> the parameter is a string of alphanumeric characters and hyphens
    -> has to be one or more characters long
    -> and optionally ends with a slash
"""
urlpatterns = [
    re_path(r'^friend_request/(?P<username>[\w-]+)/?$', FriendRequestView.as_view(), name='friend_request'),
    re_path(r'^friend_request_response/(?P<username>[\w-]+)/?$', FriendRequestResponseView.as_view(), name='response_friend_request'),
    re_path(r'^profile/(?P<username>[\w-]+)/?$', PlayerProfileView.as_view(), name='player_profile'),
]