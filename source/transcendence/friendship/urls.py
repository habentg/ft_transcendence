from .views import *
from django.urls import path

urlpatterns = [
    path('friend_request/<str:username>/', FriendRequestView.as_view(), name='friend_request'),
    path('accept_request/<str:username>/', FriendRequestResponseView.as_view(), name='accept_request'),
    path('profile/<str:username>', PlayerProfileView.as_view(), name='player_profile'),
]