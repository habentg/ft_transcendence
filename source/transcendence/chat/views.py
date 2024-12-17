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
		# recipeint_username = request.GET.get('room', '')
		room_name = request.GET.get('room', '')
		try:
			# recipeint = Player.objects.get(username=recipeint_username)
			# room_name = f"{min(request.user.id, recipeint.id)}_{max(request.user.id, recipeint.id)}"
			chatroom = ChatRoom.objects.get(name=room_name)
			messages = Message.objects.filter(room=chatroom).order_by('timestamp')
			context = {
				'messages': messages,
				'current_user': PlayerSerializer(request.user).data
			}
			return Response({'messages': render_to_string(self.template_name, context)}, status=200)
		except ChatRoom.DoesNotExist:
			print("Error: ", e)
			return Response({'error': "No active chatroom for with this player!"}, status=404)
		except Exception as e:
			print("Error: ", e)
			return Response({'error': "some shit happend"}, status=400)

# everything about chatrooms - get, post, delete, patch
class ChatRoomsView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'chat/chat.html'
	title = 'Chat'
	css = ['css/chat.css']
	js = ['js/chat.js']

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
			return Response({'error': e}, status=400)


"""  block/unblock a player checker """
class IsBlocked(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		try:
			recipient_username =request.GET.get('recipient', '')
			print(f" we hitting the endpoint {recipient_username}", flush=True)
			recipient = Player.objects.get(username=recipient_username)
			if request.user.is_blocked(recipient):
				return Response({'status': 'blocked'}, status=200)
			return Response({'status': 'not_blocked'}, status=200)
		except Exception as e:
			return Response({'error': 'something happened while checking if user is blocked'}, status=400)