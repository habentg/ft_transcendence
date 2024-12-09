from django.urls import path, re_path
from others.views import *

urlpatterns = [
    path('', LandingPageView.as_view(), name='landing'),
    re_path(r'^home/?$', HomeView.as_view(), name='home_page'),
    re_path(r'^health/?$', HealthCheck.as_view(), name='health_check'),
    re_path(r'^csrf_request/?$', CsrfRequest.as_view(), name='crf_request'),
    re_path(r'^search/?$', SearchView.as_view(), name='search_users'),
    re_path(r'^about/?$', AboutView.as_view(), name='about'),
    re_path(r'^privacy/?$', PrivacyView.as_view(), name='privacy'),
    re_path(r'^terms/?$', TermsView.as_view(), name='terms'),
    re_path(r'^paginated_search/?$', PaginatedSearch.as_view(), name='paginated_search'),
    re_path(r'^game/?$', GameView.as_view(), name='game'),
    # re_path(r'^gameai/?$', GameAIView.as_view(), name='gameai'),
]
