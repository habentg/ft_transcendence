# /friends - Get, Post
# /friends/1 - Get, Put, Delete
# from django.urls import path, re_path, include
# from rest_framework.routers import DefaultRouter
# from .views import *

# friends_router = DefaultRouter()
# friends_router.register(r'friends', FriendsViewSet, basename='friends')


# # Add this to your urls.py
# urlpatterns = [
#     path('', include(friends_router.urls), name='friends'), # /friends
# ]