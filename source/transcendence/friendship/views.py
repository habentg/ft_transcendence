from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import JWTCookieAuthentication
from account.models import Player
from .serializers import FriendsSerializer

# Create your views here.
class FriendsViewSet(viewsets.ModelViewSet):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = FriendsSerializer

	def get_queryset(self):
		return Player.objects.all()
		
	def list(self, request, *args, **kwargs):
		print(self.get_queryset(), flush=True)
		return super().list(request, *args, **kwargs)