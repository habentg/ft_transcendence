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
from django.shortcuts import render

class GameViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = GameSerializer
    queryset = Game.objects.all()
    template_name = 'game/game.html'

    def list(self, request):
        all_games = Game.objects.all().filter(player_one=request.user.id)
        serializer = GameSerializer(all_games, many=True)
        if not serializer.data:
            return Response({'error': 'No games found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.data)

    def create(self, request):
        data = request.data
        data['player_one'] = request.user.id
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            new_game = serializer.save()
            return Response({'game_id': new_game.id}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)  

    def retrieve(self, request, pk=None):
        print("============== GameViewSet - RETRIEVE method ==============", flush=True)
        game = Game.objects.filter(id=pk).first()
        if game:
            game_data = GameSerializer(game).data
            return Response(game_data)
        return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        try:
            game = Game.objects.filter(id=pk).first()
            serializer = GameSerializer(instance=game, data=request.data, partial=True)
            if serializer.is_valid():
                updated_game = serializer.save()
                return Response({'game_id': updated_game.id}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, pk=None):
        print("============== GameViewSet - DESTROY method =============", flush=True)
        return Response({'html': f'<h3>issa game boi -- {pk}!</h3>'})
    

class LeaderBoardView(BaseView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    template_name = 'game/leaderboard.html'
    css = ['game/leaderboard.css']
    js = ['game/leaderboard.js']

    def get(self, request):
        return render(request, self.template_name)
    
""" game view """
class GameView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'game/game.html'
	title = 'Game Page'
	css = ['css/game.css']
	js = ['js/game.js']

	# def get(self, request):
	# 	return super().get(request)
	def get_context_data(self, request, **kwargs):
		# print request.GET params
		is_ai = request.GET.get('isAI', 'false').lower() == 'true'
		return {
			'isAI': is_ai,
			'current_username': request.user.username
		}
	
class TournamentView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'game/tournament.html'
	title = 'Tournament Page'
	css = ['css/tournament.css']
	js = ['js/tournament.js']

	def get(self, request):
		return super().get(request)






# class GameAIView(BaseView):
# 	authentication_classes = []
# 	permission_classes = []
# 	template_name = 'others/game.html'
# 	title = 'Game AI Page'
# 	css = ['css/game.css']
# 	js = ['js/gameai.js']

# 	def get(self, request):
# 		return super().get(request)