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
from django.template.loader import render_to_string
import urllib.parse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from account.serializers import PlayerSerializer

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
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            new_game = serializer.save()
            if data.get('type') == 'TOURNAMENT':
                tournament = Tournament.objects.get(id=data['tournament_id'])
                new_game.tournament_id = tournament.id
                new_game.save()
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
            data = request.data
            update_data = {
                'final_score': f"{data.get('player1_score')} - {data.get('player2_score')}",
                'outcome': 'WIN'
            }
            if request.user.username == data.get('player1_username') and data.get('player1_score') < data.get('player2_score'):
                update_data['outcome'] = 'LOSE'
                request.user.rating -= 5
                request.user.save()
            elif request.user.username == data.get('player2_username') and data.get('player1_score') > data.get('player2_score'):
                update_data['outcome'] = 'LOSE' 
                request.user.rating -= 5
                request.user.save()
            elif request.user.username == data.get('player2_username') or request.user.username == data.get('player1_username'):
                request.user.rating += 5
                request.user.save()
            serializer = GameSerializer(instance=game, data=update_data, partial=True)
            if serializer.is_valid():
                return Response({'game_id': serializer.save().id}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
        except Game.DoesNotExist:
            return Response({'error': 'Game not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=status.HTTP_404_NOT_FOUND)

class PlayerGameHistoryView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    template_name = 'game/game_history.html'

    def handle_exception(self, exception):
        if isinstance(exception, AuthenticationFailed):
            if 'access token is invalid but refresh token is valid' in str(exception):
                response = HttpResponseRedirect(self.request.path)
                response.set_cookie('access_token', generate_access_token(self.request.COOKIES.get('refresh_token')), httponly=True, samesite='Lax', secure=True)
                return response
            signin_url = reverse('signin_page')
            params = urllib.parse.urlencode({'next': self.request.path})
            response = HttpResponseRedirect(f'{signin_url}?{params}')
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        return super().handle_exception(exception)
	
    def get(self, request, **kwargs):
        try:
            player_username = request.GET.get('player', None)
            player = Player.objects.get(username=player_username)
            games = Game.objects.filter(Q(player_one=player.username) | Q(player_two=player.username)).order_by('-start_time')
            paginator = Paginator(games, 5)
            page_number = request.GET.get('page', 1)
            try:
                games_page = paginator.page(page_number)
            except PageNotAnInteger:
                games_page = paginator.page(1)
            except EmptyPage:
                games_page = paginator.page(paginator.num_pages)
            return Response({
                    'history': render_to_string(self.template_name, 
                    {
                        'games': GameSerializer(games_page.object_list, many=True).data,
                        'player': player.username,
                        'current_page': games_page.number,
                        'next':  games_page.next_page_number() if games_page.has_next() else 0,
                        'previous': games_page.previous_page_number() if games_page.has_previous() else 0,
                        'num_pages': paginator.num_pages,
                        'total_games': games.count(),
                    }),
                })
        except Exception as e:
            print("error: ", str(e), flush=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaderBoardView(APIView, BaseView):
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
    
    def get_context_data(self, request, **kwargs):
        all_players = Player.objects.all().order_by('-rating')
        paginator = Paginator(all_players, 10)
        page_number = request.GET.get('page', 1)
        try:
            players_page = paginator.page(page_number)
        except PageNotAnInteger:
            players_page = paginator.page(1)
        except EmptyPage:
            players_page = paginator.page(paginator.num_pages)
        data = {
            'players': players_page.object_list,
            'current_page': players_page.number,
            'next':  players_page.next_page_number() if players_page.has_next() else 0,
            'previous': players_page.previous_page_number() if players_page.has_previous() else 0,
            'num_pages': paginator.num_pages,
            'page_offset': 10 * (players_page.number - 1), # 0 for first page
        }
        return data
    
class TournamentView(APIView, BaseView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    template_name = 'game/tournament.html'
    title = 'Tournament Page'
    css = ['css/tournament.css', 'css/game.css']
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
        data = request.data
        try:
            tournament = Tournament.objects.create()
            tournament.type = data.get('type', 4)
            tournament.save()
            return JsonResponse({'tournament_id': tournament.id})
        except:
            return JsonResponse({'error': 'Couldnt create Tournament'}, status=400)

class TournamentRetrievalView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = []
    template_name_iv = 'game/tournament_viewer_IV.html'
    template_name_viii = 'game/tournament_viewer_VIII.html'
    css = ['css/tournament.css']

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
        tournament_id = request.GET.get("tournament_id")
        if tournament_id:
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                games_in_tournament = tournament.games.values("id", "player_one", "player_two", "final_score")
                list_of_games = list(games_in_tournament)
                if (tournament.type == 8):
                    return Response({'css': self.css, "tournament_id": tournament.id, "tournament_type": 8, 'tournament_games': list_of_games}, status=200)
                    # return Response({"tournament_id": tournament.id, 'tournament_games': list_of_games, "html": render_to_string(self.template_name_viii, {'game': list_of_games})}, status=200)
                elif (tournament.type == 4):
                    return Response({'css': self.css, "tournament_id": tournament.id, "tournament_type": 4, 'tournament_games': list_of_games}, status=200)
                    # return Response({"tournament_id": tournament.id, 'tournament_games': list_of_games, "html": render_to_string(self.template_name_iv, {'game': list_of_games})}, status=200)
                print("are we here in tournament retrieval view?")
                return Response({"tournament_id": tournament.id, "error": 'issues with number of games in tournament'}, status=400)
            except Tournament.DoesNotExist:
                return Response({"error": "Tournament not found"}, status=404)
            except Exception as e:
                print("error: ", str(e), flush=True)
                return Response({"error": str(e)}, status=400)
        else:
            tournaments = Tournament.objects.values("id", "name")
            return JsonResponse({"tournaments": list(tournaments)}, status=200)