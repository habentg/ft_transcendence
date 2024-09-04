from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User Model
class Player(AbstractUser):
    username = models.CharField(max_length=150, unique=True, primary_key=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    password = models.CharField(max_length=150)
    tfa = models.BooleanField(default=False)
    secret = models.CharField(max_length=150, blank=True)
    verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return self.username

# # 2fa model
# class TwoFactorAuth(models.Model):
#     player = models.ForeignKey('Player', on_delete=models.CASCADE)
#     secret = models.CharField(max_length=150)
#     verified = models.BooleanField(default=False)

#     def __str__(self):
#         return self.player.username