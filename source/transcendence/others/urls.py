from django.urls import path, re_path
from others.views import *

urlpatterns = [
    path('', LandingPageView.as_view(), name='landing'),
    re_path(r'^home/?$', HomeView.as_view(), name='home_page'),
    re_path(r'^health/?$', HealthCheck.as_view(), name='health_check'),
    re_path(r'^csrf_request/?$', CsrfRequest.as_view(), name='crf_request'),
]
