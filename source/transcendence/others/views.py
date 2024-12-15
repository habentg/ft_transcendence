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
from account.utils import *


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
		html_content = render_to_string(self.template_name, context)
		resources = {
			'title': self.title,
			'css': self.css,
			'js': self.js,
			'html': html_content,
			'is_authenticated': isUserisAuthenticated(request)
		}
		if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
			return JsonResponse(resources)
		else:
			return render(request, 'others/base.html', resources)

	def get_context_data(self, request, **kwargs):
		return {}

# view for the 404 page1
class Catch_All(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/404.html'
	title = 'Error Page'
	css = ['css/404.css']
	js = ['js/404.js']

	def get(self, request, path=None, *args, **kwargs):
		return super().get(request)

# view for the home page
class HomeView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'others/home.html'
	title = 'Home Page'
	css = ['css/home.css']
	js = ['js/home.js']
	
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
		data = {
			'player': PlayerSerializer(request.user).data
		}
		return data
	
# view for the index page
class LandingPageView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/landing.html'
	css = ['css/landing.css']
	title = 'Index Page'

	def get(self, request):
		if request.COOKIES.get('access_token') and request.COOKIES.get('refresh_token'):
			return HttpResponseRedirect(reverse('home_page'))
		return super().get(request)


# Health check view
class HealthCheck(View):
	authentication_classes = []
	permission_classes = []
	def get(self, request):
		try:
			with connection.cursor() as cursor:
				cursor.execute("SELECT 1")
			return HttpResponse("OK", status=200, content_type="text/plain")
		except Exception:
			return HttpResponse("ERROR", status=500, content_type="text/plain")

# view for the csrf token request
class CsrfRequest(APIView):
	authentication_classes = []
	permission_classes = []
	def get(self, request):
		response = Response(status=status.HTTP_200_OK)
		response.set_cookie('csrftoken', get_token(request))
		return response

class AboutView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/about.html'
	title = 'About Us'
	css = ['css/static_pages.css']

class PrivacyView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/privacy.html'
	title = 'Privacy Policy'
	css = ['css/static_pages.css']

class TermsView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/terms.html'
	title = 'Terms of Service'
	css = ['css/static_pages.css']


from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination
""" custom paginator class - for paginating search results """
class SearchPaginator(PageNumberPagination):
	page_size = 5
	page_size_query_param = 'page_size'
	max_page_size = 1000

class PaginatedSearch(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'others/paginated_page.html'
	css = ['css/search.css']
	js = ['js/friend.js']

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
		if (request.user.is_guest):
			return Response(status=status.HTTP_205_RESET_CONTENT)
		# http://localhost/search?q=asdfsdaf
		search_param = request.GET.get('q', '')
		if not search_param:
			return JsonResponse({
				'html': render_to_string(self.template_name, {'players': []}),
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
		elif search_param == 'friend_requests':
			friend_requests = request.user.received_requests.all()
			players = [fr.sender for fr in friend_requests]  # Extracting the users who sent requests
		else: # if not it should be a username
			players = Player.objects.filter(username__icontains=search_param).exclude(is_guest=True)

		paginator = SearchPaginator()
		paginated_players = paginator.paginate_queryset(players, request)
		serialized_players = PlayerSerializer(paginated_players, many=True).data
		# return paginator.get_paginated_response(serialized_players)
		context = {
			'players': paginator.get_paginated_response(serialized_players).data['results'],
			'search_type': search_param,
			'total_items': paginator.page.paginator.count,
		}
		#! becareful with direct broswer url visit
		return JsonResponse({
			'html': render_to_string(self.template_name, context),
			'css': self.css,
			'js': self.js,
			'current_page': paginator.page.number,
			'total_pages': paginator.page.paginator.num_pages,
			'total_items': paginator.page.paginator.count,
			'next_page_link': paginator.get_next_link(),
			'previous_page_link': paginator.get_previous_link(),
		})
""" game view """
class GameView(APIView, BaseView):
	authentication_classes = [JWTCookieAuthentication]
	permission_classes = [IsAuthenticated]
	template_name = 'others/game.html'
	title = 'Game Page'
	css = ['css/game.css']
	js = ['js/game.js']

	# def get(self, request):
	# 	return super().get(request)
	def get_context_data(self, request, **kwargs):
		is_ai = request.GET.get('isAI', 'false').lower() == 'true'
		print(f"####### isAI : {is_ai}", flush=True)
		return {
			'isAI': is_ai,
			'current_username': request.user.username
		}
	
class TournamentView(BaseView):
	authentication_classes = []
	permission_classes = []
	template_name = 'others/tournament.html'
	title = 'Tournament Page'
	css = ['css/tournament.css']
	js = ['js/tournament.js']

	def get(self, request):
		return super().get(request)






# class GameAIView(BaseView):
# 	authentication_classes = []
# 	permission_classes = []
# 	template_name = 'others/game.html'
# 	title = 'Game AI Page'
# 	css = ['css/game.css']
# 	js = ['js/gameai.js']

# 	def get(self, request):
# 		return super().get(request)