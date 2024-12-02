from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import JWTCookieAuthentication
from account.models import Player
from .models import *
from .serializers import *
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
import json
from account.serializers import PlayerSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import viewsets


# template_name for viewing player profile
class PlayerProfileView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	template_name = 'friendship/player_profile.html'
	title = 'Player Profile'
	css = 'css/profile.css'
	js = 'js/profile.js'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		return super().handle_exception(exception)

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def get_context_data(self, request, **kwargs):
		queried_user = request.user
		if kwargs.get('username') and kwargs.get('username') != request.user.username:
			queried_user = self.get_player(kwargs.get('username'))
			if not queried_user:
				print('Player not found', flush=True)
				return {'error_msg':'Player not found'}
		data = {}
		if queried_user.is_guest:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_self': False,
			}
		else:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_friend': request.user.friend_list.friends.filter(username=queried_user.username).exists(),
				'is_requested_by_me': request.user.sent_requests.filter(receiver=queried_user).exists(),
				'am_i_requested': request.user.received_requests.filter(sender=queried_user).exists(),
				'is_self': queried_user == request.user,
			}
		print(" is_self:", data['is_self'], flush=True)
		return data

# FRIEND REQUESTS - FROM SENDER PERSPECTIVE
class FriendRequestView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	# send friend request - PENDING
	def post(self, request, *args, **kwargs):
		print('FriendRequestView - post - to add friend request', flush=True)
		data = request.data
		data['sender'] = request.user.id  # Using sender's primary key

	
		receiver = self.get_player(kwargs.get('username'))
		sender_id = request.user.id  # Assuming the user is authenticated and you have access to their ID
		if FriendRequest.objects.filter(sender_id=sender_id, receiver_id=receiver.id).exists():
			print('Friend request already exists', flush=True)
			return Response({'detail': 'Friend request already exists.'}, status=status.HTTP_400_BAD_REQUEST)

		data['receiver'] = receiver.id
		serializer = FriendRequestSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friend_request_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'message': f'{request.user.username} has sent you a friend request.'
			}
			async_to_sync(channel_layer.group_send)(
				f"user_{receiver.username}",
				notification_message
			)
			#! add notification to the receiver's notification list
			notification_data = {
				'player': receiver.id,
				'notification_type': 'friend_request',
				'sender': request.user.id,
				'read_status': False
			}
			notification_serializer = NotificationSerializer(data=notification_data)
			notification_serializer.is_valid(raise_exception=True)
			notification_serializer.save()
			receiver_notification = Notification.objects.filter(player=receiver)
			print("receiver_notification: ", receiver_notification, flush=True)
			print(f'{request.user.username} SENT FRIEND REQUEST to {receiver.username}!', flush=True)
			return Response(serializer.data, status=status.HTTP_201_CREATED) # 
		# Return detailed error information
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	# Cancel friend request - CANCELLED
	def patch(self, request, *args, **kwargs):
		print('FriendRequestView - patch - to cancel friend request', flush=True)
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			print('Friend cancel request  Player not found', flush=True)
			return {'error_msg':'Player not found - cant cancel friend request'}
		friend_req = FriendRequest.objects.filter(sender=request.user.id, receiver=receiver.id).first()
		if not friend_req:
			return Response({'error_msg': 'No friend request found'}, status=status.HTTP_404_NOT_FOUND)
		#! send notification to the receiver's channel group
		channel_layer = get_channel_layer()
		notification_message = {
			'type': 'friend_request_notification',
			'sender': request.user.username,
			'receiver': receiver.username,
			'message': f'{request.user.username} has cancelled your friend request.'
		}
		print("notification_message: ", notification_message, flush=True)
		async_to_sync(channel_layer.group_send)(
			f"user_{receiver.username}",
			notification_message
		)
		friend_req.cancel()
		friend_req.delete()
		print(f'{request.user.username} CANCELLED {receiver.username}\'s request!', flush=True)
		return Response({'success': 'Friend request CANCELLED'}, status=status.HTTP_200_OK)

	# remove a Friend - un-friend
	def delete(self, request, *args, **kwargs):
		print('FriendRequestView - delete - to remove friend', flush=True)
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			print('Player doesnt exist - so cant unfriend him', flush=True)
			return {'error_msg':'Player not found - cant unfriend'}
		current_players_list = FriendList.objects.get(player=request.user)
		try:
			current_players_list.remove_friend(receiver)
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friend_request_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'message': f'{request.user.username} has unfriended you.'
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"user_{receiver.username}",
				notification_message
			)
			print(f'{request.user.username} UN_FRIENDED {receiver.username}!', flush=True)
		except Exception as e:
			return Response({'error_msg': str(e)}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'success': 'Friend removed'}, status=status.HTTP_200_OK)

# RESPONDING TO FRIEND REQUEST - FROM RECEIVER PERSPECTIVE
	""" 
		we can use PATCH method to accept or decline the friend request  based on what action the user wants to take.
	"""
class FriendRequestResponseView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def patch(self, request, *args, **kwargs):
		data = request.data
		data['sender'] = request.user.id
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			print('Player doesnt exist - cant respond to friend request', flush=True)
			return {'error_msg':'Player not found - cant respond to friend request'}
		data['receiver'] = receiver.id
		friend_req = FriendRequest.objects.filter(sender=receiver, receiver=request.user).first()
		if not friend_req:
			return Response({'error_msg': 'No friend request found'}, status=status.HTTP_404_NOT_FOUND)
		if data.get('action') == 'decline':
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friend_request_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'message': f'{request.user.username} has DECLINED your friend request.'
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"user_{receiver.username}",
				notification_message
			)
			friend_req.decline()
			friend_req.delete()
			print(f'{request.user.username} DECLINED {receiver.username}\'s request!', flush=True)
		elif data.get('action') == 'accept':
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friend_request_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'message': f'{request.user.username} has sent ACCEPTED your friend request.'
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"user_{receiver.username}",
				notification_message
			)
			print(f'{request.user.username} ACCEPTED {receiver.username}\'s request!', flush=True)
			# we will either update the satatus or delete it coz its fulfilled
			friend_req.accept()
			friend_req.delete()
			# after accepting
			""" 
			 1. add each other to their friend list
			 2. remove the friend request from the friend table
			"""
		friend_list = FriendList.objects.get(player=request.user)
		print('Friend list: ', friend_list, flush=True)
		return Response({'success': 'Friend request fulfilled'}, status=status.HTTP_200_OK)
	
class NotificationViewSet(viewsets.ViewSet):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def list(self, request):
		notifications = Notification.objects.filter(player=request.user)
		serializer = NotificationSerializer(notifications, many=True)
		print("$$$$$$$$$$$$$$ notifications: ", notifications, flush=True)
		return Response(serializer.data)

	# mark notification as read
	def update(self, request, pk=None):
		try:
			notification = Notification.objects.get(pk=pk, player=request.user)
		except Notification.DoesNotExist:
			return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
		notification.read_status = True
		notification.save()
		return Response(status=status.HTTP_400_BAD_REQUEST)

	# delete notification
	def destroy(self, request, pk=None):
		try:
			notification = Notification.objects.get(pk=pk, player=request.user)
			notification.delete()
			return Response(status=status.HTTP_204_NO_CONTENT)
		except Notification.DoesNotExist:
			return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)