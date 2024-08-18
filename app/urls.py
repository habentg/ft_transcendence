from django.urls import path, re_path
from .views import HomeView, UserRegistrationAPIView, SPAView

urlpatterns = [
    path('api/home/', HomeView.as_view(), name='home_page'),
    path('api/signin/', HomeView.as_view(), name='signin_page'),
    path('api/signup/', UserRegistrationAPIView.as_view(), name='signup_page'),
    path('api/signout/', HomeView.as_view(), name='signout_page'),
    re_path(r'^.*$', SPAView.as_view(), name='spa'),
]