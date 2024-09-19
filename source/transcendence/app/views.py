from django.http import JsonResponse
from rest_framework.response import Response
from django.template.loader import render_to_string
from django.views import View
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import status
from app.serializers import PlayerSignupSerializer, PlayerSigninSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect
import json
import jwt
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.conf import settings
import requests
from .models import Player
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import render, redirect
from .utils import send_2fa_code
import pyotp
import os
from django.http import HttpResponseRedirect
from django.urls import reverse

# base view for basic pages in our SPA
"""
	-> Basic Get view for all pages
	-> If the request is an AJAX request (click route), return the html content as JSON
	-> If the request is not an AJAX request (direct url visit), return the html content as a rendered page
"""
class BaseView(View):
	template_name = None
	title = None
	css = None
	js = None
	def get(self, request):
		context = self.get_context_data()
		html_content = render_to_string(self.template_name, context)
		resources = {
			'title': self.title,
			'css': self.css,
			'js': self.js,
			'html': html_content
		}
		if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return JsonResponse(resources)
		else:
			return render(request, 'app/base.html', resources)

	def get_context_data(self):
		return {}

# view for the home page
class HomeView(APIView):
	authentication_classes = [JWTAuthentication]

	def get(self, request):
		print(request.user, flush=True)
		try:
			user = request.user
			data = {
				'username': user.username,
				'email': user.email,
				'full_name': user.get_full_name(),
			}
			html_content = render_to_string('app/home.html', data)
			return JsonResponse({'html': html_content, 'title': 'Homie Page'})
		except Exception as e:
			print(e, flush=True)
			return JsonResponse({'error': 'Error in fetching user data'}, status=status.HTTP_400_BAD_REQUEST)
			

# view for the 404 page
class Catch_All(BaseView):
	template_name = 'app/404.html'
	title = 'Error Page'
	css = 'css/404.css'
	js = 'js/404.js'

# view for the index page
class Index(BaseView):
	template_name = 'app/index.html'
	title = 'Index Page'

# view for the sign up page
@method_decorator(csrf_protect, name='dispatch')
class SignUpView(BaseView, View):
	template_name = 'app/signup.html'
	title = 'Sign Up'
	css = 'css/signup.css'
	js = 'js/signup.js'
	
	def post(self, request):
		data = json.loads(request.body)
		serializer = PlayerSignupSerializer(data=data)
		if serializer.is_valid():
			new_player = serializer.save()
			if new_player:
				# Update last_login
				new_player.last_login = timezone.now()
				tfa = data.get('two_factor_enabled')
				if tfa == 'true':
					print('2fa is true', flush=True)
					new_player.tfa = True
				else:
					print('2fa is false', flush=True)
					new_player.tfa = False
				new_player.save()
				refresh = RefreshToken.for_user(new_player)
				data = {
					'refresh_token': str(refresh),
					'access_token': str(refresh.access_token),
					'redirect': 'home'
				}
				return JsonResponse(data, status=status.HTTP_201_CREATED)
		return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# view for the sign in page
@method_decorator(csrf_protect, name='dispatch')
class SignInView(BaseView, View):
	template_name = 'app/signin.html'
	title = 'Sign In'
	css = 'css/signin.css'
	js = 'js/signin.js'

	def post(self, request):
		data = json.loads(request.body)
		serializer_class = PlayerSigninSerializer(data=data)
		if serializer_class.is_valid():
			username = serializer_class.validated_data['username']
			password = serializer_class.validated_data['password']
			player = authenticate(username=username, password=password)
			if player is not None:
				# Generate JWT tokens and Create a response with the JWT tokens
				refresh = RefreshToken.for_user(player)
				data = {
					'refresh_token': str(refresh),
					'access_token': str(refresh.access_token),
					'redirect': 'home',
					'tfa_code': False
				}
				# Update last_login
				if not player.tfa:
					player.last_login = timezone.now()
					player.save()
				else:
					# send 2fa code
					if send_2fa_code(player):
						print('2fa code sent', flush=True)
						data['tfa_code'] = True
						data['tfa_code_sent'] = 'success'
						return JsonResponse(data, status=status.HTTP_200_OK)
					else:
						print('2fa code couldnt be sent', flush=True)
						data['tfa_code'] = True
						data['tfa_code_sent'] = 'failure'
						return JsonResponse({'tfa_code_sent': 'failure', 'error_msg': 'Couldnt send OTP to the given Email'}, status=status.HTTP_401_UNAUTHORIZED)
				return JsonResponse(data, status=status.HTTP_200_OK)
			return JsonResponse({'error_msg': 'Invalid username or password!'}, status=status.HTTP_401_UNAUTHORIZED)
		return JsonResponse(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)

class SignOutView(BaseView, View):
	def get(self, request):
		print("Signing out", flush=True)
		response = HttpResponseRedirect(reverse('landing'))
		# invalidate the tokens - before deleting the cookies
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		response.singed_out = True
		print("response: ", response, flush=True)
		return response

# view for the csrf token request
class CsrfRequest(View):
	def get(self, request):
		return JsonResponse({'csrf_token': get_token(request)}, status=status.HTTP_200_OK)

# 42 Oauth2.0 callback
# DOC: https://api.intra.42.fr/apidoc/guides/web_application_flow
class Auth_42(View):
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

class OauthCallback(View):
	def get(self, request):
		code = request.GET.get('code')
		
		if not code:
			return JsonResponse({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)
		
		# Exchange code for access token
		token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
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
		print("Access Token: ", access_token, flush=True)
		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
			'Authorization': f'Bearer {access_token}'
		})

		if user_info_response.status_code != 200:
			return JsonResponse({'error': 'Failed to obtain user information.'}, status=user_info_response.status_code)
		
		user_info = user_info_response.json()
		
		print("user: ", user_info, flush=True)
		# Find or create user
		user, created = Player.objects.get_or_create(
			username=user_info['login'],
			defaults={
				'email': user_info['email'],
				'first_name': user_info['first_name'],
				'last_name': user_info['last_name'],
			}
		)

		if created:
			user.set_password('42password')  # will be using more secure password in the future
			user.save()

		# Update last login
		user.last_login = timezone.now()
		user.save()

		# Generate JWT tokens and Create a response with the JWT tokens
		refresh = RefreshToken.for_user(user)
		data = {
			'refresh_token': str(refresh),
			'access_token': str(refresh.access_token),
			'redirect': '/home'
		}

		# Set the tokens in cookies
		response = HttpResponseRedirect(data['redirect'])
		response.set_cookie('access_token', data['access_token'], httponly=True)
		response.set_cookie('refresh_token', data['refresh_token'], httponly=True)

		return response

	
class PasswordReset(BaseView):
	template_name = 'app/password_reset.html'
	title = 'Password Reset'
	css = 'css/password_reset.css'
	js = 'js/password_reset.js'

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
		email_template_name = "app/password_reset_email_tamplate.txt"
		c = {
			'email': player.email,
			'domain': 'localhost:8000',
			'site_name': 'Haben Pong',
			'uid': urlsafe_base64_encode(force_bytes(player.pk)),
			'user': player,
			'token': default_token_generator.make_token(player),
			'protocol': 'http',
		}
		email_body = render_to_string(email_template_name, c)
		send_mail(subject, email_body, from_email, recipient_list, fail_silently=False)

class PassResetNewPass(View):
	template_name = 'app/change_pass.html'
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
			return render(request, 'app/base.html', resources)
		else:
			return render(request, 'app/invalid_token.html')

	def post(self, request, uidb64, token):
		data = json.loads(request.body)
		new_password = data.get('new_password')

		User = get_user_model()
		try:
			uid = force_str(urlsafe_base64_decode(uidb64))
			user = User.objects.get(pk=uid)
		except (TypeError, ValueError, OverflowError, User.DoesNotExist):
			user = None

		if user is not None and default_token_generator.check_token(user, token):
			user.set_password(new_password)
			user.save()
			return JsonResponse({'success': 'Password reset successful!'}, status=status.HTTP_200_OK)
		else:
			return JsonResponse({'error_msg': 'Invalid password reset request'}, status=status.HTTP_400_BAD_REQUEST)

class PassResetConfirm(BaseView):
	template_name = 'app/password_reset_complete.html'
	title = 'Password Reset'


# 2FA - Two Factor Authentication
class TwoFactorAuth(APIView, BaseView):
	authentication_classes = [JWTAuthentication]
	template_name = 'app/2fa.html'
	title = 'Two Factor Authentication'
	css = 'css/2fa.css'
	js = 'js/2fa.js'


	def post(self, request):
		data = json.loads(request.body)
		player = request.user
		if player:
			print("Player username!: ", player.username, flush=True)
			totp = pyotp.TOTP(player.secret, interval=300)
			if totp.verify(data['otp']):
				print("Valid OTP", flush=True)
				player.verified = True
				player.save()
				return JsonResponse({'redirect': 'home'}, status=status.HTTP_200_OK)
			else:
				print("Invalid OTP!", flush=True)
				return JsonResponse({'error_msg': 'Invalid OTP!'}, status=status.HTTP_401_UNAUTHORIZED)
		return JsonResponse({'failure': 'no player found with that email!'}, status=status.HTTP_401_UNAUTHORIZED)

	def get_context_data(self):
		return {'email': self.request.user.email}
	
class HealthCheck(View):
	def get(self, request):
		return JsonResponse({'status': 'healthy'}, status=status.HTTP_200_OK)