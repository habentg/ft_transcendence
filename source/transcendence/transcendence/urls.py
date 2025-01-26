from django.contrib import admin
from django.urls import path, include
from others.views import Catch_All
from django.urls import include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin', admin.site.urls),
    path('', include('others.urls')),
    path('', include('account.urls')),
    path('', include('friendship.urls')),
    path('', include('chat.urls')),
    path('', include('game.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    path('<path:path>', Catch_All.as_view(), name="404_page"),  # This will catch any undefined route
]