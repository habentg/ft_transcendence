from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from account.serializers import *
from django.views import View
from rest_framework.views import APIView
from django.template.loader import render_to_string
from django.shortcuts import render
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated
from account.auth_middleware import JWTCookieAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.db import connection
from rest_framework.response import Response
from django.middleware.csrf import get_token
from rest_framework import status
import urllib.parse


# base view for basic pages in our SPA
"""
	-> Basic Get view for all pages
	-> If the request is an AJAX request (click route), return the html content as JSON
	-> If the request is not an AJAX request (direct url visit), return the html content as a rendered page
"""
class BaseView(View):
	authentication_classes = []
	permission_classes = []
	template_name = None
	title = None
	css = None
	js = None
	
	def get(self, request, *args, **kwargs):
		context = self.get_context_data(request, **kwargs)
		if 'error_msg' in context:
			self.template_name = 'others/404.html'
			self.title = 'Error Page'
			self.css = 'css/404.css'
			self.js = 'js/404.js'
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
			return render(request, 'others/base.html', resources)

	def get_context_data(self, request, **kwargs):
		return {}

# view for the 404 page1
class Catch_All(BaseView):
	template_name = 'others/404.html'
	title = 'Error Page'
	css = 'css/404.css'
	js = 'js/404.js'

	def get(self, request, path=None, *args, **kwargs):
		print('404 page: ', request)
		return super().get(request)

# view for the home page
class HomeView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'others/home.html'
	title = 'Home Page'
	css = 'css/home.css'
	js = 'js/home.js'
	
	def handle_exception(self, exception):
		if isinstance(exception, AuthenticationFailed):
			response = HttpResponseRedirect(reverse('landing'))
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			response.delete_cookie('csrftoken')
			response.status_code = 302
			return response
		return super().handle_exception(exception)

	def get_context_data(self, request) :
		user = request.user
		data = {
			'username': user.username,
			'email': user.email,
			'full_name': user.get_full_name(),
			'profile_pic': user.profile_picture.url if user.profile_picture else None,
		}
		return data
	
# view for the index page
class LandingPageView(BaseView):
	template_name = 'others/landing.html'
	css = 'css/landing.css'
	# js = 'js/landing.js'
	title = 'Index Page'

	def get(self, request):
		if request.COOKIES.get('access_token') and request.COOKIES.get('refresh_token'):
			return HttpResponseRedirect(reverse('home_page'))
		return super().get(request)


# Health check view
class HealthCheck(View):
	def get(self, request):
		try:
			with connection.cursor() as cursor:
				cursor.execute("SELECT 1")
			return HttpResponse("OK", status=200, content_type="text/plain")
		except Exception:
			return HttpResponse("ERROR", status=500, content_type="text/plain")

# view for the csrf token request
class CsrfRequest(APIView):
	def get(self, request):
		response = Response(status=status.HTTP_200_OK)
		response.set_cookie('csrftoken', get_token(request))
		return response


""" Searching users """
class SearchUsers(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template = 'others/search_result.html'
	css = 'css/search.css'
	js = 'js/friend.js'

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

	def get(self, request, *args, **kwargs):
		if (request.headers.get('X-Requested-With') != 'XMLHttpRequest'):
			return HttpResponseRedirect(reverse('home_page'))
		# http://localhost/search?q=asdfsdaf
		data = request.data
		search_param = request.GET.get('q', '')
		if not search_param:
			return JsonResponse({
				'html': render_to_string(self.template, {'players': []}),
				'css' : self.css,
				'js' : self.js
			})
		players = []
		"""
			friend requests are structured like this: <QuerySet [<FriendRequest: root → hatesfam : (PENDING)>]>
			-> that's why we need to extract the sender from the request (we need friend requests sent to the user)
		"""
		if search_param == 'friends':
			players = request.user.friend_list.friends.all()
			print("Friends : ", players, flush=True)
			print('querying all Friends', flush=True)
		elif search_param == 'friend_requests':
			friend_requests = request.user.received_requests.all()
			players = [fr.sender for fr in friend_requests]  # Extracting the users who sent requests
		else: # if not it should be a username
			players = Player.objects.filter(username__icontains=search_param)
			print("ALL Players : ", players, flush=True)
			print('querying all players - containing {}'.format(search_param), flush=True)

		context = {
			'players': players, 
			'current_user': request.user,
			'search_type': search_param
		}
		# becareful with direct broswer url visit
		return JsonResponse({
			'html': render_to_string(self.template, context),
			'css' : self.css,
			'js' : self.js
		})