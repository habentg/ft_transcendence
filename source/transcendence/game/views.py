from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import *
from django.views import View
from .models import *
from account.models import *
from django.urls import reverse
from others.views import BaseView
from account.serializers import PlayerSerializer
from .serializers import *
from rest_framework.exceptions import AuthenticationFailed
from account.auth_middleware import JWTCookieAuthentication
from django.template.loader import render_to_string
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status

class GameViewSet(viewsets.ViewSet):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    template_name = 'game/game.html'

    def list(self, request):
        print("============== GameViewSet - LIST method ==============", flush=True)
        return Response({'html': '<h3>issa game boi!</h3>'})

    def create(self, request):
        data = request.data
        print("============== GameViewSet - CREATE method ==============", flush=True)
        print(data, flush=True)
        new_game = GameSerializer(data=data)
        if new_game.is_valid():
            new_game.save()
            return Response({'html': f'<h3>issa game boi!</h3>'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)  

    def retrieve(self, request, pk=None):
        print("============== GameViewSet - RETRIEVE method ==============", flush=True)
        game = Game.objects.filter(id=pk).first()
        if game:
            game_data = GameSerializer(game).data
            return Response(game_data)
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        print("============== GameViewSet - UPDATE method =============", flush=True)
        
        return Response({'html': f'<h3>issa game boi -- {pk}!</h3>'})

    def partial_update(self, request, pk=None):
        print("============== GameViewSet - PARTIAL UPDATE method =============", flush=True)
        return Response({'html': f'<h3>issa game boi -- {pk}!</h3>'})
    def destroy(self, request, pk=None):
        print("============== GameViewSet - DESTROY method =============", flush=True)
        return Response({'html': f'<h3>issa game boi -- {pk}!</h3>'})