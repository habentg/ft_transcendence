from django.http import JsonResponse
from rest_framework.response import Response
from django.template.loader import render_to_string
from django.views import View
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import status
from app.serializers import UserRegistrationSerializer, UserLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
import json
from django.contrib.auth import authenticate
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.conf import settings
import requests
from .models import BlogUser
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import render, redirect
from django.utils.encoding import force_str

# base view for basic pages in our SPA
class BaseView(View):
	template_name = None
	title = None
	css = None
	js = None
	def get(self, request):
		context = self.get_context_data()
		html_content = render_to_string(self.template_name, context)
		if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return JsonResponse({
				'html': html_content, 
				'title': self.title
			})
		else:
			resources = {
				'title': self.title,
				'css': self.css,
				'js': self.js,
				'html': html_content
			}
			return render(request, 'app/base.html', resources)
	def get_context_data(self):
		return {}

# view for the home page
class HomeView(APIView):
	authentication_classes = [JWTAuthentication]

	def get(self, request):
		user = request.user
		data = {
			'username': user.username,
			'email': user.email,
			'full_name': user.get_full_name(),
		}
		html_content = render_to_string('app/home.html', data)
		return Response({'html': html_content, 'title': 'Homie Page'})

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
		serializer = UserRegistrationSerializer(data=data)
		if serializer.is_valid():
			new_user = serializer.save()
			if new_user:
				# Update last_login
				new_user.last_login = timezone.now()
				new_user.save()
				refresh = RefreshToken.for_user(new_user)
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
		serializer_class = UserLoginSerializer(data=data)
		if serializer_class.is_valid():
			username = serializer_class.validated_data['username']
			password = serializer_class.validated_data['password']
			user = authenticate(username=username, password=password)
			if user is not None:
				# Update last_login
				user.last_login = timezone.now()
				user.save()

				refresh = RefreshToken.for_user(user)
				data = {
					'refresh_token': str(refresh),
					'access_token': str(refresh.access_token),
					'redirect': 'home'
				}
				return JsonResponse(data, status=status.HTTP_200_OK)
			return JsonResponse({'error_msg': 'Invalid username or password!'}, status=status.HTTP_401_UNAUTHORIZED)
		return JsonResponse(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)


# view for the csrf token request
class CsrfRequest(View):
	def get(self, request):
		return JsonResponse({'csrf_token': get_token(request)}, status=status.HTTP_200_OK)

# 42 Oauth2.0
class InfoForOauth(View):
	def get(self, request):
		response = {
			'client_id': settings.FOURTYTWO_OAUTH_CLIENT_ID,
			'redirect_uri': settings.DOMAIN_NAME + '/oauth/',
		}
		return JsonResponse(response, status=status.HTTP_200_OK)

# 42 Oauth2.0 callback
class OauthCallback(View):
	def get(self, request):
		code = request.GET.get('code')
		
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
		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
			'Authorization': f'Bearer {access_token}'
		})

		if user_info_response.status_code != 200:
			return JsonResponse({'error': 'Failed to obtain user information.'}, status=user_info_response.status_code)
		
		user_info = user_info_response.json()
		
		# Find or create user
		user, created = BlogUser.objects.get_or_create(
			username=user_info['login'],
			defaults={
				'email': user_info['email'],
				'first_name': user_info['first_name'],
				'last_name': user_info['last_name'],
			}
		)

		if created:
			print('User created', flush=True)
			user.set_password('42password')  # Consider using a more secure method
			user.save()
		else:
			print('User found', flush=True)

		# Update last login
		user.last_login = timezone.now()
		user.save()

		# Generate JWT tokens
		# Generate JWT tokens
		refresh = RefreshToken.for_user(user)
		access_token = refresh.access_token

		# Create a response with the JWT tokens
		response_data = {
			'access_token': str(access_token),
			'refresh_token': str(refresh),
			'redirect': 'home'
		}

		# Redirect to a specific URL with the JSON data as URL parameters
		return redirect(f'/oauth/callback?access_token={response_data["access_token"]}&refresh_token={response_data["refresh_token"]}&redirect={response_data["redirect"]}')

	
class PasswordReset(BaseView):
	template_name = 'app/password_reset.html'
	title = 'Password Reset'
	css = 'css/password_reset.css'
	js = 'js/password_reset.js'

	def post(self, request):
		print('Password reset request', flush=True)
		data = json.loads(request.body)
		User = get_user_model()
		user = User.objects.filter(email=data['email']).first()
		if user:
			self.email_pass_reset_link(user)
			return JsonResponse({
				'success': 'User found!',
				'uidb64': urlsafe_base64_encode(force_bytes(user.pk)),
				'token': default_token_generator.make_token(user)
			}, status=status.HTTP_200_OK)
		print('User NOT found', flush=True)
		return JsonResponse({'error_msg': 'Couldnt find your email!'}, status=status.HTTP_404_NOT_FOUND)

	def email_pass_reset_link(self, user):
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [user.email]
		subject = "Password Reset Requested"
		email_template_name = "app/password_reset_email_tamplate.txt"
		c = {
			'email': user.email,
			'domain': 'localhost:8000',
			'site_name': 'Your Site',
			'uid': urlsafe_base64_encode(force_bytes(user.pk)),
			'user': user,
			'token': default_token_generator.make_token(user),
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
		User = get_user_model()
		try:
			uid = force_str(urlsafe_base64_decode(uidb64))
			user = User.objects.get(pk=uid)
		except (TypeError, ValueError, OverflowError, User.DoesNotExist):
			user = None

		if user is not None and default_token_generator.check_token(user, token):
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
			# Invalid token, render an error page or redirect
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
