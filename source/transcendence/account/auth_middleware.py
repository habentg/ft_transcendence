from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
import redis
from django.conf import settings
import jwt


# strict redis instance - comes with redis client
redis_instance = redis.StrictRedis(host=settings.REDIS_HOST, 
                                   port=settings.REDIS_PORT, 
                                   db=settings.REDIS_DB_JWT_INVAL)
# just checks if token is in blacklist
#EX: `GET mykey`
def is_valid_token(token_string):
    try:
        token = jwt.decode(token_string, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
        jti = token['jti']
        return not redis_instance.exists(jti)  # Check if the key exists in Redis
    except jwt.ExpiredSignatureError:
        print("Token has expired", flush=True)
        return False  # Treat expired tokens as blacklisted
    except jwt.InvalidTokenError as e:
        print("Invalid token: ", e, flush=True)
        return False  # Treat invalid tokens as blacklisted
    except Exception as e:
        print("Error decoding token: ", e, flush=True)
        return False  # Treat unexpected errors as blacklisted

# extracts JTI (JSON Token Identifier) from token and adds it to blacklist using SETEX command - sets key with expiry time (auto deletes)
#EX: `SETEX mykey 3600 "hello"`
def add_token_to_blacklist(token_string):
    try:
        token = jwt.decode(token_string, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
        expires_in = token['exp'] - token['iat']
        jti = token['jti']
        redis_instance.setex(jti, expires_in, 'blacklisted')
    except Exception as e:
        raise Exception('Error adding token to blacklist: ' + str(e))


# custom JWT authentication class that uses cookies instead of Authorization header
class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            raise AuthenticationFailed('No token found in cookies')
        try:
            if not is_valid_token(raw_token):
                raise AuthenticationFailed('This token is blacklisted')
            validated_token = self.get_validated_token(raw_token)
            authenticated_player = self.get_user(validated_token)
            return (authenticated_player, validated_token)
        except InvalidToken as e:
            raise AuthenticationFailed(str(e))
        except Exception as e:
            raise AuthenticationFailed(str(e))
