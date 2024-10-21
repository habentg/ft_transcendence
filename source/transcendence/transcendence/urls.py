"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from friendship.views import FriendsViewSet
# /friends - Get, Post
# /friends/1 - Get, Put, Delete
from rest_framework.routers import DefaultRouter

friends_router = DefaultRouter()
friends_router.register(r'friends', FriendsViewSet, basename='friends')
urlpatterns = [
    path('admin', admin.site.urls),
    path('', include('app.urls')),
    path('', include(friends_router.urls), name='friends'), # /friends
]
# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)