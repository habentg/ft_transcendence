from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.core.validators import MinLengthValidator
from friendship.models import *

""" image file size validation """
def validate_image_size(image):
    if hasattr(image, 'size'):
        file_size = image.size # This is for ImageField
    elif hasattr(image, 'file'):
        file_size = image.file.size # This is for FileField
    else:
        file_size = image.getbuffer().nbytes # This is for InMemoryUploadedFile
    limit_mb = 5
    if file_size > limit_mb * 1024 * 1024:
        raise ValidationError(f"Max size of file is {limit_mb} MB")

""" Custom User Manager 
    - overode create_user and create_superuser methods
    mainly because i want the create super user to not expect first_name and last_name
"""
class PlayerManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username field is required")
        if not email:
            raise ValueError("The Email field is required")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")

        return self.create_user(username, email, password, **extra_fields)


#Custom player Model
class Player(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=150, validators=[MinLengthValidator(8)])
    tfa = models.BooleanField(default=False)
    secret = models.CharField(max_length=150, blank=True)
    verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        validators=[validate_image_size],
    )
    is_guest = models.BooleanField(default=False)

    # Fields removed
    is_staff = models.BooleanField(default=False)  # Required by Django for admin access
    first_name = None
    last_name = None
    date_joined = None

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = PlayerManager()

    class Meta:
        db_table = 'player_table'
        unique_together = ['username', 'email']

    def __str__(self):
        return self.username


