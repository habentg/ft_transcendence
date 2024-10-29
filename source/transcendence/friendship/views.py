from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import JWTCookieAuthentication
from account.models import Player
from .models import *
from .serializers import FriendsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
from others.views import BaseView
from rest_framework.exceptions import AuthenticationFailed
from django.http import HttpResponseRedirect
from django.urls import reverse
import urllib.parse


# template_name for viewing player profile
class PlayerProfileView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	template_name = 'friendship/player_profile.html'
	# title = 'Player Profile'
	# css = 'css/player_profile.css'
	js = 'js/friend.js'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		return super().handle_exception(exception)
	# def get(self, request, *args, **kwargs):  # Use standard args and kwargs
	# 	print('PlayerProfileView - from friendship app', flush=True)
	# 	return super().get(request, *args, **kwargs)  # Pass both args and kwargs

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def get_context_data(self, request, **kwargs):  # Standardize to use kwargs
		queried_user = request.user
		if kwargs.get('username') and kwargs.get('username') != request.user.username:
			queried_user = self.get_player(kwargs.get('username'))
			if not queried_user:
				print('Player not found', flush=True)
				return {'error_msg':'Player not found'}
		data = {
			'queried_player': queried_user,
			'is_friend': request.user.friend_list.friends.filter(username=queried_user.username).exists(),
			'is_requested_by_me': request.user.sent_requests.filter(receiver=queried_user).exists(),
			'am_i_requested': request.user.received_requests.filter(sender=queried_user).exists(),
			'is_self': queried_user == request.user,
		}
		return data

# # Create your views here.
# class FriendsViewSet(viewsets.ModelViewSet):
# 	authentication_classes = [JWTCookieAuthentication]
# 	permission_classes = [IsAuthenticated]
# 	serializer_class = FriendsSerializer

# 	def get_queryset(self):
# 		return Player.objects.all()
		
# 	def list(self, request, *args, **kwargs):
# 		print('FriendsViewSet', flush=True)
# 		return super().list(request, *args, **kwargs)
# 	def create(self, request, *args, **kwargs):
# 		print('FriendsViewSet: ', kwargs.get('username'), flush=True)
# 		return super().create(request, *args, **kwargs)


# FRIEND REQUESTS - FROM SENDER PERSPECTIVE
class FriendRequestView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	# send friend request - PENDING
	def post(self, request, *args, **kwargs):
		print('FriendRequestView - post - to add friend request', flush=True)
		data = request.data
		data['sender'] = request.user.id  # Using sender's primary key

		receiver = get_object_or_404(Player, username=kwargs.get('username'))
		data['receiver'] = receiver.id

		serializer = FriendRequestSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED) # 

		# Return detailed error information
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	# Cancel friend request - CANCELLED
	def patch(self, request, *args, **kwargs):
		print('FriendRequestView - patch - to cancel friend request', flush=True)
		receiver = get_object_or_404(Player, username=kwargs.get('username'))
		friend_req = FriendRequest.objects.filter(sender=request.user.id, receiver=receiver.id).first()
		if not friend_req:
			return Response('No friend request found', status=status.HTTP_404_NOT_FOUND)
		friend_req.delete()
		return Response('Friend request CANCELLED', status=status.HTTP_200_OK)

# RESPONDING TO FRIEND REQUEST - FROM RECEIVER PERSPECTIVE
	""" 
		we can use PATCH method to accept or decline the friend request  based on what action the user wants to take.
	"""
class FriendRequestResponseView(APIView):
	def patch(self, request, *args, **kwargs):
		data = request.data
		data['sender'] = request.user.id
		receiver = get_object_or_404(Player, username=kwargs.get('username'))
		data['receiver'] = receiver.id
		friend_req = FriendRequest.objects.filter(sender=receiver, receiver=request.user).first()
		if not friend_req:
			return Response('No friend request found', status=status.HTTP_404_NOT_FOUND)
		if data.get('action') == 'decline':
			friend_req.decline()
			return Response('Friend request declined', status=status.HTTP_200_OK)
		elif data.get('action') == 'accept':
			friend_req.accept()
			# after accepting
			""" 
			 1. add each other to their friend list
			 2. remove the friend request from the friend table
			"""
			other_players_list = FriendList.objects.get(player=receiver)
			current_players_list = FriendList.objects.get(player=request.user)
			other_players_list.friends.add(request.user)
			current_players_list.friends.add(receiver)
			friend_req.delete()
			return Response('Friend request accepted', status=status.HTTP_200_OK)

	
