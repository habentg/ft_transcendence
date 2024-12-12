from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import *
from django.views import View
from .models import *
from account.models import *
from django.urls import reverse
from others.views import BaseView
import urllib.parse
from account.serializers import PlayerSerializer
from rest_framework.exceptions import AuthenticationFailed
from account.auth_middleware import JWTCookieAuthentication
from django.template.loader import render_to_string
from rest_framework.response import Response

""" chat message related enpoints """
class chatMessagesView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'chat/chat_messages.html'

	def get(self, request):
		room_name = request.GET.get('room', '')
		try:
			chatroom = ChatRoom.objects.get(name=room_name, participants=request.user)
		except ChatRoom.DoesNotExist:
			return JsonResponse({'error': 'Chatroom not found.'}, status=404)
		messages = Message.objects.filter(room=chatroom).order_by('timestamp')
		context = {
			'messages': messages,
			'current_user': PlayerSerializer(request.user).data
		}
		return JsonResponse({'messages': render_to_string(self.template_name, context)}, status=200)

# everything about chatrooms - get, post, delete, patch
class ChatRoomsView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'chat/chat.html'
	title = 'Chat'
	css = 'css/chat.css'
	js = 'js/chat.js'

	""" get method to get all the chatrooms that the user is a participant in """
	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': f'{signin_url}?{params}'
				}, status=302)
			return response
		return super().handle_exception(exception)

	def get_context_data(self, request):
		""" get all the chatrooms that the user is a participant in """
		chatrooms = ChatRoom.objects.filter(participants=request.user)
		print(f"chatrooms {request.user.username} is involved in: ", chatrooms)
		return {'chatrooms': chatrooms, 'user': PlayerSerializer(request.user).data}
	
	def get(self, request):
		return super().get(request)

	""" post method to create a chatroom """
	def post(self, request):
		sender = request.user
		recipient_username = request.data.get('recipient')
		if not recipient_username:
			return JsonResponse({'error': 'Recipient username is required.'}, status=400)
		recipient = Player.objects.get(username=recipient_username)
		room_name = f"{min(sender.id, recipient.id)}_{max(sender.id, recipient.id)}"        
		priv_room, created = ChatRoom.objects.get_or_create(name=room_name)
		if created:
			priv_room.participants.add(sender, recipient)
		return JsonResponse({'data': 'asdfadsf'}, status=200)
	
	""" patch to block/unblock a user """