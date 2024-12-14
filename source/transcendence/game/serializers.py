from rest_framework import serializers
from account.models import Player
from .models import *

""" Game serializer """
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'