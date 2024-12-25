from django.shortcuts import render, redirect,get_list_or_404
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.db.models import Max, Q
from rest_framework.authentication import SessionAuthentication
from rest_framework import routers, serializers, viewsets
from rest_framework import status, permissions
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from django.db.models import OuterRef, Subquery
from collections import defaultdict
from .models import MapListFillPallet
from .serializers import MapListFillPlanSerializer
from rest_framework.views import APIView
from django.db.models import Max
from rest_framework.response import Response
from rest_framework import permissions, status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_bulk import BulkModelViewSet
from .models import *
from .serializers import *
from .permissions import *
from django.http import Http404
from django.forms.models import model_to_dict
# from .validations import *
from datetime import datetime,date
from django.http import QueryDict
from django.db.models import Max, Q, F, Sum, FloatField,When,Value
from django.utils import timezone
from datetime import timedelta
import csv
from django.db.models import OuterRef, Subquery, Max, ExpressionWrapper
from django.db.models.functions import Cast , Ceil , TruncDate, TruncMonth, TruncHour
import math
from collections import OrderedDict

def divide_with_remainder(A, B):
    quotient = A // B
    remainder = A % B
    result = f"{quotient}({remainder})"
    return result

class storage_info_ApiView(viewsets.ModelViewSet):
    # latest_create_at = Storage_info.objects.filter(mapid=OuterRef('mapid')).order_by('-created_at').values('created_at')[:1]
    queryset = Storage_info.objects.order_by('-created_at')

    # queryset = (Storage_info.objects
    #         .annotate(latest_date=Subquery(latest_create_at))
    #         .filter(create_at=F('latest_date'))
    #         .order_by('mapid'))

    serializer_class = map_management_serializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
class storage_info_bulk(BulkModelViewSet):
    # latest_create_at = Storage_info.objects.filter(mapid=OuterRef('mapid')).order_by('-created_at').values('created_at')[:1]
    queryset = Storage_info.objects.all()

    # queryset = (Storage_info.objects
    #         .annotate(latest_date=Subquery(latest_create_at))
    #         .filter(create_at=F('latest_date'))
    #         .order_by('mapid'))

    serializer_class = map_management_serializer

router = routers.DefaultRouter()
router.register(r'storage_info',storage_info_ApiView)
router.register(r'products', ProductViewSet)

router.register(r'storage_info_bulk', storage_info_bulk, basename='storage_info_bulk2')


#### avg ton / pallet #########

size_to_ton_mapping = {
    1.2: 0.918,
    2.4: 2.491,
    3.0: 2.498,
    4.0: 3.670
}


class get_mapmanagement(APIView):
    permission_classes = [permissions.AllowAny,]

    def get_unique_lookup(self, data):
        lookup = {}
        unique_data = {}
        
        for item in data:
            key = f"{item['mapid']}-{item['level']}-{item['sub_column']}"

            # Check if the key doesn't exist in the unique_data dictionary
            if key not in unique_data:
                # Set the key in the unique_data dictionary and add the item to the lookup
                unique_data[key] = True
                lookup[key] = item
        
        return lookup

    def get(self, request, *args, **kwargs):
        try:
            queryset = Map_management.objects.values().order_by('-created_at')
            
            # Convert the queryset to a list of dictionaries
            queryset_list = list(queryset)

            # Create the unique lookup
            unique_lookup = self.get_unique_lookup(queryset_list)

            return Response(unique_lookup.values())
        except Exception as e:
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        
class PostMapManagementInfo(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()            
    def post(self, request, *args, **kwargs):
        data = request.data  # Assumes that data is a nested dictionary

        for machine, machine_data in data.items():  # Loop for "CT2"
            for zca_on, records in machine_data.items():  # Loop for "ZCAWC010100K14"
                for record in records:  # Loop for Array(15)
                    try:
                        select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link"]))
                    except:
                        select_listgood_link = None

                    try:
                        select_plan_link = PlanProduction.objects.get(id=int(record["plan_link"]))
                    except:
                        select_plan_link = None
              

                    map_management = Map_management(
                        machine=machine,
                        zca_on=zca_on,
                        name_th=record.get("name_th"),
                        name_en=record.get("name_en"),
                        product_type=record.get("product_type"),
                        product_date=record.get("product_date"),
                        product_shift=record.get("product_shift"),
                        ticket_type=record.get("ticket_type"),
                        qty=record.get("qty"),
                        receive_date=record.get("receive_date"),
                        receive_shift=record.get("receive_shift"),
                        pcsperpallet=record.get("pcsperpallet"),
                        product_length=record.get("product_length"),
                        ton=record.get("ton"),
                        lab_approve=record.get("lab_approve"),
                        listgood_link=select_listgood_link,
                        plan_link=select_plan_link,
                        warehouse=record["warehouse"],
                        zone=record["zone"],
                        row=record.get("row"),
                        column=record.get("column"),
                        mapid=record.get("mapid"),
                        level=record.get("level"),
                        lab=record.get("lab"),
                        lock=record.get("lock"),
                        success=record.get("success")
                    )
                    map_management.save()

        return Response(data, status=status.HTTP_201_CREATED)
    

class get_mapmanagement_info(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, *args, **kwargs):
        
    
        # แปลง QuerySet เป็นรายการของ dict
        try:

            queryset = Map_management.objects.values().order_by('-created_at')
            return Response(queryset)
        except Exception as e:
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_products(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):

        try:
         
            queryset = Product.objects.values()

            print (Response(queryset),'response')
            return Response(queryset)
        except Exception as e:
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#W113-SZ1-C56
        
class FindNextBinLocation(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, requset, *args, **kwargs):
        try:
            payload = 'w113-sz1-c59'
            parts = payload.split('-')
            warehouse_name = parts[0]
            zone = parts[1][2:]
            column = parts[2][1:]
            warehouse = Warehouse.objects.get(name=warehouse_name)
            location_info = map_location_info.objects.filter(
                warehouse=warehouse,zone=zone,column=column
            )

            max_row = location_info.count()
            max_level = location_info.first().max_level if location_info else None
            max_sub_column = location_info.first().sub_column if location_info else None

            subquery = Map_management.objects.filter(
                warehouse=warehouse.id,
                zone=zone,
                column=column
            ).values(
                'warehouse', 'zone', 'column', 'row', 'level', 'sub_column'
            ).annotate(
                max_id=Max('id')
            ).values('max_id')

            management_info = Map_management.objects.filter(
                id__in=subquery,
                warehouse=warehouse.id,
                zone=zone,
                column=column,
                map_approve__in=[1, 3, 4, 5]
            ).order_by('-row', '-level', '-sub_column')

            print('warehouse:',warehouse.id,'zone:',zone,'column:',column)
            print('subquery:',subquery)
            last_position = management_info.first()
            print('last_position:',last_position)
            if last_position:
                next_warehouse = warehouse.id
                next_zone = zone
                next_column = column
                next_row = 1
                next_level = 1
                next_sub_column = 1

                if max_sub_column is not None and last_position.sub_column < max_sub_column:

                    next_sub_column = last_position.sub_column + 1
                    next_level = last_position.level 
                    next_row = last_position.row
                elif max_level is not None and last_position.level < max_level:
                    
                    next_sub_column = 1 
                    next_level = last_position.level + 1
                    next_row = last_position.row

                elif max_row is not None and last_position.row < max_row:
            
                    next_row = last_position.row + 1
                    next_level = 1  
                    next_sub_column = 1  
                else:
                    # All values are at their maximum, return 'column is full'
                    return Response({"message": "Column is full."}, status=status.HTTP_400_BAD_REQUEST)

                new_location = {
                    "next_warehouse": next_warehouse,
                    "next_zone": next_zone,
                    "next_column": next_column,
                    "next_row": next_row,
                    "next_level": next_level,
                    "next_sub_column": next_sub_column,
                }
                
             

                return Response(new_location)

            else:
                return Response({"message": "No last position found."}, status=status.HTTP_400_BAD_REQUEST)
            
        except Warehouse.DoesNotExist:
            return Response({"message": f"Warehouse '{warehouse_name}' not found."}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            print("Error:", str(e))
            return Response({"message": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
def getDetail_WIP(zca_search):
    query = ItemMasterProductWIP.objects.filter(field_zca=zca_search).values()[0]
    return query

class get_productDetail(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            WIPSelect = getDetail_WIP(request.query_params.get('zca_on'))


            return Response({'success': True, 'data': WIPSelect})
        except Exception as e:
            print("Error >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SearchMap(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):
        try:
            map_ids = map_location_info.objects.values_list('mapid', flat=True)
            latest_mapid_subquery = Map_management.objects.filter(
                mapid=OuterRef('mapid'), 
                level=OuterRef('level'), 
                sub_column=OuterRef('sub_column'),
                mapid__in=map_ids
            ).order_by('-created_at').values('created_at')[:1]


            results = Map_management.objects.annotate(
                latest_created_at=Subquery(latest_mapid_subquery)
                
            ).filter(created_at=F('latest_created_at'),
            map_approve__in=[1, 3 ]).values('zca_on','name_th')

            counts = {}
            wipproduct = ItemMasterProductWIP.objects.values('field_zca','field_name').distinct()
            for x in wipproduct:
                keys = x['field_zca'] + ' ' +x['field_name']
                if keys not in counts:
                    counts[keys] = 0
                for i in results:
                    if i['zca_on'] == x['field_zca']:
                        counts[keys] += 1

            counts = OrderedDict(sorted(counts.items(), key=lambda x: x[1], reverse=True))

            return Response(counts)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SearchMapFromOptions(APIView):
    permission_classes = [permissions.AllowAny,]


    def get(self, request, *args, **kwargs):

        zca_query = self.request.query_params.get('zca_query', None)
        lab_query = self.request.query_params.get('lab_query', None)
        shelflife_query = self.request.query_params.get('shelflife_query', None)
        fraction = self.request.query_params.get('fraction', None)
        damaged = self.request.query_params.get('damaged', None)
        date_now = datetime.today()
        start_date = date_now 
        last_date = date_now

        if shelflife_query in ['null','none','undefined','0''false']:
            shelflife_query = 0
        elif shelflife_query == '30':
            start_date = date_now 
            findlastdate = timedelta(days=30)
            last_date = date_now - findlastdate
        elif shelflife_query == '180':
            findstartdate = timedelta(days=31)
            findlastdate = timedelta(days=180)
            start_date = date_now - findstartdate
            last_date = date_now - findlastdate
        elif shelflife_query == '365':
            findstartdate = timedelta(days=181)
            findlastdate = timedelta(days=365)
            start_date = date_now - findstartdate
            last_date = date_now - findlastdate
        elif shelflife_query == '1000':
            findstartdate = timedelta(days=366)
            start_date = date_now - findstartdate

            
    

        try:
            map_ids = map_location_info.objects.values_list('mapid', flat=True)
            latest_mapid_subquery = Map_management.objects.filter(
                mapid=OuterRef('mapid'), 
                level=OuterRef('level'), 
                sub_column=OuterRef('sub_column'), 
                mapid__in=map_ids
            ).order_by('-created_at').values('created_at')[:1]


            results = Map_management.objects.annotate(
                latest_created_at=Subquery(latest_mapid_subquery),         
            ).filter(created_at=F('latest_created_at'),
                     map_approve__in=[1, 3 ]).values()
            if zca_query not in ['undefined','not','null']:
                results = results.filter( zca_on=zca_query)
            if fraction == 'true':
                results = results.exclude(qty=F('pcsperpallet'))
            if damaged == 'true':
                results = results.filter(damaged=1)
            if lab_query not in ['undefined','not','null']:
                results = results.filter(lab=lab_query) 
            if shelflife_query == '1000':
                results = results.filter(product_date__lte=start_date)
            elif shelflife_query != 0:
                results = results.filter(product_date__range=[last_date,start_date])
            elif shelflife_query == 0:
                pass
            print('results:',results)
            counts = {}


            for i in results:
                wid = i['warehouse_id']
                column = i['column']
                row = i['row']
                warehouse = Warehouse.objects.get(id=wid).name or 'Unknow'
               

                # สร้าง dictionary สำหรับ warehouse_id ถ้ายังไม่มี
                if warehouse not in counts:
                    counts[warehouse] = {}

                # สร้าง dictionary สำหรับ column ใน warehouse_id ถ้ายังไม่มี
                if column not in counts[warehouse]:
                    counts[warehouse][column] = {}

                # สร้าง list สำหรับ row ใน column ถ้ายังไม่มี
                if row not in counts[warehouse][column]:
                    counts[warehouse][column][row] = []

                # สร้างและเพิ่มข้อมูลใน list
                keys = i['zca_on'] + i['name_th']
                data = {
                    'id' : i['id'],
                    'mapid': i['mapid'],
                    'subzone': i['zone'],
                    'level': i['level'],
                    'position': i['sub_column'],
                    'product_date': i['product_date'],
                }
                
                counts[warehouse][column][row].append(data)

            for warehouse in counts:
                # ไม่จำเป็นต้องเรียงลำดับ column และ row ที่นี่เพราะเราจะทำในลูปด้านใน
                for column in counts[warehouse]:
                    for row in counts[warehouse][column]:
                        # เรียงลำดับข้อมูลภายใน list โดยใช้ 'level', 'column', และ 'row' จาก dictionary
                        counts[warehouse][column][row] = sorted(counts[warehouse][column][row], 
                                                                key=lambda x: (int(x.get('level', 0)),
                                                                               int(x.get('position', 0)),
                                                                         ), 
                                                                reverse=True)



            return Response(counts)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class WarehouseInfoAPI(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):
        try:
            response_data = {}
            defined_sizes = [1.2, 2.4, 3.0, 4.0]
            warehouses = Warehouse.objects.all()

            zca_values_in_table2 = Info_WIPBalance.objects.values_list('zca_on', flat=True)
            query_location = map_location_info.objects.filter(warehouse__id__range=(1, 9)).values('warehouse', 'column').distinct().count()
            # ค้นหา zca ใน Table1 ที่ไม่มีใน Table2
            zca_not_in_table2 = list(ItemMasterProductWIP.objects.exclude(field_zca__in=zca_values_in_table2).distinct().values_list('field_zca', flat=True))

            map_ids = map_location_info.objects.values_list('mapid', flat=True)
            latest_mapid_subquery = Map_management.objects.filter(
                mapid=OuterRef('mapid'), 
                level=OuterRef('level'), 
                sub_column=OuterRef('sub_column'),
                mapid__in=map_ids
            ).exclude(map_approve = 2).order_by('-created_at').values('created_at')[:1]
        
            for warehouse in warehouses:
            
                capacity_counts = warehouse.map_location_info_set.filter(activate=True)\
                    .values('size')\
                    .annotate(sum_max_sub=Sum(F('max_level') * F('sub_column')))\
                    .order_by('size')


                actual_counts = Map_management.objects.annotate(
                    latest_created_at=Subquery(latest_mapid_subquery),
                    size=(F('product_length') / float(100))
                ).filter(
                    created_at=F('latest_created_at'),  
                    map_approve__in=[1, 3, 4 ,5],
                    warehouse=warehouse.id 
                ).values('size','product_length').annotate(count=Count('size')).order_by('size')

   
                capacity_data = {f"{size_count['size']}": size_count['sum_max_sub'] for size_count in capacity_counts}
                actual_data = {f"{size_count['size']}": size_count['count'] for size_count in actual_counts}

                warehouse_data = {'capacity': capacity_data, 'actual': actual_data}
                response_data[str(warehouse.id)] = warehouse_data
            

            return Response(response_data)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class get_TopZca(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):
        waid = self.request.query_params.get('warehouse_id', None)
        ton = self.request.query_params.get('ton',None)
        try:
            latest_mapid_subquery = Map_management.objects.filter(
                mapid=OuterRef('mapid'), 
                level=OuterRef('level'), 
                sub_column=OuterRef('sub_column')
            ).order_by('-created_at').values('created_at')[:1]

            if waid not in [None, '0' , '','null','NaN']:
                queryset = Map_management.objects.values('zca_on','name_th').annotate(
                    latest_created_at=Subquery(latest_mapid_subquery),
                    cal_ton = (F('kgpcs') * F('qty') / 1000),
                ).filter(
                        created_at=F('latest_created_at'),  
                        map_approve__in = [1,3],
                        warehouse = waid
                        
                )
            else :
                queryset = Map_management.objects.values('zca_on','name_th').annotate(
                    latest_created_at=Subquery(latest_mapid_subquery),
                    cal_ton = (F('kgpcs') * F('qty') / 1000)
                ).filter(
                        created_at=F('latest_created_at'),  
                        map_approve__in = [1,3],

                )
                

            zca_name = []
            zca_count= {}
            if ton == 'true':
                for item in queryset:
                    if item['zca_on'] not in zca_count:
                        cal_ton = float(item['cal_ton'] or 0) 
                        zca_count[item['zca_on']] = {
                            'zca_on': item['zca_on'],
                            'name_th': item['name_th'],
                            'count': cal_ton,
                        }
                        zca_name.append(zca_count[item['zca_on']])
                    else :
                        zca_count[item['zca_on']]['count'] += float(item['cal_ton'] or 0)
                        zca_count[item['zca_on']]['count'] = round(zca_count[item['zca_on']]['count'],2)
                       
            else :
                 for item in queryset:
                    if item['zca_on'] not in zca_count:
                        cal_ton = float(item['cal_ton'] or 0) 
                        zca_count[item['zca_on']] = {
                            'zca_on': item['zca_on'],
                            'count': 1,
                            'name_th': item['name_th'],
                        }
                        zca_name.append(zca_count[item['zca_on']])
                    else :
                        zca_count[item['zca_on']]['count'] += 1

                
            zca_name_sorted = sorted(zca_name, key=lambda x: x['count'], reverse=True)

            return Response(zca_name_sorted[:3])
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_lineChart1Day(APIView):
    permission_classes = [permissions.AllowAny,]
    product_lengths = [400, 300, 240, 120]
    storage_capacity_results = {}
    storage_actual_results = {}
    storage_free_space_results = {}
    def get(self, request, *args, **kwargs):
        waid = self.request.query_params.get('warehouse_id', None)
        ton = self.request.query_params.get('ton',None)
        period = self.request.query_params.get('period',0)
        try:


            mapfill = ['fill','badfill','return','ticket','labreturn']
            mapwithdraw = ['withdraw']
            maptransfer = ['maptransfer']

            # เตรียม results dictionary
            results = {}
            results['inbound'] = {}
            results['transfer'] = {}
            results['outbound'] = {}

            end_date = datetime.now()
            start_date = end_date - timedelta(hours=23)

            all_hours = [start_date + timedelta(hours=x) for x in range(0,24)]


     

            results['transfer']['transfer'] = {}
            results['outbound']['withdraw'] = {}
            results['inbound']['fill']={}   
            results['inbound']['badfill']={}
            results['inbound']['return']={}
            results['inbound']['ticket']={}
            results['inbound']['labreturn']={}


            wd_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='withdraw',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            
            transfer_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='transfer',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
        
            fill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='fill',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            
            badfill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='badfill',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            
            return_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='return',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            
            ticket_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='ticket',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            labreturn_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='llabreturn',
                    ).annotate(hour=TruncHour('created_at')
                    ).values_list('id', flat=True)
            
            warehouse_query = Q()
            if waid not in [None, '0' , '','null','NaN']:
                warehouse_query = Q(warehouse=waid)
            
            wd_results = Map_management.objects.filter(warehouse_query,forklift_link__in=wd_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

            transfer_results = Map_management.objects.filter(warehouse_query,forklift_link__in=transfer_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id') / 2, sum_ton=Sum(F('kgpcs') * F('qty')) / 2000)\
            .order_by('hour')

            fill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=fill_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

            badfill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=badfill_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

            return_results = Map_management.objects.filter(warehouse_query,forklift_link__in=return_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

            ticket_results = Map_management.objects.filter(warehouse_query,forklift_link__in=ticket_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

            labreturn_results = Map_management.objects.filter(warehouse_query,forklift_link__in=labreturn_forklift)\
            .annotate(hour=TruncHour('forklift_link__created_at'))\
            .values('hour')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('hour')

           
            


            for hour in all_hours:
 
                hour_key = hour.strftime("%m/%d/%Y %H:00")
                for category in results.values():  
                    for action in category:  
                        if hour_key not in category[action]:
                            category[action][hour_key] = 0 
                for item in fill_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['inbound']['fill'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in badfill_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['inbound']['badfill'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in return_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['inbound']['return'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in ticket_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['inbound']['ticket'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in labreturn_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['inbound']['labreturn'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0

                for item in wd_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key:
                        results['outbound']['withdraw'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0

                for item in transfer_results:
                    item_hour_key = item['hour'].strftime("%m/%d/%Y %H:00")
                    if item_hour_key == hour_key: 
                        results['transfer']['transfer'][hour_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0


            return Response({'line_charts':results}) 
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class get_lineChartTest(APIView):
    permission_classes = [permissions.AllowAny,]
    product_lengths = [400, 300, 240, 120]
    storage_capacity_results = {}
    storage_actual_results = {}
    storage_free_space_results = {}
    def get(self, request, *args, **kwargs):
        waid = self.request.query_params.get('warehouse_id', None)
        ton = self.request.query_params.get('ton',None)
        period = self.request.query_params.get('period',0)
        try:


            mapfill = ['fill','badfill','return','ticket','labreturn']
            mapwithdraw = ['withdraw']
            maptransfer = ['maptransfer']

            # เตรียม results dictionary
            results = {}
            results['inbound'] = {}
            results['transfer'] = {}
            results['outbound'] = {}

            end_date = datetime.today()
            start_date = end_date - timedelta(days=365)
            all_months = [start_date + timedelta(days=x) for x in range((end_date - start_date).days) if (start_date + timedelta(days=x)).day == 1]

            results['transfer']['transfer'] = {}
            results['outbound']['withdraw'] = {}
            results['inbound']['fill']={}   
            results['inbound']['badfill']={}
            results['inbound']['return']={}
            results['inbound']['ticket']={}
            results['inbound']['labreturn']={}


            wd_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='withdraw',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            
            transfer_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='transfer',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
        
            fill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='fill',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            
            badfill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='badfill',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            
            return_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='return',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            
            ticket_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='ticket',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            labreturn_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='llabreturn',
                    ).annotate(month=TruncMonth('created_at')
                    ).values_list('id', flat=True)
            
            warehouse_query = Q()
            if waid not in [None, '0' , '','null','NaN']:
                warehouse_query = Q(warehouse=waid)
            
            wd_results = Map_management.objects.filter(warehouse_query,forklift_link__in=wd_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

            transfer_results = Map_management.objects.filter(warehouse_query,forklift_link__in=transfer_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id') / 2, sum_ton=Sum(F('kgpcs') * F('qty')) / 2000)\
            .order_by('month')

            fill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=fill_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

            badfill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=badfill_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

            return_results = Map_management.objects.filter(warehouse_query,forklift_link__in=return_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

            ticket_results = Map_management.objects.filter(warehouse_query,forklift_link__in=ticket_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

            labreturn_results = Map_management.objects.filter(warehouse_query,forklift_link__in=labreturn_forklift)\
            .annotate(month=TruncMonth('forklift_link__created_at'))\
            .values('month')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('month')

           
            


            for month in all_months:
                month_key = month.strftime("%m/%d/%Y")
                for category in results.values():  
                    for action in category:  
                        if month_key not in category[action]:
                            category[action][month_key] = 0 
                for item in fill_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['inbound']['fill'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in badfill_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['inbound']['badfill'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in return_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['inbound']['return'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in ticket_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['inbound']['ticket'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in labreturn_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['inbound']['labreturn'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0



                for item in wd_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['outbound']['withdraw'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0

                for item in transfer_results:
                    item_month_key = item['month'].strftime("%m/%d/%Y")
                    if item_month_key == month_key:
                        results['transfer']['transfer'][month_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0

            



            return Response({'line_charts':results}) 
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
class get_lineChart(APIView):
    permission_classes = [permissions.AllowAny,]
    product_lengths = [400, 300, 240, 120]
    storage_capacity_results = {}
    storage_actual_results = {}
    storage_free_space_results = {}
    def get(self, request, *args, **kwargs):
        waid = self.request.query_params.get('warehouse_id', None)
        ton = self.request.query_params.get('ton',None)
        period = self.request.query_params.get('period',0)
        try:


            mapfill = ['fill','badfill','return','ticket','labreturn']
            mapwithdraw = ['withdraw']
            maptransfer = ['maptransfer']

            # เตรียม results dictionary
            results = {}
            results['inbound'] = {}
            results['transfer'] = {}
            results['outbound'] = {}

            daycount = 0 
            if period == '7d':
                daycount = 7
            if period == '14d':
                daycount = 14
            if period == '30d':
                daycount = 30
            if period == '90d':
                daycount = 90
            if period == '180d':
                daycount = 180
            if period == '365d':
                daycount = 365
            day_count = daycount
            if day_count > 365 : day_count = 7

            end_date = datetime.today()
            start_date = end_date - timedelta(days=day_count - 1 )
            all_date = [start_date + timedelta(days=x) for x in range(day_count)]

            results['transfer']['transfer'] = {}
            results['outbound']['withdraw'] = {}
            results['inbound']['fill']={}   
            results['inbound']['badfill']={}
            results['inbound']['return']={}
            results['inbound']['ticket']={}
            results['inbound']['labreturn']={}


            wd_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='withdraw',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            
            transfer_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='transfer',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
        
            fill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='fill',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            
            badfill_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='badfill',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            
            return_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='return',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            
            ticket_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='ticket',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            labreturn_forklift = Forklift_Worklist.objects.filter(
                    created_at__range= [start_date,end_date], 
                    type_transport='llabreturn',
                    ).annotate(date=TruncDate('created_at')
                    ).values_list('id', flat=True)
            
            warehouse_query = Q()
            if waid not in [None, '0' , '','null','NaN']:
                warehouse_query = Q(warehouse=waid)
            
            wd_results = Map_management.objects.filter(warehouse_query,forklift_link__in=wd_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

            transfer_results = Map_management.objects.filter(warehouse_query,forklift_link__in=transfer_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id') / 2, sum_ton=Sum(F('kgpcs') * F('qty')) / 2000)\
            .order_by('date')

            fill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=fill_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

            badfill_results = Map_management.objects.filter(warehouse_query,forklift_link__in=badfill_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

            return_results = Map_management.objects.filter(warehouse_query,forklift_link__in=return_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

            ticket_results = Map_management.objects.filter(warehouse_query,forklift_link__in=ticket_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

            labreturn_results = Map_management.objects.filter(warehouse_query,forklift_link__in=labreturn_forklift)\
            .annotate(date=TruncDate('forklift_link__created_at'))\
            .values('date')\
            .annotate(total=Count('id'),sum_ton = Sum(F('kgpcs') * F('qty')) / 1000)\
            .order_by('date')

           
            


            for date in all_date:
                date_key = date.strftime("%m/%d/%Y")
                for category in results.values():  
                    for action in category:  
                        if date_key not in category[action]:
                            category[action][date_key] = 0 
                for item in fill_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['inbound']['fill'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in badfill_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['inbound']['badfill'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in return_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['inbound']['return'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in ticket_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['inbound']['ticket'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0
                for item in labreturn_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['inbound']['labreturn'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total'] or 0



                for item in wd_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['outbound']['withdraw'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total']

                for item in transfer_results:
                    item_date_key = item['date'].strftime("%m/%d/%Y")
                    if item_date_key == date_key:
                        results['transfer']['transfer'][date_key] = round(item['sum_ton'] or 0, 2) if ton == 'true' else item['total']

            



            return Response({'line_charts':results}) 
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class get_dashboard_info(APIView):
    permission_classes = [permissions.AllowAny,]
    
    product_lengths = [400, 300, 240, 120]
    storage_capacity_results = {}
    storage_actual_results = {}
    storage_free_space_results = {}
    def get(self, request, *args, **kwargs):
        waid = self.request.query_params.get('warehouse_id', None)
        ton = self.request.query_params.get('ton', None)

        # table1_records_not_in_table2 = Info_WIPBalance.objects.exclude(
        #     zca_on__in=Subquery(ItemMasterProductWIP.objects.values('field_zca'))
        # )
        # print('table1_records_not_in_table2:',table1_records_not_in_table2)


        size_to_product_length = {
            4.0: 400,
            3.0: 300,
            2.4: 240,
            1.2: 120,
        }

        try:
            storage_capacity_results = {}
            storage_actual_results = {}
            storage_free_space_results = {}
            storage_cost_results = {}

            sum_storage_capacity = 0  
            sum_storage_actual = 0 
            sum_storage_cost = 0
            sum_storage_free_space = 0 


            for size, product_length in size_to_product_length.items():
                size_to_ton_mapping = {
                    1.2: 0.918,
                    2.4: 2.491,
                    3.0: 2.498,
                    4.0: 3.670
                }
                ton_per_pallet = size_to_ton_mapping.get(size, 0)



                cap_query = map_location_info.objects.all()
                actual_query = Map_management.objects.all()
                
                if waid not in [None, '0' , '','null','NaN']:
                    cap_query = map_location_info.objects.filter(warehouse= waid)
                    actual_query = Map_management.objects.filter(warehouse= waid)



                raw_capacity = cap_query.exclude(
                    warehouse_id__type_warehouse='buffer'
                ).filter(
                    size=size  
                ).aggregate(
                    total_capacity=Sum(F('max_level') * F('sub_column'))
                )

                total_capacity = raw_capacity.get('total_capacity') or 0
                total_capacity_ton = total_capacity * ton_per_pallet

              
                actual_count = actual_query.filter(
                    mapid=OuterRef('mapid'), 
                    level=OuterRef('level'), 
                    sub_column=OuterRef('sub_column'),
                    product_length=product_length,
       
                ).order_by('-created_at').values('created_at')[:1]
                
                zca_cost = Info_WIPBalance.objects.filter(zca_on=OuterRef('zca_on')).values('priceperunit')[:1]

                actuals = Map_management.objects.annotate(
                    latest_created_at=Subquery(actual_count),
                    cal_cost = F('qty') * Subquery(zca_cost),
                    cal_ton = (F('kgpcs') * F('qty')) / 1000
                ).order_by('-created_at').filter(
                    created_at=F('latest_created_at'),  
                ).exclude(map_approve__in = [0,2]).values()

                

              

                if  ton == 'true':
                    storage_capacity_results[product_length / 100 ] = round(total_capacity_ton,2)
                    sum_storage_capacity += total_capacity_ton 

                    total_cal_ton = actuals.aggregate(total_sum=Sum('cal_ton'))
                    total_sum_cal_ton = total_cal_ton.get('total_sum') 

                    total_sum_cal_ton_result = round(float(total_sum_cal_ton or 0) , 2) 
                   
                    storage_actual_results[product_length / 100] = round(total_sum_cal_ton_result,2)

                    sum_storage_actual += total_sum_cal_ton_result 

                    total_capacity_ton = total_capacity_ton
                    total_sum_cal_ton_result = total_sum_cal_ton_result 

                    free_space = round((total_capacity_ton - total_sum_cal_ton_result) , 2)

                    storage_free_space_results[product_length / 100] = free_space
                    sum_storage_free_space += free_space 
                    sum_storage_free_space = round(sum_storage_free_space, 2)
            
                else :
                    storage_capacity_results[product_length / 100 ] = total_capacity
                    sum_storage_capacity += total_capacity 
                    actual_counts = actuals.count()
                    

                    storage_actual_results[product_length / 100] = actual_counts

                    sum_storage_actual += actual_counts 
                    free_space = total_capacity - actual_counts 
                    storage_free_space_results[product_length / 100] = free_space
                    sum_storage_free_space += free_space 

                total_cal_cost = 0
                for item in actuals:
                    total_cal_cost += item['cal_cost'] if item['cal_cost'] is not None else 0

                cost_sum_per_length = round(float(total_cal_cost) / 1000000, 2)
                storage_cost_results[product_length / 100] = cost_sum_per_length
                sum_storage_cost += cost_sum_per_length

                
            
            storage_capacity_results['all'] = round(sum_storage_capacity,2)
            storage_actual_results['all'] = round(sum_storage_actual,2)
            storage_free_space_results['all'] = round(sum_storage_free_space,2)
            storage_cost_results['all'] = round(sum_storage_cost, 2)

            return Response({'storage_capacity':storage_capacity_results,'storage_actual':storage_actual_results,'storage_free_space':storage_free_space_results,'storage_cost':storage_cost_results}) 
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class get_map_location_info(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):
        try:
            # ดึงค่าของ warehouse_id จาก query parameter
            warehouse_id = self.request.query_params.get('warehouse_id', None)

            # ใช้เงื่อนไขในการ query จาก database
            if warehouse_id is not None:
                queryset = map_location_info.objects.filter(warehouse_id=warehouse_id).values()
            else:
                queryset = map_location_info.objects.values()
            
            return Response(list(queryset))  # ต้องแปลง queryset เป็น list ก่อน
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class update_map_location_info(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # รับข้อมูลจาก request
        column_data = request.data.get('column')
        max_level_data = request.data.get('max_level')
        size_data = request.data.get('size')
        sub_column = request.data.get('sub_column')
        zone_data = request.data.get('zone')
        warehouse_data = request.data.get('warehouse')
        activate_data = request.data.get('activate')
        print('activate_data:',activate_data)
        
        if not column_data:
            return Response({"error": "column is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not zone_data:
            return Response({"error": "column is required"}, status=status.HTTP_400_BAD_REQUEST)

        records = get_list_or_404(map_location_info, column=column_data,zone=zone_data,warehouse=warehouse_data)

        for record in records:
            if max_level_data:
                record.max_level = max_level_data
            if size_data:
                record.size = size_data
                record.sub_column = sub_column
            else:
                record.activate = activate_data
        
            

            record.save()
            print('record:',record.activate,activate_data)
        return Response({"message": "Updated successfully"}, status=status.HTTP_200_OK)


class get_map_info(APIView):
    permission_classes = [permissions.AllowAny,]

    def get(self, request, *args, **kwargs):
        latest_dates = Storage_info.objects.filter(mapid=OuterRef('mapid')).order_by('-created_at').values('created_at')[:1]

        distinct_mapids = Storage_info.objects.annotate(latest_date=Subquery(latest_dates)).filter(created_at=OuterRef('latest_date'))

        try:
            helloname = {}
            queryset2 = Product.objects.values_list()

            for i in queryset2:
                helloname[i[0]] = i


            for i in distinct_mapids:
                try:
                    i["product"] = helloname[i["product_id"]]
                except:
                    pass
            
            return Response(distinct_mapids)
        except Exception as e:
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class post_deletemap(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  
        for record in data: 
            try:
                select_plan_link = PlanProduction.objects.get(id=int(record["plan_link_id"]))
            except:
                select_plan_link = None
            try:
                select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link_id"]))
            except:
                select_listgood_link = None
            try:
                select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse_id"]))
            except:
                select_warehouse_id = None
            try:
                select_pallet_id = MapListFillPallet.objects.get(id=int(record["id"]))
            except:
                select_pallet_id = None
            try:
                select_plan_id = MapListFillPlan.objects.get(id=int(record["maplistfillplan_link_id"]))
            except:
                select_plan_id = None

            # product_date_str = record.get("product_date")
            # iso_string = product_date_str.replace('Z', '+00:00')
            # if iso_string:
            #     try:
            #         product_date_obj = datetime.fromisoformat(iso_string)
            #         formatted_product_date = product_date_obj.strftime('%Y-%m-%d')
            #     except ValueError:
            #         # Handle invalid date format
            #         formatted_product_date = None
            # else:
            #     formatted_product_date = None


            map_management = Map_management(
                # maplistfillpallet_link = select_pallet_id,
                # maplistfillplan_link = select_plan_id,
                # machine=record.get("machine"),
                # zca_on=record.get("zca_on"),
                # name_th=record.get("name_th"),
                # name_en=record.get("name_en"),
                # product_type=record.get("product_type"),
                # product_date=formatted_product_date,
                # product_shift=record.get("product_shift"),
                # ticket_type=record.get("ticket_type"),
                # qty=record.get("qty"),
                # receive_date=record.get("receive_date"),
                # receive_shift=record.get("receive_shift"),
                # pallet_no=record.get("pallet_no"),
                # pcsperpallet=record.get("pcsperpallet"),
                # product_length=record.get("product_length"),
                # ton=record.get("ton"),
                # lab_approve=record.get("lab_approve"),
                # listgood_link=select_listgood_link,
                # plan_link=select_plan_link,
                warehouse=select_warehouse_id,
                zone=record["zone"],
                row=record.get("row"),
                column=record.get("column"),
                mapid=record.get("mapid"),
                level=record.get("level"),
                sub_column = record.get("sub_column"),
                # lab=record.get("lab"),
                # lock=record.get("lock"),
                success=True,
                map_approve = 0,
                action_type='deletemap'
            )
            map_management.save()

        return Response({'success': True, 'success': 'success'}, status=status.HTTP_200_OK)
    
class post_editmap(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  
        for record in data: 
            try:
                select_plan_link = PlanProduction.objects.get(id=int(record["plan_link_id"]))
            except:
                select_plan_link = None
            try:
                select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link_id"]))
            except:
                select_listgood_link = None
            try:
                select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse_id"]))
            except:
                select_warehouse_id = None
            try:
                select_fillpallet_id = MapListFillPallet.objects.get(id=int(record["maplistfillpallet_link_id"]))
            except:
                select_fillpallet_id = None
            try:
                select_fillplan_id = MapListFillPlan.objects.get(id=int(record["maplistfillplan_link_id"]))
            except:
                select_fillplan_id = None
            try:
                select_fork_lift_id = Forklift_Worklist.objects.get(id=int(record["forklift_link_id"]))
            except:
                select_fork_lift_id= None

            try:
                select_withdrawpallet_link_id = MapListWithdrawPallet.objects.get(id=int(record["maplistwithdrawpallet_link_id"]))
            except:
                select_withdrawpallet_link_id = None
            try:
                withdrawplan = MapListWithdrawPlan.objects.get(id=int(record["maplistwithdrawplan_link_id"]))
            except:
                withdrawplan = None
            try:
                select_transferpallet_link_id = MapListTransferPallet.objects.get(id=int(record["maplisttransferpallet_link_id"]))
            except:
                select_transferpallet_link_id = None
            try:
                select_transferplan_link_id = MapListTransferPlan.objects.get(id=int(record["maplisttransferplan_link_id"]))
            except:
                select_transferplan_link_id = None


            product_date_str = record.get("product_date")
            iso_string = product_date_str.replace('Z', '+00:00')
            if iso_string:
                try:
                    product_date_obj = datetime.fromisoformat(iso_string)
                    formatted_product_date = product_date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    # Handle invalid date format
                    formatted_product_date = None
            else:
                formatted_product_date = None


            map_management = Map_management(

                machine=record.get("machine"),
                zca_on=record.get("zca_on"),
                name_th=record.get("name_th"),
                name_en=record.get("name_en"),
                product_type=record.get("product_type"),
                product_date=formatted_product_date,
                product_shift=record.get("product_shift"),
                ticket_type=record.get("ticket_type"),
                qty=record.get("qty"),
                pallet_no=record.get("pallet_no"),
                receive_date=record.get("receive_date"),
                receive_shift=record.get("receive_shift"),
                
                pcsperpallet=record.get("pcsperpallet"),
                product_length=record.get("product_length"),
                ton=record.get("ton"),
                lab_approve=record.get("lab_approve"),
    
                warehouse=select_warehouse_id,
                zone=record["zone"],
                row=record.get("row"),
                column=record.get("column"),
                mapid=record.get("mapid"),
                level=record.get("level"),
                sub_column = record.get("sub_column"),
                lab=record.get("lab"),
                lock=record.get("lock"),
                success=record.get("success"),
                map_approve = record.get("map_approve"),
                damaged = record.get("damaged"),
                            
                action_type='editmap',

                forklift_link=select_fork_lift_id,
                listgood_link=select_listgood_link,
                maplistfillpallet_link = select_fillpallet_id,
                maplistfillplan_link = select_fillplan_id,
                maplistwithdrawpallet_link = select_withdrawpallet_link_id,
                maplistwithdrawplan_link = withdrawplan,
                plan_link=select_plan_link,
                maplisttransferpallet_link = select_transferpallet_link_id,
                maplisttransferplan_link = select_transferplan_link_id,

            )
            map_management.save()

        return Response({'success': True, 'success': 'success'}, status=status.HTTP_200_OK)

class post_addmap(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  
        for record in data: 
            try:
                select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse"]))
            except:
                select_warehouse_id = None
            product_date_str = record.get("product_date")
            iso_string = product_date_str.replace('Z', '+00:00')
            print('product_date_str:',product_date_str)
            if iso_string:
            
                    product_date_obj = datetime.fromisoformat(iso_string)

                    print('formatted_product_date:',product_date_obj)
                    formatted_product_date = product_date_obj.strftime('%Y-%m-%d')

            else:
                formatted_product_date = None
          
            
            map_management = Map_management(
                # maplistfillpallet_link = select_pallet_id,
                # maplistfillplan_link = select_plan_id,
                machine=record.get("machine"),
                zca_on=record.get("zca_on"),
                name_th=record.get("name_th"),
                name_en=record.get("name_en"),
                product_type=record.get("product_type"),
                product_date=formatted_product_date,
                product_shift=record.get("product_shift"),
                ticket_type=record.get("ticket_type"),
                qty=record.get("qty"),
                # receive_date=record.get("receive_date"),
                # receive_shift=record.get("receive_shift"),
                pallet_no=record.get("pallet_no"),
                pcsperpallet=record.get("pcsperpallet"),
                product_length=record.get("product_length"),
                kgpcs = record.get("kgpcs"),
                ton=record.get("ton"),
                # lab_approve=record.get("lab_approve"),
                # listgood_link=select_listgood_link,
                # plan_link=select_plan_link,
                warehouse=select_warehouse_id,
                zone=record["zone"],
                row=record.get("row"),
                column=record.get("column"),
                mapid=record.get("mapid"),
                level=record.get("level"),
                sub_column = record.get("sub_column"),
                lab=record.get("lab"),
                # lab=record.get("lab"),
                # lock=record.get("lock"),
                success=True,
                map_approve = 1,
                action_type='addmap'
            )
            map_management.save()

        return Response({'success': True, 'success': 'success'}, status=status.HTTP_200_OK)

class post_map_info(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  
        print('data:',data)
        for job_id, job_item in data.items():
            for record in job_item: 
                try:
                    select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link"]))
                except:
                    select_listgood_link = None
                try:
                    select_plan_link = PlanProduction.objects.get(id=int(record["plan_link"]))
                except:
                    select_plan_link = None
                
                try:
                    select_pallet_id = MapListFillPallet.objects.get(id=int(record["id"]))
                except:
                    select_pallet_id = None

                try:
                    select_plan_id = MapListFillPlan.objects.get(id=int(record["maplistfillplan_link"]))
                    if select_plan_id.work_type == "fill":
                        type_transport_fillplan="fill"
                    elif select_plan_id.work_type == "return":
                        type_transport_fillplan="return"
                    elif select_plan_id.work_type == "ticket":
                        type_transport_fillplan="ticket"
                    elif select_plan_id.work_type == "labreturn":
                        type_transport_fillplan="labreturn"
                    elif select_plan_id.work_type == "badfill":
                        type_transport_fillplan="badfill"

                except:
                    select_plan_id = None
                    type_transport="Unknown"
                    
                try:
                    select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse"]))
                except:
                    select_warehouse_id = None
                
                forklift_worklist = Forklift_Worklist(
                    machine=record.get("machine"),
                    zca_on=record.get("zca_on"),
                    name_th=record.get("name_th"),
                    name_en=record.get("name_en"),
                    product_type=record.get("product_type"),
                    product_date=record.get("product_date"),
                    product_shift=record.get("product_shift"),
                    ticket_type=record.get("ticket_type"),
                    qty=record.get("qty"),
                    receive_date=record.get("receive_date"),
                    receive_shift=record.get("receive_shift"),
                    pallet_no=record.get("pallet_no"),
                    pcsperpallet=record.get("pcsperpallet"),
                    product_length=record.get("product_length"),
                    ton=record.get("ton"),
                    maplistfillpallet_link = select_pallet_id,
                    maplistfillplan_link = select_plan_id,
                    listgood_link=select_listgood_link,
                    plan_link=select_plan_link,
                    type_transport=type_transport_fillplan

                )
                forklift_worklist.save()

                map_management = Map_management(
                    maplistfillpallet_link = select_pallet_id,
                    maplistfillplan_link = select_plan_id,
                    machine=record.get("machine"),
                    zca_on=record.get("zca_on"),
                    name_th=record.get("name_th"),
                    name_en=record.get("name_en"),
                    product_type=record.get("product_type"),
                    # product_date=record.get("product_date"),
                    # product_shift=record.get("product_shift"),
                    ticket_type=record.get("ticket_type"),
                    # qty=record.get("qty"),
                    receive_date=record.get("receive_date"),
                    receive_shift=record.get("receive_shift"),
                    # pallet_no=record.get("pallet_no"),
                    pcsperpallet=record.get("pcsperpallet"),
                    product_length=record.get("product_length"),
                    ton=record.get("ton"),
                    kgpcs = record.get("kgpcs"),
                    lab_approve=record.get("lab_approve"),
                    listgood_link=select_listgood_link,
                    plan_link=select_plan_link,
                    warehouse=select_warehouse_id,
                    zone=record["zone"],
                    row=record.get("row"),
                    column=record.get("column"),
                    mapid=record.get("mapid"),
                    level=record.get("level"),
                    sub_column = record.get("sub_column"),
                    lab=record.get("lab"),
                    lock=record.get("lock"),
                    success=True,
                    map_approve = 5,
                    forklift_link = forklift_worklist,
                    action_type=type_transport_fillplan
                )
                map_management.save()

        return Response({'success': True, 'success': 'success'}, status=status.HTTP_200_OK)


    @swagger_auto_schema()
    def patch(self, request, *args, **kwargs):
        try:
            payload = request.data
            allowed_fields_to_update = ['zone', 'mapid', 'warehouse', 'column', 'row', 'level','sub_column']
            updated_records = []
            for job_id, job_item in payload.items():
                for record_data in job_item: 
                    record_id = record_data.get('id') 

                    if record_id is None:
                        continue  # Skip if no ID

                    try:
                        record = MapListFillPallet.objects.get(id=record_id)
                    except MapListFillPallet.DoesNotExist:
                        continue  # Skip if record does not exist
                    
                    # Only get allowed fields from record
                    updated_fields = {key: value for key, value in record_data.items() if key in allowed_fields_to_update}
                    
                    for field, value in updated_fields.items():
                        if field == 'warehouse':
                            try:
                                warehouse_instance = Warehouse.objects.get(id=value)
                                setattr(record, field, warehouse_instance)
                            except Warehouse.DoesNotExist:
                                continue
                        else:
                            setattr(record, field, value)

                    record.success = True
                    record.save()
                    print('record:',record)
                    updated_record_data = model_to_dict(record)
                    updated_records.append(updated_record_data)
                    print('updated_records',updated_records)
            return Response(updated_records, status=status.HTTP_200_OK)


        except Http404:
            return Response({'success': False, 'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    
class get_fullfillplan(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        
        try:
            # Filter by success==False
            queryset = MapListFillPallet.objects.order_by('receive_date', 'receive_shift', 'machine', 'zca_on')
            
            # Serialize the queryset
            serializer = MapListFillPlanSerializer(queryset, many=True)
            serialized_data = serializer.data

            # Group by the specified fields
            grouped_data = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))

            for item in serialized_data:
                receive_date = item['receive_date']
                receive_shift = item['receive_shift']
                machine = item['machine']
                zca_on = item['zca_on']

                grouped_data[receive_date][receive_shift][machine][zca_on].append(item)

            # Convert to JSON-serializable dict
            grouped_data_json = dict(grouped_data)

            return Response(grouped_data_json)

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.db.models import Count
class get_withdrawplan(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        
        try:
            print("here")
            success = request.query_params.get('success', 'False').lower() in ['true', '1', 't']
            unique_ids = MapListWithdrawPlan.objects.filter(withdraw_success=success) \
                                                    .values('id') \
                                                    .annotate(count_id=Count('id')) \
                                                    .filter(count_id=1) \
                                                    .values_list('id', flat=True)

            # Filter by unique IDs
            queryset = MapListWithdrawPlan.objects.filter(id__in=list(unique_ids)).order_by('send_date', 'send_shift')
            
            # Serialize the queryset
            serializer = MapListWithdrawPlanSerializer(queryset, many=True)
            serialized_data = serializer.data


            grouped_data = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))

            for item in serialized_data:
                send_date = item['send_date']
                send_shift = item['send_shift']
                machine = item['machine']
                zca_on = item['zca_on']

                grouped_data[send_date][send_shift][machine][zca_on].append(item)

            # Convert to JSON-serializable dict
            grouped_data_json = dict(grouped_data)

            return Response(grouped_data_json)

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class get_withdrawpallet(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        
        try:
            queryset = MapListWithdrawPallet.objects.order_by('send_date', 'send_shift', 'machine', 'zca_on', 'maplistwithdrawplan_link')
            serializer = MapListWithdrawPalletSerializer(queryset, many=True)
            serialized_data = serializer.data

            grouped_data = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list)))))

            for item in serialized_data:
                
                send_date = item['send_date']
                send_shift = item['send_shift']
                machine = item['machine']
                zca_on = item['zca_on']
                wdplan = int(item['maplistwithdrawplan_link'])

                grouped_data[send_date][send_shift][machine][zca_on][wdplan].append(item)
    

            # Sort each group by 'updated_at' of the first item, if available
            for date in grouped_data:
                for shift in grouped_data[date]:
                    for machine in grouped_data[date][shift]:
                        for zca_on in grouped_data[date][shift][machine]:
                            wdplan_data = grouped_data[date][shift][machine][zca_on]
                            if wdplan_data:  # Check if the list is not empty
                                grouped_data[date][shift][machine][zca_on] = dict(sorted(
                                    wdplan_data.items(),
                                    key=lambda x: x[1][0]['updated_at'] if x[1] else None,
                                    reverse=True
                                ))

            return Response(grouped_data)

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        


class get_fillplan(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            # Filter by success==False
            success = request.query_params.get('success', 'False').lower() in ['true', '1', 't']

            # Filter by success value
            queryset = MapListFillPallet.objects.filter(success=success).order_by('receive_date', 'receive_shift', 'machine', 'zca_on','maplistfillplan_link')
            
            # Serialize the queryset
            serializer = MapListFillPalletSerializer(queryset, many=True)
            serialized_data = serializer.data

            # Group by the specified fields
            grouped_data = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list)))))

            for item in serialized_data:
                receive_date = item['receive_date']
                receive_shift = item['receive_shift']
                machine = item['machine']
                zca_on = item['zca_on']
                fillplan = item['maplistfillplan_link']

                grouped_data[receive_date][receive_shift][machine][zca_on][fillplan].append(item)


            return Response(grouped_data)

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class patch_MapFillList(APIView):
    permission_classes = [permissions.AllowAny]








class product_emergency(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data
        # print(data)

        for i in data:
            for j in data[i]:
                for k in data[i][j]:
                    print(k["id"])

        return Response("Hello")
       


class Update_WithdrawPlan(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  # Assumes that data is a nested dictionary
        # print(json.dumps(data, indent=4, separators=(". ", " = ")))
        for job_id, job_data in data.items():
                                                 
                            total_qty = 0
                            
                            for record in job_data:
                                qtyy = int(record.get('qty'))
                                total_qty += qtyy

                            
                                
                                try:
                                    select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link_id"]))
                                except:
                                    select_listgood_link = None

                                try:
                                    select_plan_link = PlanProduction.objects.get(id=int(record["plan_link_id"]))
                                except:
                                    select_plan_link = None

                                try:
                                    maplistfillpallet_link_id = MapListFillPallet.objects.get(id=int(record["maplistfillpallet_link_id"]))
                                except:
                                    maplistfillpallet_link_id = None

                                try:
                                    maplistfillplan_link_id = MapListFillPlan.objects.get(id=int(record["maplistfillplan_link_id"]))
                                except:
                                    maplistfillplan_link_id = None


                                try:
                                    select_job_id = MapListWithdrawPlan.objects.get(id=int(record["job_id"]))
                                except:
                                    select_job_id = None

                                try:
                                    select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse"]))
                                except:
                                    select_warehouse_id = None
                                    
                    

                                withdrawpallet = MapListWithdrawPallet(
                                    fillplan_link = maplistfillplan_link_id,
                                    machine=record.get("machine"),
                                    zca_on=record.get("zca_on"),
                                    name_th=record.get("name_th"),
                                    name_en=record.get("name_en"),
                                    product_type=record.get("product_type"),
                                    product_date=record.get("product_date"),
                                    product_shift=record.get("product_shift"),
                                    ticket_type=record.get("ticket_type"),
                                    qty=record.get("qty"),
                                    send_date=record.get("send_date"),
                                    send_shift=record.get("send_shift"),
                                    pcsperpallet=record.get("pcsperpallet"),
                                    product_length=record.get("product_length"),
                                    kgpcs = record.get("kgpcs"),
                                    ton=record.get("ton"),
                                    lab_approve=record.get("lab_approve"),
                                    listgood_link=select_listgood_link,
                                    plan_link=select_plan_link,
                                    maplistwithdrawplan_link = select_job_id,
                                    listwithdraw_link=select_job_id.listwithdraw_link,
                                    warehouse=select_warehouse_id,
                                    zone=record["zone"],
                                    row=record.get("row"),
                                    column=record.get("column"),
                                    mapid=record.get("mapid"),
                                    level=record.get("level"),
                                    sub_column = record.get("sub_column"),
                                    lab=record.get("lab"),
                                    lock=record.get("lock"),
                                    success=record.get("success"),
                                    map_approve = 4,
                                    machine_to = select_job_id.machine,
                                    pallet_no=record.get("pallet_no"),
                                )
                                withdrawpallet.save()

                                forklift_worklist = Forklift_Worklist(
                                            machine=select_job_id.machine,
                                            zca_on=record.get("zca_on"),
                                            name_th=record.get("name_th"),
                                            name_en=record.get("name_en"),
                                            product_type=record.get("product_type"),
                                            product_date=record.get("product_date"),
                                            product_shift=record.get("product_shift"),
                                            ticket_type=record.get("ticket_type"),
                                            qty=record.get("qty"),
                                            send_date=record.get("send_date"),
                                            send_shift=record.get("send_shift"),
                                            pallet_no=record.get("pallet_no"),
                                            pcsperpallet=record.get("pcsperpallet"),
                                            product_length=record.get("product_length"),
                                            ton=record.get("ton"),      
                                            maplistwithdrawpallet_link = withdrawpallet,
                                            maplistwithdrawplan_link=select_job_id,
                                            listgood_link=select_listgood_link,
                                            plan_link=select_plan_link,
                                            type_transport="withdraw"

                                        )
                                forklift_worklist.save()

                                map_management = Map_management(
                            
                                    machine=select_job_id.machine,
                                    zca_on=record.get("zca_on"),
                                    name_th=record.get("name_th"),
                                    name_en=record.get("name_en"),
                                    product_type=record.get("product_type"),
                                    product_date=record.get("product_date"),
                                    product_shift=record.get("product_shift"),
                                    ticket_type=record.get("ticket_type"),
                                    qty=record.get("qty"),
                                    receive_date=record.get("receive_date"),
                                    receive_shift=record.get("receive_shift"),
                                    pcsperpallet=record.get("pcsperpallet"),
                                    product_length=record.get("product_length"),
                                    pallet_no=record.get("pallet_no"),
                                    kgpcs = record.get("kgpcs"),
                                    ton=record.get("ton"),
                                    lab_approve=record.get("lab_approve"),
                                    listgood_link=select_listgood_link,
                                    plan_link=select_plan_link,
                                    warehouse=select_warehouse_id,
                                    zone=record["zone"],
                                    row=record.get("row"),
                                    column=record.get("column"),
                                    mapid=record.get("mapid"),
                                    level=record.get("level"),
                                    sub_column = record.get("sub_column"),
                                    lab=record.get("lab"),
                                    lock=record.get("lock"),
                                    success=True,
                                    map_approve = 4,
                                    forklift_link = forklift_worklist,
                                    maplistfillpallet_link = maplistfillpallet_link_id,
                                    maplistfillplan_link=maplistfillplan_link_id,
                                    maplistwithdrawpallet_link = withdrawpallet,
                                    maplistwithdrawplan_link=select_job_id,
                                    action_type='withdrawmap'
                                )
                                map_management.save()
                            
                            maplistwd = MapListWithdrawPlan.objects.get(id=int(job_id))
                            listwd = ListWithdrawPlanProduction.objects.get(id=maplistwd.listwithdraw_link.id)
                            try:
                                blockinsert_get = Tiger_StockBalance.objects.filter(zca=listwd.zca_on).values()[0]
                                blockinsert_get = int(blockinsert_get["block"])
                            except:
                                blockinsert_get = 0

                            try:
                                urinsert_get = Tiger_StockBalance.objects.filter(zca=listwd.zca_on).values()[0]
                                urinsert_get = int(blockinsert_get["urstock"])

                                wdplanall = ListWithdrawPlanProduction.objects.filter(zca_no=listwd.zca_on,approve_withdraw=None).values()
                                for i in wdplanall:
                                    urinsert_get -= urinsert_get
                                
                            except:
                                urinsert_get = 0


                            TigerSAP = Tiger_GoodsIssue(
                                idmainfromwms = listwd.id,
                                usermachine = listwd.operator_keyin,
                                machine = listwd.machine,
                                gdate = listwd.receive_date,
                                shift = listwd.receive_shift,
                                matno = listwd.zca_on,
                                matname = listwd.name_th,
                                qty = total_qty,
                                urinsert = urinsert_get,
                                blockinsert = blockinsert_get,
                                pallet = divide_with_remainder(int(total_qty), maplistwd.pcsperpallet),
                                ton = float(total_qty) * maplistwd.kgpcs *0.001,
                                approver = listwd.operator_approve,
                                datetimewmssend = datetime.now(),
                            )  
                            TigerSAP.save()
                           
                            


        return Response({'success': True, 'success': 'success'}, status=status.HTTP_200_OK)

    @swagger_auto_schema()
    def patch(self, request, *args, **kwargs):
        try:
            payload = request.data
            updated_records = []

            for date, date_item in payload.items():
                for shift, shift_item in date_item.items():
                    for machine, machine_data in shift_item.items(): 
                        for zca_on, records in machine_data.items():
                            for record_data in records: 
                                record_id = record_data.get('id')

                                if record_id is None:
                                    continue

                                try:
                                    record = MapListWithdrawPlan.objects.get(id=record_id)
                                except MapListWithdrawPlan.DoesNotExist:
                                    continue

                                # Update the record fields with values from the payload
                                withdraw_success = record_data.get('withdraw_success')
                                record.withdraw_success = withdraw_success
                                record.save()

                                updated_record_data = model_to_dict(record)
                                updated_records.append(updated_record_data)

            return Response(updated_records, status=status.HTTP_200_OK)

        except Http404:
            return Response({'success': False, 'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Update_NoteWithdrawPlan(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data  # Assumes that data is a nested dictionary
        try:
            for key in data.keys():
                select_query = ListWithdrawPlanProduction.objects.get(id=key)
                print(select_query)
                select_query.note_planner = data[key]
                select_query.save()
            return Response(data, status=status.HTTP_200_OK)

        except Http404:
            return Response({'success': False, 'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class Update_TransferPlan(APIView):
    permission_classes = [permissions.AllowAny,]

    def post(self, request, *args, **kwargs):
        send_date = self.request.query_params.get('send_date', None)
        send_shift = self.request.query_params.get('send_shift', None)
        data = request.data
        if data:  
            transferplan = MapListTransferPlan(transfer_success=False)
            transferplan.save()
        source_count = 0
        print('data:',data)
        for job_id, processes in data.items():
            for process_name, process_data in processes.items():
                forklift_worklist = None
                for transfer_type in ['source', 'destination']:
                    record = process_data.get(transfer_type)
                    if transfer_type == 'source':
                            source_count += 1
                    try:
                        select_listgood_link = ListFillPlanProduction.objects.get(id=int(record["listgood_link_id"]))
                    except:
                        select_listgood_link = None
                    try:
                        maplistfillpallet_link_id = MapListFillPallet.objects.get(id=int(record["maplistfillpallet_link_id"]))
                    except:
                        maplistfillpallet_link_id = None
                    try:
                        maplistwithdrawpallet_link_id = MapListWithdrawPallet.objects.get(id=int(record["maplistwithdrawpallet_link_id"]))
                    except:
                        maplistwithdrawpallet_link_id = None
                    try:
                        maplistfillplan_link_id = MapListFillPlan.objects.get(id=int(record["maplistfillplan_link_id"]))
                    except:
                        maplistfillplan_link_id = None
                    try:
                        mapmanagement_link_id = Map_management.objects.get(id=int(record["id"]))
                    except:
                        mapmanagement_link_id = None
                    try:
                        select_plan_link = PlanProduction.objects.get(id=int(record["plan_link_id"]))
                    except:
                        select_plan_link = None
                    try:
                        withdrawplan = MapListWithdrawPlan.objects.get(id=int(record["job_id"]))
                    except:
                        withdrawplan = None

                    if withdrawplan:
                        listwithdraw_link = withdrawplan.listwithdraw_link
                    else:
                        listwithdraw_link = None 

                    try:
                        select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse_id"]))
                    except:
                        select_warehouse_id = None
                    if transfer_type == 'source':
                        map_approve = 2
                    elif transfer_type == 'destination':
                        map_approve = 3
                    if record:
                        # เขียนโค้ดเพื่อดึงข้อมูลจากโมเดลที่เกี่ยวข้อง
                        # ตัวอย่าง: select_listgood_link = ListFillPlanProduction.objects.get(id=record.get("listgood_link_id"))
                        # ทำซ้ำสำหรับโมเดลอื่นๆ

                        # สร้างวัตถุ WithdrawPallet และบันทึกลงในฐานข้อมูล

                    
                        transferpallet = MapListTransferPallet(
                                    # mapmanage_link = mapmanagement_link_id,
                                    machine=record.get("machine"),
                                    zca_on=record.get("zca_on"),
                                    name_th=record.get("name_th"),
                                    name_en=record.get("name_en"),
                                    product_type=record.get("product_type"),
                                    product_date=record.get("product_date"),
                                    product_shift=record.get("product_shift"),
                                    ticket_type=record.get("ticket_type"),
                                    qty=record.get("qty"),
                                    send_date=send_date,
                                    send_shift=send_shift,
                                    pcsperpallet=record.get("pcsperpallet"),
                                    product_length=record.get("product_length"),
                                    ton=record.get("ton"),
                                    lab_approve=record.get("lab_approve"),

                                    plan_link=select_plan_link,
                                    listgood_link=select_listgood_link,
                                    maplisttransferplan_link = transferplan,
 
                                    warehouse=select_warehouse_id,
                                    zone=record["zone"],
                                    row=record.get("row"),
                                    column=record.get("column"),
                                    mapid=record.get("mapid"),
                                    level=record.get("level"),
                                    sub_column = record.get("sub_column"),
                                    lab=record.get("lab"),
                                    lock=record.get("lock"),
                                    success=record.get("success"),
                                    map_approve = map_approve,
                                    pallet_no=record.get("pallet_no"),
                                    type_transfer=transfer_type,  

                        )
                        transferpallet.save()
                        if transfer_type == 'source':
                            forklift_worklist = Forklift_Worklist(
                                                machine=record.get("machine"),
                                                zca_on=record.get("zca_on"),
                                                name_th=record.get("name_th"),
                                                name_en=record.get("name_en"),
                                                product_type=record.get("product_type"),
                                                product_date=record.get("product_date"),
                                                product_shift=record.get("product_shift"),
                                                ticket_type=record.get("ticket_type"),
                                                qty=record.get("qty"),
                                                send_date=send_date,
                                                send_shift=send_shift,
                                                pallet_no=record.get("pallet_no"),
                                                pcsperpallet=record.get("pcsperpallet"),
                                                product_length=record.get("product_length"),
                                                ton=record.get("ton"),      
                                                maplisttransferpallet_link = transferpallet,
                                                maplisttransferplan_link=transferplan,
                                                listgood_link=select_listgood_link,
                                                plan_link=select_plan_link,
                                                type_transport="transfer"
                                            )
                            forklift_worklist.save()

                        map_management = Map_management(
                            
                                    machine=record.get("machine"),
                                    zca_on=record.get("zca_on"),
                                    name_th=record.get("name_th"),
                                    name_en=record.get("name_en"),
                                    product_type=record.get("product_type"),
                                    product_date=record.get("product_date"),
                                    product_shift=record.get("product_shift"),
                                    ticket_type=record.get("ticket_type"),
                                    qty=record.get("qty"),
                                    receive_date=record.get("receive_date"),
                                    receive_shift=record.get("receive_shift"),
                                    pcsperpallet=record.get("pcsperpallet"),
                                    product_length=record.get("product_length"),
                                    pallet_no=record.get("pallet_no"),
                                    kgpcs = record.get("kgpcs"),
                                    ton=record.get("ton"),
                                    lab_approve=record.get("lab_approve"),
                                    listgood_link=select_listgood_link,
                                    plan_link=select_plan_link,
                                    warehouse=select_warehouse_id,
                                    zone=record["zone"],
                                    row=record.get("row"),
                                    column=record.get("column"),
                                    mapid=record.get("mapid"),
                                    level=record.get("level"),
                                    sub_column = record.get("sub_column"),
                                    lab=record.get("lab"),
                                    lock=record.get("lock"),
                                    success=True,
                                    map_approve = map_approve,
                                    forklift_link = forklift_worklist,

                                    maplistfillpallet_link = maplistfillpallet_link_id,
                                    maplistfillplan_link=maplistfillplan_link_id,
                                    maplistwithdrawpallet_link = maplistwithdrawpallet_link_id,
                                    maplistwithdrawplan_link=withdrawplan,
                                    maplisttransferpallet_link = transferpallet,
                                    maplisttransferplan_link = transferplan,
                                    action_type='transfermap'

                                    
                                )
                        map_management.save()
        transferplan.total_job = source_count
        transferplan.save()

        return Response({'success': True})
    

class get_RoleUser(APIView):
    permission_classes = [permissions.AllowAny,]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # data = request.data  # Assumes that data is a nested dictionary
        try:
            roleUser = request.user.role_id
            return Response({'success': False ,'data': {roleUser}}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)