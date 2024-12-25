

from pathlib import Path
import os
from logging.handlers import TimedRotatingFileHandler

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

SESSION_COOKIE_AGE = 259200
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-1-$ee4=p!3fewd$nlc%y_&&*s3=akhx$-#d*yvb%iv)5f=w5i2'

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
DEBUG = False


ALLOWED_HOSTS = ['*']

# CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://futureforce-tl.cementhai.com:2020",
    "http://127.0.0.1:2020",  
    "http://10.28.254.35:2020",
    "http://localhost:2020",
    'http://127.0.0.1:3000'
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://futureforce-tl.cementhai.com:2020",
    "http://127.0.0.1:2020",  
    "http://10.28.254.35:2020",
    "http://localhost:2020",
    'http://127.0.0.1:3000'

]
APPEND_SLASH = False
REMOVE_SLASH = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    'corsheaders',
    'wms'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'wms.middleware.ActiveUserMiddleware',
    'wms.middleware.LogRequestMiddleware',
]

ROOT_URLCONF = 'scg_wms.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {

            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'scg_wms.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#         # 'OPTIONS': {
#         #          "timeout": 20,
#         # },
#     }
# }

# DATABASES = {
#     'default': {
#         'ENGINE': 'mssql',
#         'NAME': 'WMS',
#         'USER': 'sa',
#         'PASSWORD': 'Scg123456',
#         'HOST': 'msi',
#         # 'HOST': 'DESKTOP-N604JL3\SQLEXPRESS',
#         # 'HOST': 'nshpam',
#         'PORT': '',

#         'OPTIONS': {
#             "driver": "ODBC Driver 17 for SQL Server", 
#         }
#     }
# }

## User model
AUTH_USER_MODEL = 'wms.CustomUser'

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
}
# DATABASES = {
#     'default': {
#         'ENGINE': 'mssql',
#         'NAME': 'SCM',
#         'USER': 'sa',
#         'PASSWORD': 'P@ssw0rd',
#         'HOST': 'localhost\SQLEXPRESS2022',
#         'PORT': '',

#         'OPTIONS': {
#             "driver": "ODBC Driver 17 for SQL Server", 
#         }
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'SCM',
        'USER': 'sa',
        'PASSWORD': 'Scg123456',
        'HOST': 'localhost',
        'PORT': '1433',

        'OPTIONS': {
            "driver": "ODBC Driver 17 for SQL Server",
        }
    }
}




# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Bangkok'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'level': 'WARNING',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',  # This will handle log rotation
            'filename': os.path.join(BASE_DIR, 'django_requests.log'),
            'when': 'D',
            'delay':True,
            'backupCount': 30,  # Keep logs for 7 days
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },

}