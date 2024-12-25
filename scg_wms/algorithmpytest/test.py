import pandas as pd
from scg_wms.wms.models import *
from django.db.models import Max, Q, F, Sum, FloatField,When,Value ,Avg ,Count, OuterRef, Subquery, Max, ExpressionWrapper

def calculate_history_mc_perf(materialcode,materialname,machine):
    machine_data = (
        ViewPisMergereportProduction.objects
        .values(materialcode,materialname,machine)  
        .annotate(
            total_qty=Sum('goodcount'),  
            avg_qty=Avg('goodcount'),   
            total_loss=Sum('rejectcount'),  
            avg_loss=Avg('rejectcount'),   
            total_run=Count('materialcode'),  
            total_run_time=Sum('runningduration'),  
            avg_run=Avg('runningduration'),  
            total_breakdown=Sum('downtimeduration'),  
            avg_breakdown=Avg('downtimeduration'),    
            reject_percentage=ExpressionWrapper(
                F('total_loss') / (F('total_qty') + F('total_loss')) * 100,
                output_field=FloatField()
            ),  
            rate=ExpressionWrapper(
                F('total_qty') / F('total_run_time'),
                output_field=FloatField()
            )  
        )
        .order_by('materialname', 'machine')  
    )
    return machine_data

