import pyotp
import time
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string

def generate_otp_secret():
    return pyotp.random_base32()

#DOC -> https://pypi.org/project/pyotp/
def send_2fa_code(player):
    player.secret = generate_otp_secret() # Random secret key for the player (instead of saving the OTP code)
    player.save()
    totp = pyotp.TOTP(player.secret, interval=90) # Create a TOTP object
    otp_code = totp.now()
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [player.email]
    subject = "OTP for Haben Pong"
    email_template_name = "app/OTP_email_template.txt"
    email_body = render_to_string(email_template_name, {'otp': otp_code})
    if send_mail(subject, email_body, from_email, recipient_list, fail_silently=False):
        return True
    return False