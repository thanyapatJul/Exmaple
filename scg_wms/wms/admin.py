from django.contrib import admin
from .models import *

from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin

from wms.models import CustomUser


class UserModel(UserAdmin):
    pass

admin.site.register(CustomUser,UserModel)