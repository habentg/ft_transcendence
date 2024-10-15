from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

def validate_image_size(image):
    file_size = image.file.size
    limit_mb = 5
    if file_size > limit_mb * 1024 * 1024:
        raise ValidationError(f"Max size of file is {limit_mb} MB")

#Custom User Model
class Player(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    password = models.CharField(max_length=150)
    tfa = models.BooleanField(default=False)
    secret = models.CharField(max_length=150, blank=True)
    verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        # default='profile_pics/default_profile_pic.jpeg',  # Set the default image
        validators=[validate_image_size]
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return self.username
