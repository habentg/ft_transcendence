from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from others.auth_middleware import *
from django.views import View
from .models import *
from account.models import *
from django.urls import reverse
from others.views import BaseView
from account.serializers import PlayerSerializer
from .serializers import *
from rest_framework.exceptions import AuthenticationFailed
from others.auth_middleware import JWTCookieAuthentication
from django.template.loader import render_to_string
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status
from django.shortcuts import render

class GameViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    serializer_class = GameSerializer
    queryset = Game.objects.all()
    template_name = 'game/game.html'

    def list(self, request):
        all_games = Game.objects.all().filter(player_one=request.user.username)
        serializer = GameSerializer(all_games, many=True)
        if not serializer.data:
            return Response({'error': 'No games found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.data)

    def create(self, request):
        data = request.data
        # data['player_one'] = request.user.username
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            new_game = serializer.save()
            # if game is tournament - we add it to the tournament table
            return Response({'game_id': new_game.id}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)  

    def retrieve(self, request, pk=None):
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
        return Response({'html': f'<h3>issa game boi -- {pk}!</h3>'})
    

class LeaderBoardView(BaseView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    template_name = 'game/leaderboard.html'
    css = ['css/leaderboard.css']
    js = ['js/leaderboard.js']

    def handle_exception(self, exception):
        if isinstance(exception, AuthenticationFailed):
            if 'access token is invalid but refresh token is valid' in str(exception):
                response = HttpResponseRedirect(self.request.path)
                response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
                return response
            response = HttpResponseRedirect(reverse('landing'))
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            response.delete_cookie('csrftoken')
            response.status_code = 302
            return response
        return super().handle_exception(exception)
    
""" game view """
class GameView(APIView, BaseView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    template_name = 'game/game.html'
    title = 'Game Page'
    css = ['css/game.css']
    js = ['js/game.js']

    def handle_exception(self, exception):
        if isinstance(exception, AuthenticationFailed):
            if 'access token is invalid but refresh token is valid' in str(exception):
                query_params = self.request.GET.urlencode()
                redirect_url = self.request.path
                if query_params:
                    redirect_url = f"{redirect_url}?{query_params}"
                response = HttpResponseRedirect(redirect_url)
                response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
                return response
            response = HttpResponseRedirect(reverse('landing'))
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            response.delete_cookie('csrftoken')
            response.status_code = 302
            return response
        return super().handle_exception(exception)

    def get_context_data(self, request, **kwargs):
        is_ai = request.GET.get('isAI', 'false').lower() == 'true'
        return {
            'isAI': is_ai,
            'current_username': request.user.username
        }
	
class TournamentView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'game/tournament.html'
	title = 'Tournament Page'
	css = ['css/tournament.css']
	js = ['js/game.js', 'js/tournament_components.js', 'js/tournament.js']

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			if 'access token is invalid but refresh token is valid' in str(exception):
				response = HttpResponseRedirect(self.request.path)
				response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
				return response
			response = HttpResponseRedirect(reverse('landing'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			response.delete_cookie('csrftoken')
			response.status_code = 302
			return response
		return super().handle_exception(exception)

	def get(self, request):
		return super().get(request)
	
	def get_context_data(self, request, **kwargs):
		print("player username: ", request.user.username, flush=True)
		return {'username': request.user.username}
