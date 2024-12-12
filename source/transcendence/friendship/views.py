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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import viewsets
from django.template.loader import render_to_string 
from account.serializers import PlayerSerializer

# FRIEND REQUESTS - FROM SENDER PERSPECTIVE
class FriendRequestView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

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
			print(f"$$$$$$$$$$$ sending to user_{receiver.username} $$$$$$$$$", flush=True)
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
			notification_serializer = NotificationSerializer(data=notification_data)
			if not notification_serializer.is_valid():
				return Response({'error_msg': notification_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
			notification_serializer.save()
			print(f'{request.user.username} SENT FRIEND REQUEST to {receiver.username}!', flush=True)
			return Response(serializer.data, status=status.HTTP_201_CREATED) # 
		# Return detailed error informatio
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
		# #! send notification to the receiver's channel group
		channel_layer = get_channel_layer()
		notification_message = {
			'type': 'friendship_notification',
			'sender': request.user.username,
			'receiver': receiver.username,
			'notification_type': 'canceled',
		}
		print("notification_message: ", notification_message, flush=True)
		async_to_sync(channel_layer.group_send)(
			f"notification_{receiver.username}",
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
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'unfriended',
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
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
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'declined',
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
			friend_req.decline()
			friend_req.delete()
			print(f'{request.user.username} DECLINED {receiver.username}\'s request!', flush=True)
		elif data.get('action') == 'accept':
			#! send notification to the receiver's channel group
			channel_layer = get_channel_layer()
			notification_message = {
				'type': 'friendship_notification',
				'sender': request.user.username,
				'receiver': receiver.username,
				'notification_type': 'accepted'
			}
			print("notification_message: ", notification_message, flush=True)
			async_to_sync(channel_layer.group_send)(
				f"notification_{receiver.username}",
				notification_message
			)
			print(f'{request.user.username} ACCEPTED {receiver.username}\'s request!', flush=True)
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
		print('Friend list: ', friend_list, flush=True)
		return Response({'success': 'Friend request fulfilled'}, status=status.HTTP_200_OK)
	
class NotificationViewSet(viewsets.ViewSet):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'friendship/notification.html'

	def list(self, request):
		notifications = Notification.objects.filter(player=request.user)
		serializer = NotificationSerializer(notifications, many=True)
		print("we in the notification viewset", flush=True)
		if not notifications:
			return Response({'detail': 'No notifications found.'}, status=status.HTTP_404_NOT_FOUND)
		if request.query_params.get('action') == 'top_3_notifications':
			serializer = NotificationSerializer(notifications[:3], many=True)
			print('Top 3 notifications : ', serializer.data, flush=True)
			return Response(serializer.data)
		else:
			serializer = NotificationSerializer(notifications, many=True)
			html = render_to_string(self.template_name, {'notifications': serializer.data})
			print("html: ", html, flush=True)
			print('All notifications : ', serializer.data, flush=True)
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
