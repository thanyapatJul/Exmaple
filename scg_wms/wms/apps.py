from django.apps import AppConfig
import os

class WmsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'wms'

    def ready(self):
        if os.environ.get('RUN_MAIN', None) != 'true':
            from wms.schedule import start_scheduler
            start_scheduler()
