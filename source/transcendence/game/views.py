from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from others.auth_middleware import *
from .models import *
from account.models import *
from django.urls import reverse
from others.views import BaseView
from .serializers import *
from rest_framework.exceptions import AuthenticationFailed
from others.auth_middleware import JWTCookieAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render

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
    
    def post(self, request):
        data = request.data
        print("data in POST: ", data, flush=True)
        # data['player_one'] = request.user.username
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            new_game = serializer.save()
            # when we are creating a game, if its a tournament - we take the tournament id and add it to the tournament table
            if data['tournament_id']:
                tournament = Tournament.objects.get(id=data['tournament_id'])
                tournament.add_game(new_game)
                tournament.save()
            return JsonResponse({'game_id': new_game.id})
        return JsonResponse({'error': 'Invalid data'}, status=400)
    
    def patch(self, request):
        try:
            game_id = request.GET.get('game_id', None)
            if not game_id:
                return Response({'error': 'Game ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            game = Game.objects.get(id=game_id)
            serializer = GameSerializer(instance=game, data=request.data, partial=True)
            if serializer.is_valid():
                updated_game = serializer.save()
                return Response({'game_id': updated_game.id}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=status.HTTP_404_NOT_FOUND)
	
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
    
    def get_context_data(self, request, **kwargs):
        print("player username: ", request.user.username, flush=True)
        return {'username': request.user.username}

    def patch(self, request):
        tournament_id = request.GET.get('tournament_id', None)
        print("tournament_id: ", tournament_id, flush=True)
        if tournament_id: 
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                return JsonResponse({'tournament_id': tournament.id, 'tournament_games': tournament.games})
            except:
                return JsonResponse({'error': 'Tournament not found'}, status=404)
        else:
            tournaments = Tournament.objects.all()
            return JsonResponse({'tournaments': list(tournaments.values())})


    def post(self, request):
        try:
            tournament = Tournament.objects.create()
            return JsonResponse({'tournament_id': tournament.id})
        except:
            return JsonResponse({'error': 'Couldnt create Tournament'}, status=400)

# class TournamentRetrievalView(APIView):
#     authentication_classes = [JWTCookieAuthentication]
#     permission_classes = [IsAuthenticated]
#     throttle_classes = []

#     def handle_exception(self, exception):
#         if isinstance(exception, AuthenticationFailed):
#             if 'access token is invalid but refresh token is valid' in str(exception):
#                 response = HttpResponseRedirect(self.request.path)
#                 response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
#                 return response
#             response = HttpResponseRedirect(reverse('landing'))
#             response.delete_cookie('access_token')
#             response.delete_cookie('refresh_token')
#             response.delete_cookie('csrftoken')
#             response.status_code = 302
#             return response
#         return super().handle_exception(exception)

#     def get(self, request):
#         tournament_id = 1
#         # print("tournament_id: ", tournament_id, flush=True)
#         # print("all tournaments: ", Tournament.objects.all(), flush=True)
#         if tournament_id: 
#             try:
#                 tournament = Tournament.objects.get(id=tournament_id)
#                 tournament = Tournament.objects.get(id=1)
#                 games_in_tournament = tournament.games.all()
#                 print("tournament: ", tournament, flush=True)
#                 print("tournament: ", tournament.id, flush=True)
#                 print("tournament: ", games_in_tournament, flush=True)
#                 return JsonResponse({'tournament_id': tournament.id, 'tournament_games': games_in_tournament})
#             except:
#                 return JsonResponse({'error': 'Tournament not found'}, status=404)
#         else:
#             tournaments = Tournament.objects.all()
            return JsonResponse({'tournaments': list(tournaments.values())})
