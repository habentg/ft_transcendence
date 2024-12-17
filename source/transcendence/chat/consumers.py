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
        recipient_username = data['recipient']
        recipient = await database_sync_to_async(Player.objects.get)(username=recipient_username)
        if not recipient:
            await self.send(text_data=json.dumps({
                'type': 'chat_message_error',
                'message': f'User {recipient_username} not found'
            }))
            return
        room_id = f"{min(self.sender.id, recipient.id)}_{max(self.sender.id, recipient.id)}"

        if data['type'] == 'private_message':
            message = data.get('message')
            try:
                priv_room = await database_sync_to_async(ChatRoom.objects.get)(name=room_id)
                if await database_sync_to_async(recipient.is_blocked)(self.sender):
                    return 
                await database_sync_to_async(Message.objects.create)(
                    room=priv_room,
                    sender=self.sender,
                    content=message
                )
                await self.channel_layer.group_send(
                    f"chat_{recipient.username}",
                    {
                        'type': 'chat_message_handler',
                        'sender': self.sender.username,
                        'recipient': recipient.username,
                        'chat_id': room_id,
                        'message': message
                    }
                )
            except Exception as e:
                print("Private MSG error: ", e, flush=True)
                await self.send(text_data=json.dumps({
                    'type': 'chat_message_error',
                    'message': f'Error sending message to {recipient_username}'
                }))
        elif data['type'] == 'block_unblock_player':
            block_action = data['block_action']
            if block_action == 'block':
                try:
                    await database_sync_to_async(self.sender.block)(recipient)
                    print(f"{self.sender.username} blocked {recipient.username}", flush=True)
                    await self.send(text_data=json.dumps({
                        'type': 'block_unblock_player',
                        'message': f'Unblocked {recipient_username}',
                        'action': 'blocked',
                        'recipient': recipient_username
                    }))
                except Exception as e:
                    print(f"Error blocking user {recipient_username}: {e}", flush=True)
                    await self.send(text_data=json.dumps({
                        'type': 'chat_message_error',
                        'message': f'Error blocking user {recipient_username}'
                    }))
                    return
            elif block_action == 'unblock':
                try:
                    await database_sync_to_async(self.sender.unblock)(recipient)
                    print(f"{self.sender.username} unblocked {recipient.username}", flush=True)
                    await self.send(text_data=json.dumps({
                        'type': 'block_unblock_player',
                        'message': f'Unblocked {recipient_username}',
                        'action': 'unblocked',
                        'recipient': recipient_username
                    }))
                except Exception as e:
                    print(f"Error unblocking user {recipient_username}: {e}", flush=True)
                    await self.send(text_data=json.dumps({
                        'type': 'chat_message_error',
                        'message': f'Error unblocking user {recipient_username}'
                    }))
                    return

    """ message sending handler """
    async def chat_message_handler(self, event):
        print("chat_message_handler invoked with event:", event, flush=True)
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'recipient': event['recipient'],
            'chat_id': event['chat_id']
        }))

    """ room deleting notification handler """
    async def room_deleted_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'room_deleted_notification',
            'message': event['message'],
            'recipient': event['recipient'],
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
    """ 
        self.scope - saves the websocket connection Metadata, including the headers, cookies ... as a dictionary
        self.scope['headers'] - returns a list of tuples, where each tuple contains a key-value pair of the headers
    """

    def extract_token_from_headers(self):
        headers = dict(self.scope['headers'])
        cookie_header = headers.get(b'cookie', b'').decode('utf-8')
        cookies = cookie_header.split('; ')
        for cookie in cookies:
            if cookie.startswith('access_token='):
                return cookie.split('=')[1]
        return None

    """ 
     Django ORM is synchronous, so using it directly in an async function would block the event loop. 
     The decorator runs this function in a separate thread.  
    """
    @database_sync_to_async
    def validate_token(self, token):            
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            return Player.objects.get(id=payload['user_id'])
        
        except Exception as e:
            print("Exeption in validating token in FriendshipNotificationConsumer: ", e, flush=True)
            return None
        #     if data['type'] == 'delete_chatroom':
        #     success = await self.delete_chatroom(room_name)
        #     if success:
        #         await self.channel_layer.group_send(
        #             room_group_name,
        #             {
        #                 'type': 'room_deleted_notification',
        #                 'message': 'Chatroom has been deleted',
        #                 'room': room_name
        #             }
        #         )
        #         await self.channel_layer.group_discard(
        #             room_group_name,
        #             self.channel_name
        #         )
        #     else:
        #         await self.send(text_data=json.dumps({
        #             'type': 'room_deleted_notification_error',
        #             'message': 'Chatroom could not be deleted',
        #         }))

        # el