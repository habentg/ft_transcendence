from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from channels.db import database_sync_to_async
import jwt
from account.models import *
from chat.models import *
from .serializers import *

class chatConsumer(AsyncWebsocketConsumer):
    def extract_token_from_headers(self):
        headers = dict(self.scope['headers'])
        cookie_header = headers.get(b'cookie', b'').decode('utf-8')
        cookies = cookie_header.split('; ')
        for cookie in cookies:
            if cookie.startswith('access_token='):
                return cookie.split('=')[1]
        return None

    @database_sync_to_async
    def validate_token(self, token):            
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            # Retrieve user based on token payload
            return Player.objects.get(id=payload['user_id'])
        
        except Exception as e:
            print("Exeption in validating token in FriendshipNotificationConsumer: ", e, flush=True)
            return None

    async def connect(self, **kwargs):
        jwt_token = self.extract_token_from_headers()
        self.sender = await self.validate_token(jwt_token)
        print("self.sender: ", self.sender)

        if not self.sender:
            await self.close()
            return
        self.group_name = f"chat_{self.sender.username}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        recipient_chatroom = data.get('recipient')

        room_group_name = f"chat_group_{recipient_chatroom}"

        priv_room, _ = await database_sync_to_async(ChatRoom.objects.get_or_create)(name=recipient_chatroom)
        print("priv_room: ", priv_room, flush=True)
        await self.channel_layer.group_add(
            room_group_name,
            self.channel_name
        )
        
        await database_sync_to_async(Message.objects.create)(
            room=priv_room,
            sender=self.sender,
            content=message
        )

        print("message: [", message, "] saved!!!", flush=True)
        await self.channel_layer.group_send(
            room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.sender.username
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'private_message',
            'message': event['message'],
            'sender': event['sender']
        }))
