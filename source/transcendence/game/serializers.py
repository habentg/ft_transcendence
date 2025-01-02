from rest_framework import serializers
from account.models import Player
from .models import *

class GameSerializer(serializers.ModelSerializer):
    formatted_start_time = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = '__all__'  # Include all fields or specify explicitly

    def get_formatted_start_time(self, obj):
        return obj.start_time.strftime('%d/%m/%Y %H:%M')

""" Game serializer """
class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'