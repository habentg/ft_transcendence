from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, generics
from app.models import BlogPost, BlogUser
from app.serializers import UserRegistrationSerializer, UserLoginSerializer, BlogPostSerializer
from django.contrib.auth import get_user_model
from app.authentication import generate_access_token, JWTAuthentication
import jwt

# Create your views here.
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_GET

class SPAView(TemplateView):
	template_name = 'app/index.html'

class HomeView(View):
    @method_decorator(require_GET)
    def get(self, request):
        if request.user.is_authenticated:
            # User is authenticated, serve home page
            context = {
                'user': request.user.username,
                'email': request.user.email,
                'is_auth': True,
            }
            template_name = 'app/home.html'
        else:
            # User is not authenticated, serve landing page
            context = {
                'is_auth': False,
            }
            template_name = 'app/landing.html'

        # Render the appropriate HTML content to a string
        html_content = render_to_string(template_name, context)
        
        # Return the HTML content as JSON
        return JsonResponse({'html': html_content})


class BlogPostListCreate(generics.ListCreateAPIView):
	queryset = BlogPost.objects.all()
	serializer_class = BlogPostSerializer

class UserRegistrationAPIView(APIView):
	serializer_class = UserRegistrationSerializer
	authentication_classes = (TokenAuthentication,)
	permission_classes = (AllowAny,)

	def get(self, request):
		html_content = render_to_string('app/signup.html', {})
        # Return the HTML content as JSON
		return JsonResponse({'html': html_content})

	def post(self, request):
		print("we are here in post registration")
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid(raise_exception=True):
			new_user = serializer.save() # save the user to the database
			if new_user:
				access_token = generate_access_token(new_user)
				data = { 'access_token': access_token }
				response = Response(data, status=status.HTTP_201_CREATED)
				response.set_cookie(key='access_token', value=access_token, httponly=True)
				login(request, new_user)
				return response
		print("we should not be here")
		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
