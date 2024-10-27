# /friends - Get, Post
# /friends/1 - Get, Put, Delete
from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import *

friends_router = DefaultRouter()
friends_router.register(r'friends', FriendsViewSet, basename='friends')


# Add this to your urls.py
urlpatterns = [
    path('friend_request/<str:username>/', FriendRequestView.as_view(), name='friend_request'),
    # re_path(r'friend_request/<str:username>/?$', FriendRequestView.as_view(), name='friend_request'), # /friend
    # path('', include(friends_router.urls), name='friends'), # /friends
    # path('friends', include(friends_router.urls), name='friends'), # /friends/1
]