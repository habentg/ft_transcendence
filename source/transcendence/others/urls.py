from django.urls import path, re_path, include
from others.views import *


# Add this to your urls.py
urlpatterns = [
    path('', LandingPageView.as_view(), name='landing'),
    re_path(r'^home/?$', HomeView.as_view(), name='home_page'),
    re_path(r'^health/?$', HealthCheck.as_view(), name='health_check'),
    re_path(r'^csrf_request/?$', CsrfRequest.as_view(), name='crf_request'),
    re_path(r'^player_profile/<username>?$', PlayerProfileView.as_view(), name='player_profile'),
]
