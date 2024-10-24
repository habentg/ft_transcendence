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
			return render(request, 'others/base.html', resources)

	def get_context_data(self, request):
		return {}

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

# view for the 404 page1
class Catch_All(BaseView):
	template_name = 'others/404.html'
	title = 'Error Page'
	css = 'css/404.css'
	js = 'js/404.js'

	def get(self, request):
		print('404 page: ', request)
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