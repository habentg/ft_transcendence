from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from others.auth_middleware import JWTCookieAuthentication
from account.models import Player
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.template.loader import render_to_string 
from account.serializers import PlayerSerializer
from django.utils import timezone
from django.http import HttpResponseRedirect
from django.urls import reverse
import urllib.parse
from rest_framework.exceptions import AuthenticationFailed
from others.auth_middleware import generate_access_token

# FRIEND REQUESTS - FROM SENDER PERSPECTIVE
class FriendRequestView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		return super().handle_exception(exception)

	def get_player(self, username):
		return Player.objects.filter(username=username).first()

	def get(self, request, *args, **kwargs):
		""" get all friends of the current user """
		player = request.user
		friend_list = FriendList.objects.get(player=player)
		friends = friend_list.friends.all()
		if not friends:
			return Response({'detail': 'No friends found.'}, status=status.HTTP_404_NOT_FOUND)
		serializer = PlayerSerializer(friends, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

	# send friend request - PENDING
	def post(self, request, *args, **kwargs):
		data = request.data
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			return Response({'error_msg':'Player not found - cant send friend request'}, status=status.HTTP_400_BAD_REQUEST)
		if FriendRequest.objects.filter(sender_id=request.user.id, receiver_id=receiver.id).exists():
			return Response({'detail': 'Friend request already exists.'}, status=status.HTTP_400_BAD_REQUEST)

		data['sender'] = request.user.id	
		data['receiver'] = receiver.id
		serializer = FriendRequestSerializer(data=data)

		if serializer.is_valid():
			serializer.save()
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friendship_notification',
				'notification_type': 'friend_request',
				'sender': request.user.username,
				'receiver': receiver.username,
			}
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
			#! add notification to the receiver's notification list
			notification_data = {
				'player': receiver.id,
				'notification_type': 'friend_request_sent',
				'sender': request.user.id,
				'read_status': False
			}
			friend_requ_sent_notice = Notification.objects.filter(player=receiver, sender=request.user.id, notification_type='friend_request_sent')
			if friend_requ_sent_notice.exists():
				friend_requ_sent_notice.created_at = timezone.now()
			else:
				notification_serializer = NotificationSerializer(data=notification_data)
				if not notification_serializer.is_valid():
					return Response({'error_msg': notification_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
				notification_serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED) # 
		# Return detailed error informatio
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	# Cancel friend request - CANCELLED
	def patch(self, request, *args, **kwargs):
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			return {'error_msg':'Player not found - cant cancel friend request'}
		friend_req = FriendRequest.objects.filter(sender=request.user.id, receiver=receiver.id).first()
		if not friend_req:
			return Response({'error_msg': 'No friend request found'}, status=status.HTTP_404_NOT_FOUND)
		# #! send notification to the receiver's channel group
		channel_layer = get_channel_layer()
		notification_message = {
			'type': 'friendship_notification',
			'sender': request.user.username,
			'receiver': receiver.username,
			'notification_type': 'canceled',
		}
		async_to_sync(channel_layer.group_send)(
			f"notification_{receiver.username}",
			notification_message
		)
		friend_req.cancel()
		friend_req.delete()
		return Response({'success': 'Friend request CANCELLED'}, status=status.HTTP_200_OK)

	# remove a Friend - un-friend
	def delete(self, request, *args, **kwargs):
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			return {'error_msg':'Player not found - cant unfriend'}
		current_players_list = FriendList.objects.get(player=request.user)
		try:
			current_players_list.remove_friend(receiver)
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'unfriended',
			}
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
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
	throttle_classes = []

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		return super().handle_exception(exception)

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def patch(self, request, *args, **kwargs):
		data = request.data
		data['sender'] = request.user.id
		receiver = self.get_player(kwargs.get('username'))
		if not receiver:
			return {'error_msg':'Player not found - cant respond to friend request'}
		data['receiver'] = receiver.id
		friend_req = FriendRequest.objects.filter(sender=receiver, receiver=request.user).first()
		if not friend_req:
			return Response({'error_msg': 'No friend request found'}, status=status.HTTP_404_NOT_FOUND)
		if data.get('action') == 'decline':
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'declined',
			}
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
			friend_req.decline()
			friend_req.delete()
		elif data.get('action') == 'accept':
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'accepted'
			}
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
			# we will either update the satatus or delete it coz its fulfilled
			friend_req.accept()
			friend_req.delete()
			#! add notification to the receiver's notification list
			notification_data = {
				'player': receiver.id,
				'notification_type': 'request_accepted',
				'sender': request.user.id,
				'read_status': False
			}
			notification_serializer = NotificationSerializer(data=notification_data)
			if not notification_serializer.is_valid():
				return Response({'error_msg': notification_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
			notification_serializer.save()
			# after accepting
			""" 
			 1. add each other to their friend list
			 2. remove the friend request from the friend table
			"""
		friend_list = FriendList.objects.get(player=request.user)
		return Response({'success': 'Friend request fulfilled'}, status=status.HTTP_200_OK)
	
class NotificationViewSet(viewsets.ViewSet):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'friendship/notification.html'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		return super().handle_exception(exception)

	def list(self, request):
		notifications = Notification.objects.filter(player=request.user).order_by('-created_at')
		serializer = NotificationSerializer(notifications, many=True)
		if not notifications:
			return Response({'detail': 'No notifications found.'}, status=status.HTTP_404_NOT_FOUND)
		serializer = NotificationSerializer(notifications, many=True)
		html = render_to_string(self.template_name, {'notifications': serializer.data})
		return Response({'html': html, 'data':serializer.data}, status=status.HTTP_200_OK)

	# mark notification as read
	def update(self, request, pk=None):
		try:
			notification = Notification.objects.get(pk=pk, player=request.user)
		except Notification.DoesNotExist:
			return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
		notification.read_status = True
		notification.save()
		return Response(status=status.HTTP_200_OK)  # Change to 200 OK

	# delete notification
	def destroy(self, request, pk=None):
		try:
			notification = Notification.objects.get(pk=pk, player=request.user)
			notification.delete()
			return Response(status=status.HTTP_204_NO_CONTENT)
		except Notification.DoesNotExist:
			return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
