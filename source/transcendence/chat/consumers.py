from channels.generic.websocket import AsyncWebsocketConsumer
import json

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()
#         await self.send(text_data=json.dumps({"message": "Connected to WebSocket"}))

#     async def disconnect(self, close_code):
#         pass

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data["message"]
#         await self.send(text_data=json.dumps({"message": f"You said: {message}"}))

