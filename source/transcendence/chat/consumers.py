from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from channels.db import database_sync_to_async
import jwt
from account.models import *
from chat.models import *
from .serializers import *

class chatConsumer(AsyncWebsocketConsumer):
    async def connect(self, **kwargs):
        jwt_token = self.extract_token_from_headers()
        self.sender = await self.validate_token(jwt_token)

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
        room_name = data.get('room')
        room_group_name = f"chat_group_{room_name}"
        if data['type'] == 'delete_chatroom':
            success = await self.delete_chatroom(room_name)
            if success:
                await self.channel_layer.group_send(
                    room_group_name,
                    {
                        'type': 'room_deleted_notification',
                        'message': 'Chatroom has been deleted',
                        'room': room_name
                    }
                )
                await self.channel_layer.group_discard(
                    room_group_name,
                    self.channel_name
                )
            else:
                await self.send(text_data=json.dumps({
                    'type': 'room_deleted_notification_error',
                    'message': 'Chatroom could not be deleted',
                }))
        elif data['type'] == 'private_message':
            message = data.get('message')
            try:
                priv_room, created = await database_sync_to_async(ChatRoom.objects.get_or_create)(name=room_name)
                print("Private room: ", priv_room, " no of participants", await database_sync_to_async(priv_room.participants.count)(), flush=True)
                if created:
                    print("Created new chatroom: ", priv_room, " no of participants", await database_sync_to_async(priv_room.participants.count)(), flush=True)
                await self.channel_layer.group_add(
                    room_group_name,
                    self.channel_name
                )
                await database_sync_to_async(Message.objects.create)(
                    room=priv_room,
                    sender=self.sender,
                    content=message
                )
                user_one = priv_room.participants.all()[0]
                user_two = priv_room.participants.all()[1]
                print("User one: ", user_one, " User two: ", user_two, flush=True)
                # send message to each participant
                
                await self.channel_layer.group_send(
                    f"chat_{user_one.username}",
                    {
                        'type': 'chat_message_handler',
                        'message': message,
                        'sender': self.sender.username
                    }
                )
            
                await self.channel_layer.group_send(
                    f"chat_{user_two.username}",
                    {
                        'type': 'chat_message_handler',
                        'message': message,
                        'sender': self.sender.username
                    }
                )
                await self.channel_layer.group_send(
                    room_group_name,
                    {
                        'type': 'chat_message_handler',
                        'message': message,
                        'sender': self.sender.username
                    }
                )
                print(f"Sent message to group {room_group_name}: {message}, participants no: {await database_sync_to_async(priv_room.participants.count)()}", flush=True)
            except Exception as e:
                print("Private MSG error: ", e, flush=True)
                await self.send(text_data=json.dumps({
                    'type': 'private_message_error',
                }))

    """ message sending handler """
    async def chat_message_handler(self, event):
        print("chat_message_handler invoked with event:", event, flush=True)
        await self.send(text_data=json.dumps({
            'type': 'private_message',
            'message': event['message'],
            'sender': event['sender']
        }))

    """ room deleting notification handler """
    async def room_deleted_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'room_deleted_notification',
            'message': event['message'],
            'room': event['room']
        }))
    
    """ ------------------------- Helper functions -------------------------"""
    @database_sync_to_async
    def delete_chatroom(self, room_name):
        try:
            room = ChatRoom.objects.get(name=room_name)
            room.participants.clear()
            room.delete()
            return True
        except Exception as e:
            print(f"Error during deletion of chatroom '{room_name}': {e}", flush=True)
            return False

    """ ------------------------- token auth -------------------------"""
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