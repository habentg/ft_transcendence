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
from django.utils import timezone
from django.conf import settings
import requests
from .models import Player
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render
from .utils import send_2fa_code
import pyotp
import jwt
import random
import string
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated
from .auth_middleware import JWTCookieAuthentication, add_token_to_blacklist
from django.middleware.csrf import get_token
from django.db import connection
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
import urllib.parse
from django.core.files import File
from urllib.request import urlopen
from tempfile import NamedTemporaryFile
from others.views import BaseView
from friendship.models import *
from account.utils import *

# view for the sign up page
@method_decorator(csrf_protect, name='dispatch')
class SignUpView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'account/signup.html'
	title = 'Sign Up'
	css = 'css/signup.css'
	js = 'js/signup.js'

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
				response.set_cookie('access_token', str(refresh.access_token), httponly=True)
				response.set_cookie('refresh_token', str(refresh), httponly=True)
				# create a friend list for the new player
				FriendList.objects.create(player=new_player)
				return response
			return Response({'error_msg': 'Couldn\'t create the player'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
		print(serializer.errors, flush=True)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

# view for the sign in page
@method_decorator(csrf_protect, name='dispatch')
class SignInView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'account/signin.html'
	title = 'Sign In'
	css = 'css/signin.css'
	js = 'js/signin.js'

	def get(self, request):
		if isUserisAuthenticated(request):
			return HttpResponseRedirect(reverse('home_page'))
		next_url = request.GET.get('next', '/')
		context = self.get_context_data(request)
		context['next'] = next_url
		return super().get(request)

	def post(self, request):
		serializer = PlayerSigninSerializer(data=request.data)
		if serializer.is_valid():
			player = serializer.validated_data['player']
			refresh = RefreshToken.for_user(player)
			response = Response(status=status.HTTP_200_OK)
			response.set_cookie('access_token', str(refresh.access_token), httponly=True)
			response.set_cookie('refresh_token', str(refresh), httponly=True)
			if player.tfa:
				if send_2fa_code(player):
					response.status_code = 302  # or 301 for a permanent redirect
				else:
					return Response({'error_msg': 'Couldn\'t send OTP to the given Email'}, 
								status=status.HTTP_422_UNPROCESSABLE_ENTITY)
			player.is_logged_in = True
			player.save()
			return response
		error_message = serializer.errors.get('non_field_errors', ['No specific error'])[0]
		return Response({'error_msg': error_message}, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

class SignOutView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		player = request.user
		token_string = request.COOKIES.get('access_token')
		print("our player: ", player, flush=True)
		if token_string:
			try:
				add_token_to_blacklist(token_string)
			except jwt.ExpiredSignatureError or jwt.InvalidTokenError or jwt.DecodeError as e:
				print(e, flush=True)
				return HttpResponseRedirect(reverse('landing'))
			response = HttpResponseRedirect(reverse('landing'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			response.delete_cookie('csrftoken')
			print(f"Player {player.username} signed out", flush=True)
			response.singed_out = True
			if (player.is_guest):
				player.delete()
			return response
		return HttpResponseRedirect(reverse('landing'))

# 42 Oauth2.0 callback
# DOC: https://api.intra.42.fr/apidoc/guides/web_application_flow
class Auth_42(View):
	authentication_classes = []
	permission_classes = []

	def get(self, request):
		redirect_uri = settings.DOMAIN_NAME + '/oauth/'
		client_id =settings.FOURTYTWO_OAUTH_CLIENT_ID
		# Construct the 42 OAuth authorization URL
		authorization_url = f'https://api.intra.42.fr/oauth/authorize?' \
							f'client_id={client_id}&' \
							f'redirect_uri={redirect_uri}&' \
							f'response_type=code&' \
							f'scope=public'

		return JsonResponse({'authorization_url': authorization_url})

# 42 Oauth2.0 callback
class OauthCallback(View):
	authentication_classes = []
	permission_classes = []

	def get(self, request):
		code = request.GET.get('code')
		
		if not code:
			return JsonResponse({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)
		
		# Exchange code for access token
		token_response = requests.post('https://api.intra.42.fr/oauth/token', data= {
			'grant_type': 'authorization_code',
			'code': code,
			'redirect_uri': settings.DOMAIN_NAME + '/oauth/',
			'client_id': settings.FOURTYTWO_OAUTH_CLIENT_ID,
			'client_secret': settings.FOURTYTWO_OAUTH_CLIENT_SECRET,
		})

		if token_response.status_code != 200:
			return JsonResponse({'error': 'Failed to obtain access token'}, status=token_response.status_code)
		
		access_token = token_response.json()['access_token']
		
		# Get user info
		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
			'Authorization': f'Bearer {access_token}'
		})

		if user_info_response.status_code != 200:
			return JsonResponse({'error': 'Failed to obtain 42 user information.'}, status=user_info_response.status_code)
		
		user_info = user_info_response.json()
		

		# Find or create user
		ft_player, created = Player.objects.get_or_create(
			username=user_info['login'],
			email=user_info['email'],
			full_name=user_info['usual_full_name'],
		)

		if created:
			image_url = user_info['image']['link']
			img_temp = NamedTemporaryFile(delete=True)
			img_temp.write(urlopen(image_url).read())
			img_temp.flush()
			ft_player.profile_picture.save(f"{ft_player.username}_profile.jpg", File(img_temp))
			ft_player.set_unusable_password() # User can't login with password
			FriendList.objects.create(player=ft_player)
			ft_player.save()

		# Update last login
		ft_player.is_logged_in = True
		ft_player.save()

		# Generate JWT tokens and Create a response with the JWT tokens
		refresh = RefreshToken.for_user(ft_player)

		# Set the tokens in cookies
		response = HttpResponseRedirect(reverse('home_page'))
		# secure=True
		response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax')
		response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax')

		return response

	
class PasswordReset(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'account/password_reset.html'
	title = 'Password Reset'
	css = 'css/password_reset.css'
	js = 'js/password_reset.js'

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
		return JsonResponse({'error_msg': 'Couldnt find your email!'}, status=status.HTTP_404_NOT_FOUND)

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
			'protocol': 'http',
		}
		email_body = render_to_string(email_template_name, c)
		send_mail(subject, email_body, from_email, recipient_list, fail_silently=False)

class PassResetNewPass(View):
	authentication_classes = []
	permission_classes = []
	template_name = 'account/change_pass.html'
	title = 'Password Reset'
	js = 'js/password_reset.js'
	css = 'css/password_reset.css'

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
			return render(request, 'account/invalid_token.html')

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

class PassResetConfirm(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'account/password_reset_complete.html'
	title = 'Password Reset'


# 2FA - Two Factor Authentication
class TwoFactorAuth(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'account/2fa.html'
	title = 'Two Factor Authentication'
	css = 'css/2fa.css'
	js = 'js/2fa.js'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
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


	def get_context_data(self, request):
		return {'email': self.request.user.email}
	
	def post(self, request):
		data = json.loads(request.body)
		player = request.user
		if player:
			totp = pyotp.TOTP(player.secret, interval=300)
			if totp.verify(data['otp']):
				player.verified = True
				player.save()
				return JsonResponse({'redirect': 'home'}, status=status.HTTP_200_OK)
			else:
				return JsonResponse({'error_msg': 'Invalid OTP!'}, status=status.HTTP_401_UNAUTHORIZED)
		return JsonResponse({'failure': 'no player found with that email!'}, status=status.HTTP_401_UNAUTHORIZED)
	
	def patch(self, request):
		player = request.user
		if player:
			player.tfa = not player.tfa
			player.save()
			return JsonResponse({'tfa_enabled': player.tfa}, status=status.HTTP_200_OK)
		return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# profile view
class ProfileView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'account/profile.html'
	title = 'Profile'
	css = 'css/profile.css'
	js = 'js/profile.js'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		response = HttpResponseRedirect(reverse('player_profile', kwargs={'username': self.request.user.username}))
		print('Redirecting to player profile', flush=True)
		return response

	def delete(self, request):
		player = request.user
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
			return JsonResponse({'success': 'Account updated successfully!'}, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def get_player(self, username):
		return Player.objects.filter(username=username).first()
	
	def get_context_data(self, request, **kwargs):
		queried_user = request.user
		if kwargs.get('username') and kwargs.get('username') != request.user.username:
			queried_user = self.get_player(kwargs.get('username'))
			if not queried_user:
				print('Player not found', flush=True)
				return {'error_msg':'Player not found'}
		data = {}
		if queried_user.is_guest:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_self': False,
			}
		else:
			data = {
				'player': PlayerSerializer(queried_user).data,
				'is_friend': request.user.friend_list.friends.filter(username=queried_user.username).exists(),
				'is_requested_by_me': request.user.sent_requests.filter(receiver=queried_user).exists(),
				'am_i_requested': request.user.received_requests.filter(sender=queried_user).exists(),
				'is_self': queried_user == request.user,
			}
		return data


# updating user password
class UpdatePlayerPassword(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	
	def patch(self, request):
		player = request.user
		Player = get_user_model()
		serializer = ChangePasswordSerializer(data=request.data)
		if serializer.is_valid():
			if not player.check_password(serializer.validated_data['current_password']):
				print("Invalid current password", flush=True)
				return JsonResponse({'error_msg': 'Invalid current password!'}, status=status.HTTP_400_BAD_REQUEST)
			if serializer.validated_data['new_password'] != serializer.validated_data['confirm_password']:
				print("password mismatch", flush=True)
				return JsonResponse({'error_msg': 'Mismatch while confirming password!'}, status=status.HTTP_400_BAD_REQUEST)
			player.set_password(serializer.validated_data['new_password'])
			player.save()
			print("password update success", flush=True)
			return JsonResponse({'success': 'Password updated successfully!'}, status=status.HTTP_200_OK)
		print("password error: ", serializer.errors, flush=True)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlayerSettings(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'account/settings.html'
	title = 'settings'
	css = 'css/settings.css'
	js = 'js/settings.js'

	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
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


""" player anonymization view """
def generate_username():
	length = 7
	characters = string.ascii_letters + string.digits
	random_string = ''.join(random.choice(characters) for _ in range(length))
	return random_string

def createGuestPlayer(request):
	anon = Player.objects.create(
		username = generate_username(),
		full_name = 'Guest Player',
	)
	guest_email = f'{anon.username}@guest_email.com'
	anon.email = guest_email
	print(f"Anon player created: {anon.email}", flush=True)
	anon.set_unusable_password()
	anon.is_guest = True
	# FriendList.objects.create(player=anon) #! we dont want to create a friend list for a guest player
	anon.save()
	return anon

class AnonymizePlayer(APIView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]

	def patch(self, request):
		# sign out the player
		token_string = request.COOKIES.get('access_token')
		print("player b4 anon: ", request.user, flush=True)
		if token_string:
			try:
				add_token_to_blacklist(token_string)
			except jwt.ExpiredSignatureError or jwt.InvalidTokenError or jwt.DecodeError as e:
				print(e, flush=True)
				return HttpResponseRedirect(reverse('landing'))
		# create a new anonymous player
		anon = createGuestPlayer(request)
		new_jwts = RefreshToken.for_user(anon)
		response = Response(status=status.HTTP_200_OK)
		response.set_cookie('access_token', str(new_jwts.access_token), httponly=True)
		response.set_cookie('refresh_token', str(new_jwts), httponly=True)
		anon.save()
		return response