from django.db import models
from friendship.models import *
from account.models import *

class ChatModel(models.Model):
    sender = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='sent_chats')
    receiver = models.ForeignKey('account.Player', on_delete=models.CASCADE, related_name='received_chats')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read_status = models.BooleanField(default=False)

    class Meta:
        db_table = 'chat_table'