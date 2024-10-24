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
from others.views import Catch_All
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from friendship.views import *

friends_router = DefaultRouter()
friends_router.register(r'friends', FriendsViewSet, basename='friends')

urlpatterns = [
    path('admin', admin.site.urls),
    path('', include('others.urls')),
    path('', include('account.urls')),
    path('', include(friends_router.urls), name='friends'), # /friends
    # path('', include('friendship.urls')),
    # path('game/', include('game.urls')),
    # path('other/', include('other.urls')),
    path('', Catch_All.as_view, name='404')#404
]
