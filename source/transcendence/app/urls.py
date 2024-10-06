from django.urls import path, re_path
from .views import *
# from .views import Index, SignUpView, HomeView, SignInView, CsrfRequest, OauthCallback, Catch_All, PasswordReset, PassResetNewPass, PassResetConfirm, TwoFactorAuth, Auth_42, SignOutView, HealthCheck

urlpatterns = [
    path('', Index.as_view(), name='landing'),
    path('home/', HomeView.as_view(), name='home_page'),
    path('signup/', SignUpView.as_view(), name='signup_page'),
    path('signout/', SignOutView.as_view(), name='signout_page'),
    path('signin/', SignInView.as_view(), name='signin_page'),
    path('csrf_request/', CsrfRequest.as_view(), name='crf_request'),
    path('auth_42/', Auth_42.as_view(), name='auth_42'),
    path('oauth/', OauthCallback.as_view(), name='oauth'),
    path('password_reset/', PasswordReset.as_view(), name='password_reset'),
    re_path(r'^password_reset_newpass/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z\-]+)/?$', PassResetNewPass.as_view(), name='password_reset_newpass'),
    path('password_reset_confirm/', PassResetConfirm.as_view(), name='password_reset_newpass'),
    path('2fa/', TwoFactorAuth.as_view(), name='password_reset_newpass'),
    path('health/', HealthCheck.as_view(), name='health_check'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('delete_account/', DeleteAccount.as_view(), name='delete_account'),
    re_path(r'^(?!signup/|home/|signin/).*$', Catch_All.as_view(), name='404'),
]



""" 

    SELECT id, username, first_name, last_name, email, password, tfa, secret, verified, is_superuser, is_staff, is_active, date_joined, last_login FROM app_player;

 """