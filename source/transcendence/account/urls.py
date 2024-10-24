from django.urls import path, re_path, include
from .views import *


# Add this to your urls.py
urlpatterns = [
    re_path(r'^signup/?$', SignUpView.as_view(), name='signup_page'),
    re_path(r'^signin/?$', SignInView.as_view(), name='signin_page'),
    re_path(r'^signout/?$', SignOutView.as_view(), name='signout_page'),
    re_path(r'^auth_42/?$', Auth_42.as_view(), name='auth_42'),
    re_path(r'^oauth/?$', OauthCallback.as_view(), name='oauth'),
    re_path(r'^password_reset/?$', PasswordReset.as_view(), name='password_reset'),
    re_path(r'^password_reset_newpass/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z\-]+)/?$', PassResetNewPass.as_view(), name='password_reset_newpass'),
    re_path(r'^password_reset_confirm/?$', PassResetConfirm.as_view(), name='password_reset_newpass'),
    re_path(r'^2fa/?$', TwoFactorAuth.as_view(), name='password_reset_newpass'),
    re_path(r'^profile/?$', ProfileView.as_view(), name='profile'),
    re_path(r'^update_password/?$', UpdatePlayerPassword.as_view(), name='profile'),
]