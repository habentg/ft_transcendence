from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth import get_user_model
from django.conf import settings
from channels.db import database_sync_to_async
import jwt
from .models import *
from .serializers import *
from account.models import *

class FriendshipNotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self, **kwargs):
        token = self.extract_token_from_headers()
        self.player = await self.validate_token(token)
        if not self.player:
            await self.close()
            return
        
        # Each user is in their own notification group based on their username
        self.group_name = f"notification_{self.player.username}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps(
            {"message": f"Hi, {self.player.username}! websocke channel is established for ya!!!!!"}
        ))

    async def disconnect(self, close_code):
        # Leave the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Custom event Handler for friend request notifications
    async def friendship_notification(self, event):
        sender = event['sender']
        notification_type = event['notification_type']
        message = ""
        notification_type = event['notification_type']
        if event.get('message') is not None:
            message = event['message']
        if notification_type == 'friend_request':
            message = f"{sender} sent you a friend request!"
        elif notification_type == 'canceled':
            message = f"{sender} canceled the friend request!"
        elif notification_type == 'accepted':
            message = f"{sender} accepted your friend request!"
        elif notification_type == 'declined' or notification_type == 'unfriended':
            message = f"{sender} declined/unfriended your friend request!"
        await self.send(text_data=json.dumps({
            'type': notification_type,
            'sender': sender,
            'receiver': event['receiver'],
            'message': message
        }))
    
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
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            return Player.objects.get(id=payload['user_id'])
        
        except Exception as e:
                return None
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'invite_to_game':
            await self.channel_layer.group_send(
                f'notification_{data['recipient']}',
                {
                    'type': 'game_invitation_handler',
                    'sender': self.player.username,
                    'recipient': f'{data['recipient']}',
                    'message': f'{self.player.username} has INVITED you to play a game',
                }
            )
            
    async def game_invitation_handler(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_invitation',
            'message': event['message'],
            'sender': event['sender'],
            'recipient': event['recipient']
        }))