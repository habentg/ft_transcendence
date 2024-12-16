from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r'^ws/chat/?$', chatConsumer.as_asgi()),
]