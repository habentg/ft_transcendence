from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from django.conf import settings
from channels.db import database_sync_to_async
import jwt
from .models import *

class FriendshipNotificationConsumer(AsyncWebsocketConsumer):
    def extract_token_from_headers(self):
        # WebSocket headers are in bytes, so we need to decode
        headers = dict(self.scope['headers'])
        cookie_header = headers.get(b'cookie', b'').decode('utf-8')
        cookies = cookie_header.split('; ')
        for cookie in cookies:
            if cookie.startswith('access_token='):
                return cookie.split('=')[1]
        return None

    @database_sync_to_async
    def validate_token(self, token):
        Player = get_user_model()
        
        try:
            # Decode the JWT token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            # Retrieve user based on token payload
            return Player.objects.get(id=payload['user_id'])
        
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Player.DoesNotExist:
            return None

    async def connect(self, **kwargs):
        token = self.extract_token_from_headers()
        player = await self.validate_token(token)
        print("User: ", player)
        
        if not player:
            await self.close()
            return
        
        # Each user is in their own notification group based on their username
        self.group_name = f"user_{player.username}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps(
            {"message": f"Hi, {player.username}! websocke channel is established for ya!!!!!"}
        ))

    async def disconnect(self, close_code):
        # Leave the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Custom event Handler for friend request notifications
    async def friend_request_notification(self, event):
        sender = event['sender']
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'friend_request',
            'sender': sender,
            'message': message
        }))