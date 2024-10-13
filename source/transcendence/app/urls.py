from django.urls import path, re_path
from .views import *
from django.http import HttpResponse
from django.conf import settings
import os
from django.conf import settings

def debug_media(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type="image/jpeg")
    return HttpResponse("File not found", status=404)

# Add this to your urls.py
urlpatterns = [
    path('debug-media/<path:path>', debug_media),
    path('', Index.as_view(), name='landing'),
    re_path(r'^home/?$', HomeView.as_view(), name='home_page'),
    re_path(r'^signup/?$', SignUpView.as_view(), name='signup_page'),
    re_path(r'^signin/?$', SignInView.as_view(), name='signin_page'),
    re_path(r'^signout/?$', SignOutView.as_view(), name='signout_page'),
    re_path(r'^csrf_request/?$', CsrfRequest.as_view(), name='crf_request'),
    re_path(r'^auth_42/?$', Auth_42.as_view(), name='auth_42'),
    re_path(r'^oauth/?$', OauthCallback.as_view(), name='oauth'),
    re_path(r'^password_reset/?$', PasswordReset.as_view(), name='password_reset'),
    re_path(r'^password_reset_newpass/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z\-]+)/?$', PassResetNewPass.as_view(), name='password_reset_newpass'),
    re_path(r'^password_reset_confirm/?$', PassResetConfirm.as_view(), name='password_reset_newpass'),
    re_path(r'^2fa/?$', TwoFactorAuth.as_view(), name='password_reset_newpass'),
    re_path(r'^health/?$', HealthCheck.as_view(), name='health_check'),
    re_path(r'^profile/?$', ProfileView.as_view(), name='profile'),
    re_path(r'^.*$', Catch_All.as_view(), name='catch_all'),
]



""" 

    SELECT id, username, first_name, last_name, email, password, tfa, secret, verified, is_superuser, is_staff, is_active, date_joined, last_login FROM app_player;

 """
