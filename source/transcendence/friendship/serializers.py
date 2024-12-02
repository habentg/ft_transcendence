from rest_framework import serializers
from account.models import Player
from friendship.models import *

# friends serializer class
class FriendsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['username', 'email', 'profile_picture']

# friend request serializer class
class FriendRequestSerializer(serializers.ModelSerializer):
	class Meta:
		model = FriendRequest
		fields = '__all__'
	
	def create(self, validated_data):
		friend_list = Player.objects.get(username=validated_data['sender']).friend_list
		if validated_data['sender'] == validated_data['receiver']:
			raise serializers.ValidationError('Cannot send friend request to yourself')
		if FriendRequest.objects.filter(sender=validated_data['sender'], receiver=validated_data['receiver']).exists():
			raise serializers.ValidationError('Friend request already exists')
		if friend_list.friends.filter(username=validated_data['receiver']).exists():
			raise serializers.ValidationError('Already friends ... this guy bruh!')
		friend_request = FriendRequest.objects.create(**validated_data)
		return friend_request
	

class NotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Notification
		fields = '__all__'
