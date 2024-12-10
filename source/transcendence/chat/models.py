from django.db import models
from account.models import Player

""" we will use this chatroom as a container to manage messages between players """
class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    participants = models.ManyToManyField(Player)

    class Meta:
        db_table = "chat_room"
    
    def __str__(self):
        return f"{self.name}"
    
    @property
    def get_participant_one(self):
        print("participant 1 username: ", self.participants.all()[0].username, flush=True)
        return self.participants.all()[0]

    @property
    def get_participant_two(self):
        print("participant 2 username: ", self.participants.all()[1].username, flush=True)
        return self.participants.all()[1]

""" each message is associated with a chatroom and a sender """
class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(Player, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]
        db_table = "chat_message"

    def __str__(self):
        return f"{self.sender.username} - {self.content}"
    
    @property
    def get_sender(self):
        return self.sender.username

