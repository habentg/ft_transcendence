from rest_framework import serializers
from account.models import Player

# friends serializer class
class FriendsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['username', 'email', 'profile_picture']