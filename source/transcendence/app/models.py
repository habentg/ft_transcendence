from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom User Model
class Player(AbstractUser):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField()
    password = models.CharField(max_length=150)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'password']

    def __str__(self):
        return self.username