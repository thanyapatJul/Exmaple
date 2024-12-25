from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.db.models import Q
from rest_framework.authentication import SessionAuthentication # type: ignore
from rest_framework import routers, serializers, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_bulk import BulkModelViewSet
from django.db.models import Max, Q, F, Sum, FloatField,When,Value
from .models import *
from .serializers import *
from .permissions import *
from django.db.models import OuterRef, Subquery, Max, ExpressionWrapper
# from .validations import *
import logging
from django.core.paginator import Paginator, Page

from django.db import connection
from django.apps import apps

from datetime import datetime, timedelta
import os
import csv
import math
from collections import defaultdict
import qrcode
from django.http import JsonResponse
from PIL import Image
from io import BytesIO
import base64
import random


from barcode import Code128
from barcode.writer import ImageWriter
from googletrans import Translator

english_to_myanmar_numerals = {
    '0': '၀',
    '1': '၁',
    '2': '၂',
    '3': '၃',
    '4': '၄',
    '5': '၅',
    '6': '၆',
    '7': '၇',
    '8': '၈',
    '9': '၉'
}

def searchInfo_FG(zca_search):
    query = ItemMasterProductFG.objects.filter(zca=zca_search).values()[0]
    return query

def convert_date_to_QRcode(date_string):
    # Split the date string into year, month, and day components
    year, month, day = date_string.split('-')
    
    # Get the last two digits of the year
    short_year = year[-2:]
    
    # Generate a random three-digit number
    random_three_digits = random.randint(100, 999)  # This generates a random number between 100 and 999
    
    # Combine them into the custom format
    formatted_date = f"{random_three_digits} {day}{month}{short_year}"
    
    return formatted_date

def getDetail_WIP(zca_search):
    query = ItemMasterProductWIP.objects.filter(field_zca=zca_search).values()[0]
    return query

def fillterData_WIP(mc,brand,type):
    query = ItemMasterProductWIP.objects.filter(field_mc=mc,brand=brand,field_type=type).values()
    return query

def generate_qr(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=0,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    image_png = buffer.getvalue()
    buffer.close()

    image_base64 = base64.b64encode(image_png)
    image_str = image_base64.decode('utf-8')
    return f'data:image/png;base64,{image_str}'

def generate_barcode(data):
    # Create a barcode with the provided code
    barcode = Code128(data, writer=ImageWriter())

    # Create a custom writer with specific font size (if necessary)
    writer_options = {
        'quiet_zone': 0,  # This removes the border around the barcode
        'write_text': False,
    }

    # Save the barcode to an in-memory buffer
    buffer = BytesIO()
    barcode.write(buffer, options=writer_options)
    buffer.seek(0)

    # Encode the image to base64
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    image_str = f'data:image/png;base64,{image_base64}'

    # Serve the image
    return image_str

def setdata_qr(wood,zca_sql,item,mc_sql,converted_date,shift_sql):
    realWood = wood+1
    try:
        index = item['field_fracplacewood'].index(str(realWood))
        data = f"{zca_sql}/{item['field_pcspallet'][index]}/{mc_sql}/{converted_date}/{shift_sql}/{realWood}/{random.randint(1000, 9999)}/{random.randint(1000, 9999)}"
    except:
        if item['field_fracplacewood'] == "all":
            data = f"{zca_sql}/{item['field_pcspallet'][0]}/{mc_sql}/{converted_date}/{shift_sql}/{realWood}/{random.randint(1000, 9999)}/{random.randint(1000, 9999)}"
        else:
            data = f"{zca_sql}/{item['pcsperpallet']}/{mc_sql}/{converted_date}/{shift_sql}/{realWood}/{random.randint(1000, 9999)}/{random.randint(1000, 9999)}"
    
    return data

def translate_text_and_numbers(text):
    # Initialize the translator
    translator = Translator()

    # Translate text from English to Myanmar (Burmese)
    translation = translator.translate(text, src='en', dest='my')
    translated_text = translation.text

    # Convert English digits to Myanmar digits
    translated_text_with_myanmar_numerals = ''.join(
        english_to_myanmar_numerals[char] if char in english_to_myanmar_numerals else char for char in translated_text
    )

    return translated_text_with_myanmar_numerals

class get_statmachine(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # try:
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            data = []

            all_num_fill = 0
            all_num_withdraw = 0
            all_num_ticket = 0

            queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql, pdplan_date=date_sql,pdplan_delete="0").order_by('-id')

            for plan_production in queryset:
                items_fill = list(ListFillPlanProduction.objects.filter(plan_link=plan_production).values())
                for i in items_fill:
                    if "success" != i["fill_success"]:
                        all_num_fill += 1

                items_withdraw = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                for i in items_withdraw:
                    if "success" != i["withdraw_keyin"]:
                        all_num_withdraw += 1

                items_ticket = list(ListFillPlanProduction.objects.filter(plan_link=plan_production).values())
                for i in items_ticket:
                    items_ticket_pallet = list(ListFillTicketPalletProduction.objects.filter(fillplan_link=int(i["id"])).values("id","fillticketreturnplan_link","fillplan_link"))
                    for item in items_ticket_pallet:
                        if item['fillticketreturnplan_link'] == None:
                            all_num_ticket += 1
                            break

            data = {
                        "stat_plan": len(queryset),
                        "stat_fill":  all_num_fill,
                        "stat_withdraw": all_num_withdraw,
                        "stat_ticket": all_num_ticket,
                    }
            return Response({'success': True, 'data': data})
        # except Exception as e:
        #     print("ERROR >>>",e)
        #     return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class get_QRcode(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm]
                
    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            zca_sql = request.query_params.get('nameproduct')
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            shift_sql = request.query_params.get('shift')
            numwood_param = request.query_params.get('numwood')
            typeProduct = request.query_params.get('type')
            fracWood = request.query_params.get('fracwood')
            placeFracWood = request.query_params.get('placefracwood')

            numberOfWood = 0
            
            qr_image = {}
            
            if typeProduct == "WIP":
                item = getDetail_WIP(zca_sql)
            else:
                item = searchInfo_FG(zca_sql)
                try:
                    data_barcode = generate_barcode(item['zcacustomer'])
                    item['barcode'] = data_barcode
                except:
                    item['barcode'] = "null"
                item['field_pcspallet'] = item['pcpallet']
            
            try:
                name_myanmar = "အက်စီဂျီ စမတ်ဘုတ်"
                country = translate_text_and_numbers("Myanmar")
                size_mynmar = translate_text_and_numbers(item['name'].split(" ")[2].replace('cm', '')+" "+"centimetre")
                mt_code = translate_text_and_numbers("Material code")
                net_weight = translate_text_and_numbers("Net Weight")
                weight = translate_text_and_numbers(f"{item['kg']:.2f} kilogram/piece")
                quatity_myanmar = translate_text_and_numbers("အရေအတွက် : သစ်သားခုံ")
                pc_pallet_myamar = "တစ်ခု အခု / " + translate_text_and_numbers(str(item['pcpallet']))
                item['myanmar']={
                    'name_myanmar':name_myanmar,
                    'country':country,
                    'size_mynmar':size_mynmar,
                    'mt_code':mt_code,
                    'net_weight':net_weight,
                    'weight':weight,
                    'quatity_myanmar':quatity_myanmar,
                    'pallet_myanmar':pc_pallet_myamar
                }
                print(item['name'].split(" ")[2])
            except:
                pass

            converted_date = convert_date_to_QRcode(date_sql)
            item['status'] = ""
            item['field_fracplacewood'] = "no"
            item['pcsperpallet'] =  item['field_pcspallet']

            if numwood_param and numwood_param.isdigit():
                numwood = int(numwood_param)
                for wood in range(numwood):
                    numberOfWood += 1
            else:
                # Handle the case where numwood is None or not a valid integer
                if len(numwood_param.split("-")) <= 1 :
                    numwood = numwood_param.split(",")
                    int_list = [int(element)-1 for element in numwood]
                    int_list.sort()
                    for wood in (int_list):
                        numberOfWood += 1
                else:
                    numwood = numwood_param.split("-")
                    for wood in range(int(numwood[0])-1,int(numwood[1])):
                        numberOfWood += 1
            if fracWood :
                try:
                    if int(fracWood) >= 0:
                        item['field_pcspallet'] = [fracWood] * numberOfWood
                        item['status'] = "เศษ"
                    else:
                        item['field_pcspallet'] = [item['field_pcspallet']] * numberOfWood
                except:
                    fracWood_list = fracWood.split(',')
                    item['field_pcspallet'] = fracWood_list
                try:
                    if not placeFracWood and int(fracWood) > 0:
                        item['field_fracplacewood'] = "all"
                except:
                    pass
            else:
                item['field_pcspallet'] = [item['field_pcspallet']] * numberOfWood
                
            if placeFracWood:
                item['field_fracplacewood'] = placeFracWood.split(',')
            
            if numwood_param and numwood_param.isdigit():
                for wood in range(numberOfWood):
                    data = setdata_qr(wood,zca_sql,item,mc_sql,converted_date,shift_sql)
                    qr_image[wood] = generate_qr(data)
            else:
                if len(numwood_param.split("-")) <= 1 :
                    numwood = numwood_param.split(",")
                    int_list = [int(element)-1 for element in numwood]
                    int_list.sort()
                    for wood in (int_list):
                        data = setdata_qr(wood,zca_sql,item,mc_sql,converted_date,shift_sql)
                        qr_image[wood] = generate_qr(data)
                else:
                    numwood = numwood_param.split("-")
                    for wood in range(int(numwood[0])-1,int(numwood[1])):
                        data = setdata_qr(wood,zca_sql,item,mc_sql,converted_date,shift_sql)
                        qr_image[wood] = generate_qr(data)

            return Response({'data':item,'image': qr_image})
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class get_zcaWIPfillter(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm]
                
    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            brand = request.query_params.get('brand')
            typeProduct = request.query_params.get('type')

            item = (fillterData_WIP(mc_sql,brand,typeProduct).values_list('field_zca','field_name'))

            select_data = []
            for i in item:
                select_data.append({"value":i[0],"label":str(i[0])+" "+str(i[1])})

            return Response({'data':select_data})
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_zcafgproduction(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')

            variable_column = mc_sql + "_TL"
            variable_column = variable_column.lower()

            if mc_sql == "Lab":
                data = (ItemMasterProductFG.objects.filter(zca__startswith='zca').values_list('zca','name').distinct())
            else:
                data = (ItemMasterProductFG.objects.filter(**{ variable_column: "1", 'zca__startswith': 'zca' }).values_list('zca','name'))

            
            select_data = []
            for i in data:
                select_data.append({"value":i[0],"label":str(i[0])+" "+str(i[1])})
            
            return Response({'success': True, 'data':select_data,'data_list':data})
        except Exception as e:
            print("Error >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class send_help(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm | ForkliftPerm]
    def get(self, request, *args, **kwargs):
        try:
            minutes_ago = datetime.now() - timedelta(minutes=10)
            sending_qrcode = EmergencyQrcode.objects.filter(
                forklift_id=request.user.employee_id,
                created_at__gte=minutes_ago,
                status__isnull=True
            ).values()
            # Prepare the response data
            response_data = sending_qrcode[0] if sending_qrcode else sending_qrcode

            # Return the response
            return Response({'success': True, 'data': response_data})
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request, *args, **kwargs):
        try:
            data_params = request.data['params']
            idPlan = Map_management.objects.filter(id=data_params['id']).values('plan_link_id')
            print(idPlan)
            if data_params['qty'] != None:
                print(data_params['qty'])
                item = {'field_fracplacewood':"None",
                        'field_pcspallet':data_params['qty'],
                        'pcsperpallet':data_params['qty']}
                converted_date = convert_date_to_QRcode(data_params['date'])
                data = setdata_qr(int(data_params['numpallet'])-1, data_params['zca'], item, data_params['machine'], converted_date, data_params['shift'])
                qr_image = generate_qr(data)
            else:
                query_data = Forklift_Worklist.objects.filter(plan_link_id=idPlan[0]['plan_link_id'], pallet_no=data_params['numpallet']).values('qty','product_date','product_shift')[0]
                qty = query_data['qty']
                date = query_data['product_date']
                date_str = date.strftime("%Y-%m-%d")
                shift = query_data['product_shift']
                item = {'field_fracplacewood':"None",
                        'field_pcspallet':qty,
                        'pcsperpallet':qty}
                print(date)
                converted_date = convert_date_to_QRcode(date_str)
                data = setdata_qr(int(data_params['numpallet'])-1, data_params['zca'], item, data_params['machine'], converted_date, shift)
                qr_image = generate_qr(data)
            sending_Qrcode = EmergencyQrcode(
                zca = data_params['zca'],
                img = qr_image,
                forklift_id = data_params['idForklift']
            )
            sending_Qrcode.save()
            return Response({'data':data})
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class close_send_help(APIView):
    permission_classes = [ProductionPerm | PlannerPerm | AdminPerm | ForkliftPerm]
    def post(self, request, *args, **kwargs):
        try:
            data_params = request.data
            print(data_params)
            sending_Qrcode = EmergencyQrcode.objects.get(id=data_params['id'])
            sending_Qrcode.status = "finish"
            sending_Qrcode.save()
            return Response({'success':True})
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
