from django.urls import path, re_path
from chat.views import *

urlpatterns = [
    re_path(r'^chat/?$', ChatRoomsView.as_view(), name='chat_page'),
    re_path(r'^chat_messages/?$', chatMessagesView.as_view(), name='chat_message'),
    re_path(r'^is_blocked?$', IsBlocked.as_view(), name='is_blocked'),
]