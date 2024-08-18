from rest_framework import serializers
from .models import BlogPost, BlogUser

class BlogPostSerializer(serializers.ModelSerializer):
	class Meta:
		model = BlogPost
		fields = '__all__'

# user registration serializer class
""" 
	-> It defines the structure for user registration data
	-> It validates the incoming data against the defined fields
	-> It provides a custom method for creating a new user, ensuring that the password is properly hashed before saving.
"""
class UserRegistrationSerializer(serializers.ModelSerializer):
	password = serializers.CharField(max_length=100, min_length=3, style={'input_type': 'password'}, write_only=True)
	class Meta:
		model = BlogUser
		fields = ['first_name', 'last_name', 'username', 'email', 'password']
		extra_kwargs = {
            'password': {'write_only': True}
        }

	def create(self, validated_data):
		user_password = validated_data.pop('password')
		db_instance = self.Meta.model(**validated_data)
		db_instance.set_password(user_password)
		db_instance.save()
		return db_instance

	def validate_username(self, value):
		if self.Meta.model.objects.filter(username=value).exists():
			raise serializers.ValidationError("A user with this username already exists.")
		return value

# user login serializer class
""" 
	-> It defines the structure for user registration data
	-> It validates the incoming data against the defined fields
	-> It provides a custom method for creating a new user, ensuring that the password is properly hashed before saving.
"""
class UserLoginSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150, read_only=True)
	email = serializers.CharField(max_length=150)
	password = serializers.CharField(max_length=150, min_length=3, style={'input_type': 'password'})
	token = serializers.CharField(max_length=255, read_only=True)