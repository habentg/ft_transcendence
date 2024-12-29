import pyotp
import time
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from others.auth_middleware import is_valid_token
from .models import Player
import string
import random
import jwt

def generate_otp_secret():
    return pyotp.random_base32()

#DOC -> https://pypi.org/project/pyotp/
def send_2fa_code(player):
    player.secret = generate_otp_secret() # Random secret key for the player (instead of saving the OTP code)
    player.save()
    totp = pyotp.TOTP(player.secret, interval=300) # Create a TOTP object
    otp_code = totp.now()
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [player.email]
    subject = "OTP for Haben Pong"
    email_template_name = "account/OTP_email_template.txt"
    email_body = render_to_string(email_template_name, {'otp': otp_code})
    if send_mail(subject, email_body, from_email, recipient_list, fail_silently=False):
        return True
    return False

def isUserisAuthenticated(request):
    if request.user.is_authenticated:
        return True
    token = request.COOKIES.get('access_token')
    if token and is_valid_token(token):
        return True
    return False

def generate_username():
	length = 7
	characters = string.ascii_letters + string.digits
	random_string = ''.join(random.choice(characters) for _ in range(length))
	return random_string

def createGuestPlayer() -> Player:
	anon = Player.objects.create(
		username = generate_username(),
		full_name = 'Guest Player',
	)
	guest_email = f'{anon.username}@guest_email.com'
	anon.email = guest_email
	anon.set_unusable_password()
	anon.is_guest = True
	anon.save()
	return anon

def getPlayerFromToken(refresh_token):
    refresh_token_data = jwt.decode(refresh_token, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
    user_id = refresh_token_data['user_id']
    player = Player.objects.get(id=user_id)
    return player