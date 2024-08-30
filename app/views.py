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
# class OauthCallback(View):
# 	def get(self, request):
# 		# getting the authorization code from 42 auth server
# 		code = request.GET.get('code')
# 		#Doc: https://api.intra.42.fr/apidoc/guides/web_application_flow
# 		# getting the access token from 42 auth server using the authorization code
# 		token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
# 			'grant_type': 'authorization_code',
# 			'code': code,
# 			'redirect_uri': settings.DOMAIN_NAME + '/oauth/',
# 			'client_id': settings.FOURTYTWO_OAUTH_CLIENT_ID,
# 			'client_secret': settings.FOURTYTWO_OAUTH_CLIENT_SECRET,
# 		})

# 		if token_response.status_code != 200:
# 			return JsonResponse({'error': 'failed to optain access token'}, status=token_response.status_code)
# 		access_token = token_response.json()['access_token']
# 		# Use the access token to access the user's data
# 		user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
# 			'Authorization': f'Bearer {access_token}'
# 		})

# 		if user_info_response.status_code != 200:
# 			return JsonResponse({'error': 'Failed to obtain user information.'}, status=user_info_response.status_code)
# 		user_info = user_info_response.json()
# 		# find or create user
# 		user = BlogUser.objects.filter(username=user_info['login']).first()
# 		if not user:
# 			data = {
# 				'username': user_info['login'],
# 				'email': user_info['email'],
# 				'first_name': user_info['first_name'],
# 				'last_name': user_info['last_name'],
# 				'password': '42password',
# 			}
# 			serializer = UserRegistrationSerializer(data=data)
# 			if serializer.is_valid():
# 				new_user = serializer.save()
# 				if new_user:
# 					# Update last_login
# 					new_user.last_login = timezone.now()
# 					new_user.save()
# 					refresh = RefreshToken.for_user(new_user)
# 					data = {
# 						'refresh_token': str(refresh),
# 						'access_token': str(refresh.access_token),
# 						'redirect': 'home'
# 					}
# 					# render the home page
# 					render(request, 'app/home.html', data)
# 					# return JsonResponse(data, status=status.HTTP_201_CREATED)
# 		else:
# 			print('User exists', flush=True)
# 		return JsonResponse({'message': 'Callback'}, status=status.HTTP_200_OK)
	
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

		# Update last login
		user.last_login = timezone.now()
		user.save()

		# Generate JWT tokens
		refresh = RefreshToken.for_user(user)
		data = {
			'refresh_token': str(refresh),
			'access_token': str(refresh.access_token),
			'redirect': 'home'
		}

		# Return tokens as JSON response
		return JsonResponse(data, status=status.HTTP_200_OK)
	

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
			return JsonResponse({'message': 'Password reset successful!', 'redirect': 'home'}, status=status.HTTP_200_OK)
		print('User NOT found', flush=True)
		return JsonResponse({'error': 'User not found!', 'redirect': 'not_home'}, status=status.HTTP_404_NOT_FOUND)

	def email_pass_reset_link(self, user):
		from_email = settings.DEFAULT_FROM_EMAIL
		recipient_list = [user.email]
		subject = "Password Reset Requested"
		email_template_name = "app/password_reset_email_tamplate.txt"
		c = {
			'email': user.email,
			'domain': 'localhost',
			'site_name': 'Your Site',
			'uid': urlsafe_base64_encode(force_bytes(user.pk)),
			'user': user,
			'token': default_token_generator.make_token(user),
			'protocol': 'http',
		}
		email_body = render_to_string(email_template_name, c)
		send_mail(subject, email_body, from_email, recipient_list, fail_silently=False)


""" Sending password reset link by email """

# def password_reset_newpass(request, uidb64=None, token=None):
#     Player = get_user_model()
#     try:
#         uid = force_str(urlsafe_base64_decode(uidb64))
#         player = Player.objects.get(pk=uid)
#     except (TypeError, ValueError, OverflowError, Player.DoesNotExist):
#         player = None

#     if player is not None and default_token_generator.check_token(player, token):
#         if request.method == 'POST':
#             if player.password_reset_token!= token:
#                 messages.error(request, 'The reset password link is no longer valid.')
#                 return redirect('/password_reset/')
#             new_password = request.POST.get('new_password')
#             confirm_password = request.POST.get('confirm_password')
#             if new_password != confirm_password:
#                 messages.error(request, 'Passwords do not match.')
#                 return render(request, 'auth_AM/password_reset_newpass.html', context={})
#             player.set_password(new_password)
#             player.save()
#             messages.success(request, 'Your password has been set. You can now log in.')
#             return redirect('/signin/')
#         else:
#             return render(request, 'auth_AM/password_reset_newpass.html', context={})
#     else:
#         messages.error(request, 'The reset password link is no longer valid.')
#         return redirect('password_reset')

# # def password_reset_complete(request):

# def emailing_password_reset_link(request, reseting_player, to_email):
#     from_email = settings.DEFAULT_FROM_EMAIL
#     recipient_list = [to_email]
#     subject = "Password Reset Requested"
#     email_template_name = "app/password_reset_email_tamplate.txt"
#     c = {
#         'email': reseting_player.email,
#         'domain': 'localhost',
#         'site_name': 'Your Site',
#         'uid': urlsafe_base64_encode(force_bytes(reseting_player.pk)),
#         'user': reseting_player,
#         'token': default_token_generator.make_token(reseting_player),
#         'protocol': 'http',
#     }
#     # to prevent players reseting thier password using older token
#     reseting_player.password_reset_token = c['token']
#     reseting_player.save()
#     email_body = render_to_string(email_template_name, c)
#     send_mail(subject, email_body, from_email, recipient_list, fail_silently=False)

# def password_reset(request):
#     if request.method == 'GET':
#         return render(request, 'auth_AM/password_reset.html', context={})
#     elif request.method == 'POST':
#         to_email = request.POST.get('email')
#         Player = get_user_model()
#         reseting_player = Player.objects.filter(email=to_email).first()
#         if reseting_player is None:
#             messages.error(request, "Email not found in our db!")
#             return redirect('/password_reset/')
#         emailing_password_reset_link(request, reseting_player, to_email)
#         return render(request, 'auth_AM/password_reset_complete.html', context={})
