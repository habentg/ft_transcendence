from django.http import JsonResponse, HttpResponseRedirect
from django.template.loader import render_to_string
from django.views import View
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import status
from account.serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_protect
import json
import os
from django.conf import settings
import requests
from .models import Player
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .utils import send_2fa_code
from django.shortcuts import render
import pyotp
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated
from others.auth_middleware import *
from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
import urllib.parse
from django.core.files import File
from urllib.request import urlopen
from tempfile import NamedTemporaryFile
from others.views import BaseView
from friendship.models import *
from account.utils import *
from game.models import Game
from game.serializers import GameSerializer
from others.throttles import *
import secrets
from django.utils import timezone

# view for the sign up page
@method_decorator(csrf_protect, name='dispatch')
class SignUpView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []
	template_name = 'account/signup.html'
	title = 'Sign Up'
	css = ['css/signup.css']
	js = ['js/signup.js']

	def get(self, request):
		if isUserisAuthenticated(request):
			return HttpResponseRedirect(reverse('home_page'))
		return super().get(request)

	def post(self, request):
		serializer = PlayerSignupSerializer(data=request.data)
		if serializer.is_valid():
			new_player = serializer.save()
			if new_player:
				new_player.is_logged_in = True
				new_player.save()
				refresh = RefreshToken.for_user(new_player)
				response = Response(status=status.HTTP_201_CREATED)
				response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax', secure=True)
				response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax', secure=True)
				FriendList.objects.create(player=new_player)
				return response
			return Response({'error_msg': 'Couldn\'t create the player'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
		print("Error in signup: ", serializer.errors, flush=True)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

# view for the sign in page
@method_decorator(csrf_protect, name='dispatch')
class SignInView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []
	template_name = 'account/signin.html'
	title = 'Sign In'
	css = ['css/signin.css']
	js = ['js/signin.js']

	def get(self, request):
		if isUserisAuthenticated(request):
			return HttpResponseRedirect(reverse('home_page'))
		return super().get(request)

	def post(self, request):
		serializer = PlayerSigninSerializer(data=request.data)
		print("Request data: ", request.data, flush=True)
		if serializer.is_valid():
			player = serializer.validated_data['player']
			if player.tfa:
				if send_2fa_code(Player.objects.filter(username=request.data['username']).first()):
					return Response({'redirect_url': '/2fa'}, status=status.HTTP_302_FOUND)
				else:
					return Response({'error_msg': 'Couldn\'t send OTP to the given Email'}, 
								status=status.HTTP_422_UNPROCESSABLE_ENTITY)
			refresh = RefreshToken.for_user(player)
			response = Response(status=status.HTTP_200_OK)
			response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax', secure=True)
			response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax', secure=True)
			player.is_logged_in = True
			player.save()
			return response
		error_message = serializer.errors.get('non_field_errors', ['No specific error'])[0]
		print("Error in sign in: ", serializer.errors, flush=True)
		return Response({'error_msg': error_message}, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

class SignOutView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []

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

	def get(self, request):
		player = request.user
		access_token_string = request.COOKIES.get('access_token')
		refresh_token_string = request.COOKIES.get('refresh_token')
		response = HttpResponseRedirect(reverse('landing'))
		if access_token_string:
			add_token_to_blacklist(access_token_string)
			response.delete_cookie('access_token')
		if refresh_token_string:
			add_token_to_blacklist(refresh_token_string)
			response.delete_cookie('refresh_token')
		response.delete_cookie('csrftoken')
		response.singed_out = True
		if (player.is_guest):
			player.delete()
		player.is_logged_in = False
		player.save()
		return response

# 42 Oauth2.0 callback
# DOC: https://api.intra.42.fr/apidoc/guides/web_application_flow
class Auth_42(View):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []

	def get(self, request):
		redirect_uri = settings.DOMAIN_NAME + '/oauth'
		client_id =settings.FOURTYTWO_OAUTH_CLIENT_ID
		state = secrets.token_urlsafe(32)
		request.session['oauth_state'] = state
		# Construct the 42 OAuth authorization URL
		authorization_url = f'https://api.intra.42.fr/oauth/authorize?' \
							f'client_id={client_id}&' \
							f'redirect_uri={redirect_uri}&' \
							f'response_type=code&' \
							f'scope=public&' \
							f'state={state}'

		return JsonResponse({'authorization_url': authorization_url})

# 42 Oauth2.0 callback
class OauthCallback(View):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []

	def get(self, request):
		if request.GET.get('state') != request.session['oauth_state']:
			return render(request, 'others/base.html', {'css':['css/404.css'],'html': render_to_string('others/404.html', {'status_code': '400', 'error_msg_header': 'Bad Request', 'error_msg': 'Invalid state from 42!'})})
		code = request.GET.get('code', None)
		if not code:
			return render(request, 'others/base.html', {'css':['css/404.css'],'html': render_to_string('others/404.html', {'status_code': '400', 'error_msg_header': 'Bad Request', 'error_msg': 'No code abtained from 42!'})})
		# Exchange code for access token
		token_response = requests.post('https://api.intra.42.fr/oauth/token', data= {
			'grant_type': 'authorization_code',
			'code': code,
			'redirect_uri': settings.DOMAIN_NAME + '/oauth',
			'client_id': settings.FOURTYTWO_OAUTH_CLIENT_ID,
			'client_secret': settings.FOURTYTWO_OAUTH_CLIENT_SECRET,
		})
		if token_response.status_code != 200:
			return render(request, 'others/base.html', {'css':['css/404.css'],'html': render_to_string('others/404.html', {'status_code': '400', 'error_msg_header': 'Bad Request', 'error_msg': 'Failed to obtain access token!'})})
		#get user info with the access token
		access_token = token_response.json()['access_token']
		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
			'Authorization': f'Bearer {access_token}'
		})
		if user_info_response.status_code != 200:
			return render(request, 'others/base.html', {'css':['css/404.css'],'html': render_to_string('others/404.html', {'status_code': '400', 'error_msg_header': 'Bad Request', 'error_msg': 'Failed to obtain 42 user information!'})})
		
		user_info = user_info_response.json()
		
		# Find or create user
		try:
			ft_player, created = Player.objects.get_or_create(
				username=user_info['login'],
				email=user_info['email'],
			)
			if created:
				ft_player.full_name = user_info['usual_full_name']
				image_url = user_info['image']['link']
				img_temp = NamedTemporaryFile(delete=True)
				img_temp.write(urlopen(image_url).read())
				img_temp.flush()
				ft_player.profile_picture.save(f"{ft_player.username}_pfp.jpg", File(img_temp))
				ft_player.set_unusable_password()  # Player can't login with password
				FriendList.objects.create(player=ft_player)
		except Exception as e:
			return render(request, 'others/base.html', {'css':['css/404.css'],'html': render_to_string('others/404.html', {'status_code': '400', 'error_msg_header': 'BAD REQUEST', 'error_msg': 'Failed to create 42 user account. Either username/email is already in use!'})})
		ft_player.is_logged_in = True
		ft_player.save()
		refresh = RefreshToken.for_user(ft_player)
		response = HttpResponseRedirect(reverse('home_page'))
		# secure=True
		response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax', secure=True)
		response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax', secure=True)
		return response

class PasswordReset(BaseView):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []
	template_name = 'account/password_reset.html'
	title = 'Password Reset'
	css = ['css/password_reset.css']
	js = ['js/password_reset.js']

	def get_throttles(self):
		"""Apply throttling only for the GET method (password update)."""
		if self.request.method == 'GET':
			return [PasswordUpdateThrottle()]
		return super().get_throttles()

	def get(self, request):
		return super().get(request)
	
	def post(self, request):
		data = json.loads(request.body)
		Player = get_user_model()
		player = Player.objects.filter(email=data['email']).first()
		if player:
			self.email_pass_reset_link(player)
			return JsonResponse({
				'success': 'player found!',
				'uidb64': urlsafe_base64_encode(force_bytes(player.pk)),
				'token': default_token_generator.make_token(player)
			}, status=status.HTTP_200_OK)
		return JsonResponse({'error_msg': 'No user found with provided Email Address!'}, status=status.HTTP_404_NOT_FOUND)

	def email_pass_reset_link(self, player):
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [player.email]
		subject = "Password Reset Requested"
		email_template_name = "account/password_reset_email_tamplate.txt"
		c = {
			'email': player.email,
			'domain': settings.DOMAIN_NAME,
			'site_name': 'Haben Pong',
			'uid': urlsafe_base64_encode(force_bytes(player.pk)),
			'user': player,
			'token': default_token_generator.make_token(player),
			'protocol': 'https',
		}
		email_body = render_to_string(email_template_name, c)
		send_mail(subject, email_body, from_email, recipient_list, fail_silently=False)

class PassResetNewPass(View):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []
	template_name = 'account/change_pass.html'
	title = 'Password Reset'
	css = ['css/password_reset.css']
	js = ['js/password_reset.js']

	def get(self, request, uidb64=None, token=None):
		Player = get_user_model()
		try:
			uid = force_str(urlsafe_base64_decode(uidb64))
			player = Player.objects.get(pk=uid)
		except (TypeError, ValueError, OverflowError, Player.DoesNotExist):
			player = None

		if player is not None and default_token_generator.check_token(player, token):
			html_content = render_to_string(self.template_name, {})
			resources = {
				'title': self.title,
				'css': self.css,
				'js': self.js,
				'html': html_content,
				'uidb64': uidb64,
				'token': token
			}
			return render(request, 'others/base.html', resources)
		else:
			return HttpResponseRedirect(reverse('password_reset'))

	def post(self, request, uidb64, token):
		data = json.loads(request.body)
		new_password = data.get('new_password')

		Player = get_user_model()
		try:
			uid = force_str(urlsafe_base64_decode(uidb64))
			player = Player.objects.get(pk=uid)
		except (TypeError, ValueError, OverflowError, Player.DoesNotExist):
			player = None

		if player is not None and default_token_generator.check_token(player, token):
			player.set_password(new_password)
			player.save()
			return JsonResponse({'success': 'Password reset successful!'}, status=status.HTTP_200_OK)
		else:
			return JsonResponse({'error_msg': 'Invalid password reset request'}, status=status.HTTP_400_BAD_REQUEST)

# 2FA - Two Factor Authentication
class TwoFactorAuth(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []
	template_name = 'account/2fa.html'
	title = 'Two Factor Authentication'
	css = ['css/2fa.css']
	js = ['js/2fa.js']

	def get_context_data(self, request):
		try:
			username = request.GET.get('username', '')
			player = Player.objects.filter(username=username).first()
			return {'email': player.email}
		except:
			return {'email':'dummy@email.com'}
	
	def post(self, request):
		data = json.loads(request.body)
		player = Player.objects.filter(email=data['email']).first()
		if player:
			totp = pyotp.TOTP(player.secret, interval=300)
			if totp.verify(data['otp']):
				player.verified = True
				refresh = RefreshToken.for_user(player)
				pfp = player.profile_picture.url if player.profile_picture else None
				response = Response({'username': player.username, 'pfp': pfp}, status=status.HTTP_200_OK)
				response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax', secure=True)
				response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax', secure=True)
				player.is_logged_in = True
				player.save()
				return response
			else:
				return JsonResponse({'error_msg': 'Invalid OTP!'}, status=status.HTTP_401_UNAUTHORIZED)
		return JsonResponse({'failure': 'no player found with that email!'}, status=status.HTTP_401_UNAUTHORIZED)

class TwoFactorSetUpToggle(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []

	def get_throttles(self):
		"""Apply throttling only for the PATCH method (password update)."""
		if self.request.method == 'PATCH':
			return [TwoFactorSetUpThrottle()]
		return super().get_throttles()

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
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': f'{signin_url}?{params}'
				}, status=302)
			return response
		return super().handle_exception(exception)

	def patch(self, request):
		player = request.user
		if player:
			player.tfa = not player.tfa
			player.save()
			return JsonResponse({'tfa_enabled': player.tfa}, status=status.HTTP_200_OK)
		return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

from django.core.paginator import Paginator
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# template_name for viewing player profile
class PlayerProfileView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'account/profile.html'
	title = 'Player Profile'
	css = ['css/profile.css']
	js = ['js/profile.js']

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

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def get_context_data(self, request, **kwargs):
		queried_user = request.user
		if kwargs.get('username') and kwargs.get('username') != request.user.username:
			queried_user = self.get_player(kwargs.get('username'))
			if not queried_user:
				return {'error_msg_404':f'Player "{kwargs.get('username')}" not found'}
		games = queried_user.games_played.all().order_by('-start_time')
		paginator = Paginator(games, 5)  # 5 games per page
		page_number = request.GET.get('page', 1)  # Get the page number from the request (default to 1)
		try:
			games_page = paginator.page(page_number)
		except PageNotAnInteger:
			games_page = paginator.page(1)
		except EmptyPage:
			games_page = paginator.page(paginator.num_pages)
		data = {}
		if queried_user.is_guest:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_self': False,
				'is_guest': True,
				'games': GameSerializer(games_page.object_list, many=True).data,
				'num_of_games': games.count(),
				'games_won': games.filter(outcome='WIN').count(),
				'games_lost': games.filter(outcome='LOSE').count(),
				'ai_games':games.filter(type='AI').exclude(outcome='CANCELLED').count(),
				'1v1_games':games.filter(type='VERSUS').exclude(outcome='CANCELLED').count(),
				'tournament_games':games.filter(type='TOURNAMENT').exclude(outcome='CANCELLED').count(),
			}
		else:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_friend': request.user.friend_list.friends.filter(username=queried_user.username).exists(),
				'is_requested_by_me': request.user.sent_requests.filter(receiver=queried_user).exists(),
				'am_i_requested': request.user.received_requests.filter(sender=queried_user).exists(),
				'is_self': queried_user == request.user,
				'num_of_friends': queried_user.friend_list.friends.count(),
				'games': GameSerializer(games_page.object_list, many=True).data,
				'num_of_games': games.count(),
				'games_won': games.filter(outcome='WIN').count(),
				'games_lost': games.filter(outcome='LOSE').count(),
				'ai_games':games.filter(type='AI').exclude(outcome='CANCELLED').count(),
				'1v1_games':games.filter(type='VERSUS').exclude(outcome='CANCELLED').count(),
				'tournament_games':games.filter(type='TOURNAMENT').exclude(outcome='CANCELLED').count(),
			}
		return data

# profile view
class PlayerProfileUpdatingView(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []

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
		response = HttpResponseRedirect(reverse('player_profile', kwargs={'username': self.request.user.username}))
		return response

	def delete(self, request):
		player = request.user
		access_token_string = request.COOKIES.get('access_token')
		refresh_token_string = request.COOKIES.get('refresh_token')
		if access_token_string:
			add_token_to_blacklist(access_token_string)
		if refresh_token_string:
			add_token_to_blacklist(refresh_token_string)
		player.delete()
		response = HttpResponseRedirect(reverse('landing'))
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		response.delete_cookie('csrftoken')
		response.status_code = 200 # coz the browser will try to redirect to the url in the response with delete method - wont work
		return response

	def patch(self, request):
		serializer = PlayerProfileSerializer(request.user, data=request.data, partial=True)
		if serializer.is_valid():
			serializer.save()  # Use the serializer to update the player object
			return Response({'username': request.user.username}, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	# updating user password
	def post(self, request):
		player = request.user
		if player.last_password_change and (timezone.now() - player.last_password_change).total_seconds() < 600:
			return Response({'error_msg': 'You can only change your password once per hour!'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
		serializer = ChangePasswordSerializer(data=request.data)
		if serializer.is_valid():
			if not player.check_password(serializer.validated_data['current_password']):
				return Response({'error_msg': 'Invalid current password!'}, status=status.HTTP_400_BAD_REQUEST)
			if serializer.validated_data['new_password'] != serializer.validated_data['confirm_password']:
				return Response({'error_msg': 'Mismatch while confirming password!'}, status=status.HTTP_400_BAD_REQUEST)
			if serializer.validated_data['current_password'] == serializer.validated_data['new_password']:
				return Response({'error_msg': 'Cant use Current Password as a New Password!'}, status=status.HTTP_400_BAD_REQUEST)
			""" blacklisting the old token """
		access_token_string = request.COOKIES.get('access_token')
		refresh_token_string = request.COOKIES.get('refresh_token')
		if access_token_string:
			add_token_to_blacklist(access_token_string)
		if refresh_token_string:
			add_token_to_blacklist(refresh_token_string)
		player.set_password(serializer.validated_data['new_password'])
		player.last_password_change = timezone.now()
		player.save()
		response = Response({'username': player.username}, status=200)
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		return response

class SettingsView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []
	template_name = 'account/settings.html'
	title = 'settings'
	css = ['css/settings.css']
	js = ['js/settings.js']

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
			response.delete_cookie('csrftoken')
			response.status_code = 302
			return response
		return super().handle_exception(exception)
	
	def get_context_data(self, request):
		player = request.user
		return {
			'player': PlayerSerializer(player).data
		}


class TempPlayer(APIView):
	authentication_classes = []
	permission_classes = []
	throttle_classes = []

	def get(self, request, *args, **kwargs):
		temp_player = createGuestPlayer()
		temp_player.is_guest = True
		new_jwts = RefreshToken.for_user(temp_player)
		response = HttpResponseRedirect(reverse('home_page'))
		response.set_cookie('access_token', str(new_jwts.access_token), httponly=True, samesite='Lax', secure=True)
		response.set_cookie('refresh_token', str(new_jwts), httponly=True, samesite='Lax', secure=True)
		temp_player.save()
		return response

""" player anonymization view """
class AnonymizePlayer(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	throttle_classes = []

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

	def get(self, request):
		token_string = request.COOKIES.get('access_token')
		if token_string:
			try:
				add_token_to_blacklist(token_string)
			except Exception as e:
				return HttpResponseRedirect(reverse('landing'))
		# create a new anonymous player
		anon = createGuestPlayer()
		new_jwts = RefreshToken.for_user(anon)
		response = Response({'anon_username': anon.username}, status=status.HTTP_200_OK)
		response.set_cookie('access_token', str(new_jwts.access_token), httponly=True, samesite='Lax', secure=True)
		response.set_cookie('refresh_token', str(new_jwts), httponly=True, samesite='Lax', secure=True)
		anon.save()
		return response
