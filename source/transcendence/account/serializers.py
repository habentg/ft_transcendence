from rest_framework import serializers
from .models import Player

# user registration serializer class
class PlayerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=500,
        min_length=3,
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False,  # Prevent trimming of whitespace
    )

    class Meta:
        model = Player
        fields = ['full_name', 'username', 'email', 'password']

    def create(self, validated_data):
        if validated_data['password'] != self.initial_data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match from backend.")
        user_password = validated_data.pop('password')
        playa = self.Meta.model(**validated_data)
        playa.set_password(user_password)
        playa.save()
        return playa

    def validate_username(self, username):
        if self.Meta.model.objects.filter(username=username).exists():
            raise serializers.ValidationError("Username already taken.")
        return username


# user login serializer class
class PlayerSigninSerializer(serializers.Serializer): 
	username = serializers.CharField(max_length=150)
	password = serializers.CharField(
		max_length=500,
		min_length=3,
		write_only=True,
		style={'input_type': 'password'},
		trim_whitespace=False,  # Prevent trimming of whitespace
	)

	def validate(self, data):
		username = data.get('username')
		password = data.get('password')

		try:
			player = Player.objects.get(username=username)
		except Player.DoesNotExist:
			raise serializers.ValidationError("User does not exist.")

		if not player.check_password(password):
			raise serializers.ValidationError("Incorrect password.")

		data['player'] = player
		return data

# user profile serializer class
class PlayerProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = ['full_name', 'username', 'email', 'profile_picture']

	# update profile picture - kinda tricky so updating it manually, the other fields will be updated by the default update method
	def update(self, instance, validated_data):
		profile_picture = validated_data.pop('profile_picture', None)
		if profile_picture:
			instance.profile_picture = profile_picture
		return super().update(instance, validated_data)

# user password update/change serializer class - we doing it this way coz password update needs more validation
class ChangePasswordSerializer(serializers.Serializer):
	current_password = serializers.CharField(
			max_length=500,
			min_length=3,
			write_only=True,
			style={'input_type': 'password'},
			trim_whitespace=False,  # Prevent trimming of whitespace
		)
	new_password = serializers.CharField(
			max_length=500,
			min_length=3,
			write_only=True,
			style={'input_type': 'password'},
			trim_whitespace=False,  # Prevent trimming of whitespace
		)
	confirm_password = serializers.CharField(
			max_length=500,
			min_length=3,
			write_only=True,
			style={'input_type': 'password'},
			trim_whitespace=False,  # Prevent trimming of whitespace
		)

class PlayerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Player
		fields = '__all__'