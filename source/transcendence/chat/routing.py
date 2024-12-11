from django.urls import path, re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'^ws/notify/(?P<room_name>[^/]+)/$', ChatConsumer.as_asgi()),
]