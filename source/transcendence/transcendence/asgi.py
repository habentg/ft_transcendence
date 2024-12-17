"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

import django
django.setup()  # Initialize Django

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import friendship.routing
import chat.routing
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    'http': get_asgi_application(),  # Serve static files for HTTP
    'websocket': AuthMiddlewareStack(
        URLRouter(
            friendship.routing.websocket_urlpatterns +
            chat.routing.websocket_urlpatterns
        )
    ),
})