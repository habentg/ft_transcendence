from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.template.loader import render_to_string
from django.views import View
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import status
from app.serializers import PlayerSignupSerializer, PlayerSigninSerializer
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
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated
from .auth_middleware import JWTCookieAuthentication, add_token_to_blacklist
from django.middleware.csrf import get_token
from django.db import connection
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
import urllib.parse

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
		context = self.get_context_data(request)
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

	def get_context_data(self, request):
		return {}

# view for the home page
class HomeView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'app/home.html'
	title = 'Home Page'
	css = 'css/home.css'
	js = 'js/home.js'
	
	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			signin_url = reverse('signin_page')
			params = urllib.parse.urlencode({'next': self.request.path})
			response = HttpResponseRedirect(f'{signin_url}?{params}')
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			response.delete_cookie('is_auth')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': f'{signin_url}?{params}'
				}, status=401)
			return response
		return super().handle_exception(exception)

	
	def get_context_data(self, request) :
		user = request.user
		data = {
			'username': user.username,
			'email': user.email,
			'full_name': user.get_full_name(),
		}
		return data
	
# view for the 404 page1
class Catch_All(BaseView):
	template_name = 'app/404.html'
	title = 'Error Page'
	css = 'css/404.css'
	js = 'js/404.js'

	def get(self, request):
		print('404 => with Request: ', request, flush=True)
		return super().get(request)

# view for the index page
class Index(BaseView):
	template_name = 'app/index.html'
	title = 'Index Page'

	def get(self, request):
		return super().get(request)

# view for the sign up page
@method_decorator(csrf_protect, name='dispatch')
class SignUpView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'app/signup.html'
	title = 'Sign Up'
	css = 'css/signup.css'
	js = 'js/signup.js'

	def get(self, request):
		return super().get(request)

	def post(self, request):
		serializer = PlayerSignupSerializer(data=request.data)
		if serializer.is_valid():
			new_player = serializer.save()
			if new_player:
				new_player.last_login = timezone.now()
				new_player.save()
				refresh = RefreshToken.for_user(new_player)
				response = Response(status=status.HTTP_201_CREATED)
				response.set_cookie('access_token', str(refresh.access_token), httponly=True)
				response.set_cookie('refresh_token', str(refresh), httponly=True)
				return response
			return Response({'error_msg': 'Couldn\'t create the player'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

# view for the sign in page
@method_decorator(csrf_protect, name='dispatch')
class SignInView(APIView, BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'app/signin.html'
	title = 'Sign In'
	css = 'css/signin.css'
	js = 'js/signin.js'

	def get(self, request):
		next_url = request.GET.get('next', '/')
		context = self.get_context_data(request)
		context['next'] = next_url
		print('Signin view: ', context, flush=True)
		return super().get(request)

	def post(self, request):
		serializer = PlayerSigninSerializer(data=request.data)
		if serializer.is_valid():
			username = serializer.validated_data['username']
			password = serializer.validated_data['password']
			player = authenticate(username=username, password=password)
			if player is not None:
				refresh = RefreshToken.for_user(player)
				response = Response(status=status.HTTP_200_OK)
				response.set_cookie('access_token', str(refresh.access_token), httponly=True)
				response.set_cookie('refresh_token', str(refresh), httponly=True)
				if player.tfa:
					if send_2fa_code(player):
						print('2fa code sent', flush=True)
						response.status_code = 302  # or 301 for a permanent redirect
					else:
						return Response({'error_msg': 'Couldn\'t send OTP to the given Email'}, 
                                    status=status.HTTP_422_UNPROCESSABLE_ENTITY)
				player.last_login = timezone.now() # IF EVERYTHING IS OK, UPDATE LAST LOGIN
				player.save()
				return response
			return Response({'error_msg': 'Invalid username or password!'}, 
                        status=status.HTTP_401_UNAUTHORIZED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def get_context_data(self, request):
		return {'csrf_token': get_token(request)}

class SignOutView(BaseView, View):
	def get(self, request):
		token_string = request.COOKIES.get('access_token')
		if token_string:
			try:
				add_token_to_blacklist(token_string)
			except jwt.ExpiredSignatureError:
				print('Token has expired')
			except jwt.InvalidTokenError as e:
				print(f'Token is invalid: {e}')
			except jwt.DecodeError as e:
				print(f'Token decoding error: {e}')
			response = HttpResponseRedirect(reverse('landing'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			response.delete_cookie('is_auth')
			response.singed_out = True
			return response

# view for the csrf token request
class CsrfRequest(APIView):
	def get(self, request):
		response = Response(status=status.HTTP_200_OK)
		response.set_cookie('csrftoken', get_token(request))
		return response

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

# 42 Oauth2.0 callback
class OauthCallback(View):
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
			return JsonResponse({'error': 'Failed to obtain user information.'}, status=user_info_response.status_code)
		
		user_info = user_info_response.json()
		
		# Find or create user
		player, created = Player.objects.get_or_create(
			username=user_info['login'],
			defaults={
				'email': user_info['email'],
				'first_name': user_info['first_name'],
				'last_name': user_info['last_name'],
			}
		)

		if created:
			# player.set_unusable_password()
			image_url = user_info['image']['link']
			from django.core.files import File
			from urllib.request import urlopen
			from tempfile import NamedTemporaryFile

			img_temp = NamedTemporaryFile(delete=True)
			img_temp.write(urlopen(image_url).read())
			img_temp.flush()
			player.profile_picture.save(f"{player.username}_profile.jpg", File(img_temp))
			# print("new user profile picture: ", user_info['image']['link'], flush=True)
			player.set_password(settings.FT_USER_PASS)
			player.save()

		# Download and save profile picture
		if 'image_url' in user_info:  # Adjust this key based on 42's API response
			from django.core.files import File
			from urllib.request import urlopen
			from tempfile import NamedTemporaryFile

			img_temp = NamedTemporaryFile(delete=True)
			img_temp.write(urlopen(user_info['image_url']).read())
			img_temp.flush()
			player.profile_picture.save(f"{player.username}_profile.jpg", File(img_temp))

		# Update last login
		player.last_login = timezone.now()
		player.save()

		# Generate JWT tokens and Create a response with the JWT tokens
		refresh = RefreshToken.for_user(player)

		# Set the tokens in cookies
		response = HttpResponseRedirect(reverse('home_page'))
		# secure=True
		response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax')
		response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax')
		response.set_cookie('is_auth', 'true')

		return response

	
class PasswordReset(BaseView):
	template_name = 'app/password_reset.html'
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
		email_template_name = "app/password_reset_email_tamplate.txt"
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
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'app/2fa.html'
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
			response.delete_cookie('is_auth')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': f'{signin_url}?{params}'
				}, status=401)
			return response
		return super().handle_exception(exception)


	def get_context_data(self, request):
		return {'email': self.request.user.email}
	
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
	
	def patch(self, request):
		player = request.user
		if player:
			player.tfa = not player.tfa
			player.save()
			return JsonResponse({'tfa_enabled': player.tfa}, status=status.HTTP_200_OK)
		return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Health check view
class HealthCheck(View):
	def get(self, request):
		try:
			with connection.cursor() as cursor:
				cursor.execute("SELECT 1")
			return HttpResponse("OK", status=200, content_type="text/plain")
		except Exception:
			return HttpResponse("ERROR", status=500, content_type="text/plain")

# profile view
class ProfileView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'app/profile.html'
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
			response.delete_cookie('is_auth')
			if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
				return JsonResponse({
					'redirect': f'{signin_url}?{params}'
				}, status=401)
			return response
		return super().handle_exception(exception)

	def get_context_data(self, request):
		player = request.user
		data = {
			'username': player.username,
			'email': player.email,
			'full_name': player.get_full_name(),
			'2fa': player.tfa,
			'profile_pic': player.profile_picture.url if player.profile_picture else None,
			'MEDIA_URL': settings.MEDIA_URL
		}
		profile_pic_url = player.profile_picture.url if player.profile_picture else None
		print(f"Debug: Profile picture URL = {profile_pic_url}", flush=True)
		print(f"Debug: MEDIA_ROOT = {settings.MEDIA_ROOT}", flush=True)
		print(f"Debug: MEDIA_URL = {settings.MEDIA_URL}", flush=True)
		return data

	def patch(self, request):
		data = json.loads(request.body)
		player = request.user
		print("Data: ", data, flush=True)
		if player:
			if data.get('username') not in ['', None]:
				player.username = data.get('username')
			if data.get('email') not in ['', None]:
				player.email = data.get('email')
			print("Player: ", player, flush=True)
			player.save()
			return JsonResponse({'success': 'Profile updated successfully!'}, status=status.HTTP_200_OK)
		return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

	def delete(self, request):
		player = request.user
		print('Delete account view: deleting -> ', player, flush=True)
		player.delete()
		
		response = Response({"message": "Account deleted successfully", "redirect": "/"}, status=status.HTTP_200_OK)
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		response.delete_cookie('is_auth')
		return response
