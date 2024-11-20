from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from friendship.models import *

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

#Custom User Model
class Player(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField()
    password = models.CharField(max_length=150)
    tfa = models.BooleanField(default=False)
    secret = models.CharField(max_length=150, blank=True)
    verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        validators=[validate_image_size]
        # default='profile_pics/default_profile_pic.jpeg',  # Set the default image
    )

    class Meta:
        db_table = 'player_table'
        unique_together = ['username', 'email']

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return self.username

    def get_friendship_status(self, other_player):
        """Returns the friendship status with another player"""
        try:
            # Check for an existing friend request from either direction
            friend_request = FriendRequest.objects.filter(sender=self, receiver=other_player).first() or FriendRequest.objects.filter(sender=other_player, receiver=self).first()

            if friend_request:
                return friend_request.status  # 'PENDING', 'ACCEPTED', or 'DECLINED'
            return 'NO_REQUEST'
        except FriendRequest.DoesNotExist:
            return 'NO_REQUEST'

