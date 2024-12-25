from django.utils.deprecation import MiddlewareMixin
from django.contrib.sessions.models import Session
from django.utils import timezone
import logging
import traceback
import atexit
logger = logging.getLogger('django')

class ActiveUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.user.is_authenticated:
            now = timezone.now()
            # Session.objects.filter(expire_date__lt=now).delete()  # Clean up expired sessions
            request.user.last_login = now
            request.user.save()

def shutdown_logging():
    logging.shutdown()

atexit.register(shutdown_logging)

class LogRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get user information
        user = request.user if request.user.is_authenticated else None
        username = user.username if user else 'Anonymous'
        user_info = f'User: {username}'

        # Log the request method, path, and user information
        logger.info(f"{user_info}, Request method: {request.method}, Request path: {request.path}")

        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        # Get user information
        user = request.user if request.user.is_authenticated else None
        username = user.username if user else 'Anonymous'
        user_info = f'User: {username}'

        # Log the exception back trace with user information
        logger.error(f"{user_info}, Exception occurred: {traceback.format_exc()}")