from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
import redis
from django.conf import settings
import jwt
from django.conf import settings

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
        return redis_instance.exists(jti)
    except jwt.ExpiredSignatureError: # Token has expired, return True to indicate it's blacklisted
        print("Token has expired", flush=True)
        return True
    except jwt.InvalidTokenError: # Token is invalid, return True to indicate it's blacklisted
        print("Token is invalid", flush=True)
        return True

# extracts JTI (JSON Token Identifier) from token and adds it to blacklist using SETEX command - sets key with expiry time (auto deletes)
#EX: `SETEX mykey 3600 "hello"`
def add_token_to_blacklist(token_string):
    try:
        token = jwt.decode(token_string, algorithms=["HS256"], key=settings.SECRET_KEY, options={"verify_exp": True})
        expires_in = token['exp'] - token['iat']
        jti = token['jti']
        redis_instance.setex(jti, expires_in, 'blacklisted')
    except jwt.ExpiredSignatureError:
        print('Token has expired', flush=True)
    except jwt.InvalidTokenError:
        print('Token is invalid', flush=True)
    print('Token added to blacklist', flush=True)


# custom JWT authentication class that uses cookies instead of Authorization header
class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return None
        try:
            if is_token_blacklisted(raw_token):
                print('trying to access with a blacklisted Token.... ', flush=True)
                raise AuthenticationFailed('Token is blacklisted')
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except InvalidToken:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(str(e))
        
