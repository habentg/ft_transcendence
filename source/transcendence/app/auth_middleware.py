from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings

# class JWTAuthMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         access_token = request.COOKIES.get('access_token')
        
#         if access_token:
#             try:
#                 token = AccessToken(access_token)
#                 username = token.payload.get('username')
                
#                 Player = get_user_model()
#                 request.user = Player.objects.get(username=username)
#             except (TokenError, InvalidToken):
#                 response = JsonResponse({"error": "Invalid token"}, status=401)
#                 response.delete_cookie('access_token')
#                 return response

#         response = self.get_response(request)
#         return response
    

class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except InvalidToken:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(str(e))
        
