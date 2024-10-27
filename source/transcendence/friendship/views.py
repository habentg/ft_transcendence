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

# Create your views here.
class FriendsViewSet(viewsets.ModelViewSet):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = FriendsSerializer

	def get_queryset(self):
		return Player.objects.all()
		
	def list(self, request, *args, **kwargs):
		print('FriendsViewSet', flush=True)
		return super().list(request, *args, **kwargs)
	def create(self, request, *args, **kwargs):
		print('FriendsViewSet: ', kwargs.get('username'), flush=True)
		return super().create(request, *args, **kwargs)


class FriendRequestView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		data = request.data
		data['sender'] = request.user.id  # Using sender's primary key

		# Get receiver's primary key based on username
		receiver = get_object_or_404(Player, username=kwargs.get('username'))
		data['receiver'] = receiver.id

		serializer = FriendRequestSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)

		# Return detailed error information
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def put(self, request, *args, **kwargs):
		
		return Response('FriendRequestView', status=status.HTTP_200_OK)

	def delete(self, request, *args, **kwargs):
		print('FriendRequestView: ', kwargs.get('username'), flush=True)
		return Response('FriendRequestView', status=status.HTTP_200_OK)