from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
import redis
from django.conf import settings
import jwt


# strict redis instance - comes with redis client
redis_instance = redis.StrictRedis(host=settings.REDIS_HOST, 
                                   port=settings.REDIS_PORT, 
                                   db=settings.REDIS_DB)
# just checks if token is in blacklist
#EX: `GET mykey`
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

# extracts JTI (JSON Token Identifier) from token and adds it to blacklist using SETEX command - sets key with expiry time (auto deletes)
#EX: `SETEX mykey 3600 "hello"`
def add_token_to_blacklist(token_string):
    try:
        token = jwt.decode(token_string, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
        expires_in = token['exp'] - token['iat']
        jti = token['jti']
        redis_instance.setex(jti, expires_in, 'blacklisted')
    except jwt.ExpiredSignatureError:
        return True
    except jwt.InvalidTokenError as e:
        return True
    except Exception as e:
        return True


# custom JWT authentication class that uses cookies instead of Authorization header
class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            raise AuthenticationFailed('No token found in cookies')
        try:
            if is_token_blacklisted(raw_token):
                raise AuthenticationFailed('This token is blacklisted')
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except InvalidToken as e:
            raise AuthenticationFailed(str(e))
        except AuthenticationFailed as e:
            raise AuthenticationFailed(str(e))
        except Exception as e:
            raise AuthenticationFailed('An unexpected error occurred.')


import logging

class SilenceHealthCheckLogsMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Create a custom filter to exclude health check logs
        class HealthCheckFilter(logging.Filter):
            def filter(self, record):
                return '/health/' not in record.getMessage()

        # Get the loggers you want to filter
        loggers = [
            logging.getLogger('django.request'),
            logging.getLogger('daphne'),
            logging.getLogger('django.server')
        ]

        # Store original filters
        original_filters = [logger.filters.copy() for logger in loggers]

        # Add health check filter to loggers
        for logger in loggers:
            logger.addFilter(HealthCheckFilter())

        try:
            # Call the next ASGI application
            await self.app(scope, receive, send)
        finally:
            # Restore original filters
            for logger, orig_filters in zip(loggers, original_filters):
                logger.filters = orig_filters