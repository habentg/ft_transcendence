from django.urls import path, re_path, include
from .views import *

urlpatterns = [
    re_path(r'^signup/?$', SignUpView.as_view(), name='signup_page'),
    re_path(r'^signin/?$', SignInView.as_view(), name='signin_page'),
    re_path(r'^signout/?$', SignOutView.as_view(), name='signout_page'),
    re_path(r'^auth_42/?$', Auth_42.as_view(), name='auth_42'),
    re_path(r'^oauth/?$', OauthCallback.as_view(), name='oauth'),
    re_path(r'^password_reset/?$', PasswordReset.as_view(), name='password_reset'),
    re_path(r'^password_reset_newpass/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z\-]+)/?$', PassResetNewPass.as_view(), name='password_reset_newpass'),
    re_path(r'^2fa/?$', TwoFactorAuth.as_view(), name='2fa'),
    re_path(r'^2fa_toggle/?$', TwoFactorSetUpToggle.as_view(), name='2fa_toggle'),
    re_path(r'^update_profile/?$', PlayerProfileUpdatingView.as_view(), name='update_profile'),
    re_path(r'^profile/(?P<username>[\w-]+)/?$', PlayerProfileView.as_view(), name='player_profile'),
    re_path(r'^settings/?$', SettingsView.as_view(), name='settings'),
    re_path(r'^anonymize/?$', AnonymizePlayer.as_view(), name='anonymize'),
    re_path(r'^guest_player/?$', TempPlayer.as_view(), name='temp_player'),
]