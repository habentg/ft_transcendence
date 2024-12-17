from rest_framework import serializers
from account.models import Player
from chat.models import ChatRoom, Message

# chat room serializer class
class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['id', 'name']
    

# message serializer class
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'room', 'get_sender']
    
    def get_sender(self, obj):
        return obj.sender.username