from django.contrib import admin

# Register your models here.
from .models import BlogPost, BlogUser

admin.site.register(BlogPost)
admin.site.register(BlogUser)