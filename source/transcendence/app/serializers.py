from rest_framework import serializers
from .models import Player

# user registration serializer class
class PlayerSignupSerializer(serializers.ModelSerializer):
	password = serializers.CharField(max_length=100, min_length=3, style={'input_type': 'password'}, write_only=True)
	class Meta:
		model = Player
		fields = ['first_name', 'last_name', 'username', 'email', 'password']

	def create(self, validated_data):
		user_password = validated_data.pop('password')
		playa = self.Meta.model(**validated_data)
		playa.set_password(user_password)
		playa.save()
		return playa

	# validate username - we can add email uniqueness check here as well - if think is neccessary
	def validate_username(self, username):
		if self.Meta.model.objects.filter(username=username).exists():
			raise serializers.ValidationError("A user with this username already exists.")
		return username

# user login serializer class
class PlayerSigninSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150)
	password = serializers.CharField(max_length=150, min_length=3, style={'input_type': 'password'})

# user profile serializer class
class PlayerProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['first_name', 'last_name', 'username', 'email', 'profile_picture']
	# update profile picture - kinda tricky so updating it manually, the other fields will be updated by the default update method
	def update(self, instance, validated_data):
		profile_picture = validated_data.pop('profile_picture', None)
		if profile_picture:
			instance.profile_picture = profile_picture
		return super().update(instance, validated_data)

# user password update/change serializer class - we doing it this way coz password update needs more validation
class ChangePasswordSerializer(serializers.Serializer):
	current_password = serializers.CharField(max_length=150, min_length=3)
	new_password = serializers.CharField(max_length=150, min_length=3)
	confirm_password = serializers.CharField(max_length=150, min_length=3)