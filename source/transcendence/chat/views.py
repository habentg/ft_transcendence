from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from others.auth_middleware import *
from django.views import View
from .models import *
from account.models import *
from django.urls import reverse
from others.views import BaseView
import urllib.parse
from account.serializers import PlayerSerializer
from rest_framework.exceptions import AuthenticationFailed
from others.auth_middleware import JWTCookieAuthentication
from django.template.loader import render_to_string
from rest_framework.response import Response
from .serializers import ChatRoomSerializer, MessageSerializer

""" chat message related enpoints """
class chatMessagesView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'chat/chat_messages.html'

	""" get method to get all the chatrooms that the user is a participant in """
	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			response = HttpResponseRedirect(reverse('signin_page'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': '/signin'
				}, status=302)
			return response
		return super().handle_exception(exception)

	
	def get(self, request):
		room_name = request.GET.get('room', '')
		recipeint_username = request.GET.get('recipient', '')
		try:
			chatroom = ChatRoom.objects.get(name=room_name)
			messages = Message.objects.filter(room=chatroom).order_by('timestamp')
			context = {
				'messages': messages,
				'current_user': PlayerSerializer(request.user).data
			}
			return_json = {
				'messages': render_to_string(self.template_name, context),
				'is_blocked': False,
			}
			if recipeint_username != 'deleted_player':
				recipeint = Player.objects.get(username=recipeint_username)
				return_json['is_blocked'] = request.user.is_blocked(recipeint)
			return Response(return_json, status=200)
		except ChatRoom.DoesNotExist:
			return Response({'error': "No active chatroom for with this player!"}, status=404)
		except Exception as e:
			return Response({'error': "some shit happend getting chatrooms"}, status=400)

# everything about chatrooms - get, post, delete, patch
class ChatRoomsView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'chat/chat.html'
	title = 'Chat'
	css = ['css/chat.css']
	js = ['js/chat.js']

	""" get method to get all the chatrooms that the user is a participant in """
	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			response = HttpResponseRedirect(reverse('signin_page'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': '/signin'
				}, status=302)
			return response
		return super().handle_exception(exception)

	def get_context_data(self, request):
		""" get all the chatrooms that the user is a participant in """
		chatrooms = ChatRoom.objects.filter(participants=request.user).order_by('-conversed_at')
		return {'chatrooms': chatrooms, 'user': PlayerSerializer(request.user).data}
	
	def get(self, request):
		return super().get(request)

	""" post method to create a chatroom """
	def post(self, request):
		recipient_username = request.data.get('recipient')
		try:
			sender = request.user
			recipient = Player.objects.get(username=recipient_username)
			room_name = f"{min(sender.id, recipient.id)}_{max(sender.id, recipient.id)}"        
			priv_room = ChatRoom.objects.filter(participants=sender).filter(participants=recipient).first()
			if not priv_room:
				priv_room = ChatRoom.objects.create(name=room_name)
				priv_room.participants.add(sender, recipient)
			return Response(
				{
					'room_name': priv_room.name,
					'participants_usernames': [sender.username, recipient.username]
				}, status=201)
		except Exception as e:
			return Response({'error': "some shit happened!"}, status=400)