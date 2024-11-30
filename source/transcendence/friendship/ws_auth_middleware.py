from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
import redis
import jwt
from django.conf import settings
from account.auth_middleware import JWTCookieAuthentication

# strict redis instance - comes with redis client
redis_instance = redis.StrictRedis(host=settings.REDIS_HOST, 
                                   port=settings.REDIS_PORT, 
                                   db=settings.REDIS_DB)

# Token blacklisting check
def is_token_blacklisted(token_string):
    try:
        token = jwt.decode(token_string, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
        jti = token['jti']
        return redis_instance.exists(jti) > 0  # Check if the key exists in Redis
    except jwt.ExpiredSignatureError:
        print("Token has expired", flush=True)
        return True  # Treat expired tokens as blacklisted
    except jwt.InvalidTokenError as e:
        print("Invalid token: ", e, flush=True)
        return True  # Treat invalid tokens as blacklisted
    except Exception as e:
        print("Error decoding token: ", e, flush=True)
        return True  # Treat unexpected errors as blacklisted


# Middleware for JWT token authentication in WebSocket connection
class JWTCookieAuthenticationMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using JWT token in cookies.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Get the token from cookies (or query string)
        query_string = parse_qs(scope.get("query_string", b"").decode())
        token = query_string.get('token', [None])[0]  # Token from query string
        print(f" ----------- -------- Token from query string: {token}", flush=True)
        if not token:
            token = scope.get('cookies', {}).get('access_token', None)  # Fallback to cookies

        if not token:
            raise ValueError("No token found in the connection request")

        # Authenticate the token
        user = await self.authenticate_token(token)

        # Attach user to scope
        scope['user'] = user

        # Call the next layer in the stack (consumer)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def authenticate_token(self, token):
        """
        Authenticate the JWT token and return the user.
        """
        if is_token_blacklisted(token):
            raise ValueError("Token is blacklisted")
        jwt_auth = JWTCookieAuthentication()
        print(f" ----------- -------- Authenticating token: {token}", flush=True)
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
        except Exception as e:
            raise ValueError("Unexpected error occurred during token validation")


# Apply this middleware in ASGI
