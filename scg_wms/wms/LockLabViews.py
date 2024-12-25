from django.shortcuts import render, redirect
import requests
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.db.models import Q
from rest_framework.authentication import SessionAuthentication
from rest_framework import routers, serializers, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_bulk import BulkModelViewSet
from django.db.models import Max, Q, F, Sum, FloatField,When,Value
from django.http import StreamingHttpResponse
from .models import *
from .serializers import *
from .permissions import *
from django_cte import With
import calendar
from django.db import models
from django.db import transaction
import json
import openpyxl
from io import StringIO, TextIOWrapper
from django.db.models import OuterRef, Subquery, Max, ExpressionWrapper
# from .validations import *
import traceback
import logging
from django.core.paginator import Paginator, Page

from django.db import connection
from django.apps import apps
import pytz
import time as timer
from datetime import datetime, timedelta, time , date
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
from pyxlsb import open_workbook



class post_datalocklab_boardhs(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    def preprocess_data(self, data):
        for key, entry in data.items():
            for field, value in entry.items():
                if value == "":
                    entry[field] = None
        return data

    @swagger_auto_schema()
    def post(self, request):
        data = self.preprocess_data(request.data)
        errors = []
        saved_count = 0

        # print(data)

        for key, entry in data.items():

            try :
                obj, created = LockLabHSBoardData.objects.update_or_create(
                    date=entry['date'],
                    machine=entry['machine'],
                    shift=entry['shift'],
                    defaults={
                            "sheet": entry.get("sheet", ""),
                            "machine": entry.get("machine", ""),
                            "product": entry.get("product", ""),
                            "date": entry.get("date", None),
                            "pallet": entry.get("pallet", ""),
                            "weight": entry.get("weight", ""),
                            "inspection1": entry.get("inspection1", ""),
                            "inspection2": entry.get("inspection2", ""),
                            "widthAD": entry.get("widthAD", ""),
                            "widthGH": entry.get("widthGH", ""),
                            "widthBC": entry.get("widthBC", ""),
                            "widthAverage": entry.get("widthAverage", ""),
                            "lengthAB": entry.get("lengthAB", ""),
                            "lengthEF": entry.get("lengthEF", ""),
                            "lengthDC": entry.get("lengthDC", ""),
                            "lengthAverage": entry.get("lengthAverage", ""),
                            "diagonalAC": entry.get("diagonalAC", ""),
                            "diagonalBD": entry.get("diagonalBD", ""),
                            "difflinecross": entry.get("difflinecross", ""),
                            "difflinewidth": entry.get("difflinewidth", ""),
                            "difflinelenght": entry.get("difflinelenght", 0),
                            "thick1": entry.get("thick1", ""),
                            "thick2": entry.get("thick2", ""),
                            "thick3": entry.get("thick3", ""),
                            "thick4": entry.get("thick4", ""),
                            "thick5": entry.get("thick5", ""),
                            "thick6": entry.get("thick6", ""),
                            "thick7": entry.get("thick7", ""),
                            "thick8": entry.get("thick8", ""),
                            "thickAverage": entry.get("thickAverage", ""),
                            "thickDiff": entry.get("thickDiff", ""),
                            "edgemmAB": entry.get("edgemmAB", ""),
                            "edgemmDC": entry.get("edgemmDC", ""),
                            "edgemmBC": entry.get("edgemmBC", ""),
                            "edgemmAD": entry.get("edgemmAD", ""),
                            "edgeperAB": entry.get("edgeperAB", ""),
                            "edgeperDC": entry.get("edgeperDC", ""),
                            "edgeperBC": entry.get("edgeperBC", ""),
                            "edgeperAD": entry.get("edgeperAD", ""),
                            "beforepressAB": entry.get("beforepressAB", ""),
                            "beforepressDC": entry.get("beforepressDC", ""),
                            "beforepressBC": entry.get("beforepressBC", ""),
                            "beforepressAD": entry.get("beforepressAD", ""),
                            "afterpressAB": entry.get("afterpressAB", ""),
                            "afterpressDC": entry.get("afterpressDC", ""),
                            "afterpressBC": entry.get("afterpressBC", ""),
                            "afterpressAD": entry.get("afterpressAD", ""),
                            "roughness": entry.get("roughness", ""),
                            "rzAvg": entry.get("rzAvg", ""),
                            "wzAvg": entry.get("wzAvg", ""),
                            "fzAvg": entry.get("fzAvg", ""),
                            "liftupleft": entry.get("liftupleft", ""),
                            "liftupright": entry.get("liftupright", ""),
                            "liftupAverage": entry.get("liftupAverage", ""),
                            "denweightair": entry.get("denweightair", None),
                            "denweightwater": entry.get("denweightwater", ""),
                            "denweightdry": entry.get("denweightdry", ""),
                            "densityCal": entry.get("densityCal", ""),
                            "waterAbspCal": entry.get("waterAbspCal", ""),
                            "moisturebefore": entry.get("moisturebefore", ""),
                            "moistureafter": entry.get("moistureafter", ""),
                            "moistureCal": entry.get("moistureCal", ""),
                            "dryL1": entry.get("dryL1", ""),
                            "dryL2": entry.get("dryL2", ""),
                            "dryCal": entry.get("dryCal", ""),
                            "screwamount": entry.get("screwamount", ""),
                            "screwbreak": entry.get("screwbreak", ""),
                            "leakage": entry.get("leakage", ""),
                            "laminaLoad": entry.get("laminaLoad", ""),
                            "laminaLamina": entry.get("laminaLamina", ""),
                            "laminatorn": entry.get("laminatorn", ""),
                            "hardpress": entry.get("hardpress", ""),
                            "harddepth": entry.get("harddepth", ""),
                            "hardness": entry.get("hardness", ""),
                            "thickness11": entry.get("thickness11", ""),
                            "thickness12": entry.get("thickness12", ""),
                            "thickness1Average": entry.get("thickness1Average", ""),
                            "loadPAR": entry.get("loadPAR", ""),
                            "usPAR": entry.get("usPAR", ""),
                            "thickness21": entry.get("thickness21", ""),
                            "thickness22": entry.get("thickness22", ""),
                            "thickness2Average": entry.get("thickness2Average", ""),
                            "loadPER": entry.get("loadPER", ""),
                            "usPER": entry.get("usPER", ""),
                            "usAverage": entry.get("usAverage", ""),
                            "isPAR": entry.get("isPAR", ""),
                            "isPER": entry.get("isPER", ""),
                            "result": entry.get("result", ""),
                            "note": entry.get("note", ""),
                            "lockpallet": entry.get("lockpallet", ""),
                            "amountlock": entry.get("amountlock", ""),
                            "symp": entry.get("symp", ""),
                            "status": entry.get("status", 0),
                            "shift": entry.get("shift", ""),
                        }
                )
                saved_count += 1

            except Exception as e:
                errors.append({key: str(e)})

        if saved_count == len(data):
            return Response({'message': f'All {saved_count} entries saved successfully!'}, status=status.HTTP_201_CREATED)
        elif saved_count > 0:
            return Response({
                'message': f'{saved_count} entries saved successfully, but some entries failed.',
                'errors': errors
            }, status=status.HTTP_206_PARTIAL_CONTENT)
        else:
            return Response({'message': 'No entries saved.', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        

class get_editdatelocklab_boardhs(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            shift = request.GET.get('shift')
            machine = request.GET.get('machine')

            queryset = LockLabHSBoardData.objects.filter(machine=machine,shift=shift,status=0).values('date')
                
            if queryset.exists():
                dates = [entry['date'].split(' ')[0] for entry in queryset]
                unique_dates = list(set(dates))
                unique_dates.insert(0, 'เลือก')
                print(unique_dates)
                return Response({'success': True, 'editdate': unique_dates})
            else:
                return Response({'success': True, 'editdate': []})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)
        
class get_editdatalocklab_boardhs(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            shift = request.GET.get('shift')
            machine = request.GET.get('machine')
            date = request.GET.get('date')

            queryset = LockLabHSBoardData.objects.filter(date__startswith=date,machine=machine,shift=shift,status=0).values()

            if queryset.exists():
                data = list(queryset.values())
                print(data)
                return Response({'success': True, 'data': data})
            else:
                return Response({'success': False, 'message': 'No records found for the specified date.'})

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)

class update_editdataHS_boardhs(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    def preprocess_data(self, data):
        for key, entry in data.items():
            for field, value in entry.items():
                if value == "":
                    entry[field] = None
        return data

    @swagger_auto_schema()
    def post(self, request):
        data = self.preprocess_data(request.data)  # Preprocess incoming JSON data
        errors = []
        saved_count = 0

        for key, entry in data.items():
            try:
                obj, created = LockLabHSBoardData.objects.update_or_create(
                    id=key,
                    defaults={
                        "sheet": entry.get("sheet", ""),
                        "machine": entry.get("machine", ""),
                        "product": entry.get("product", ""),
                        "date": entry.get("date", None),
                        "pallet": entry.get("pallet", ""),
                        "weight": entry.get("weight", ""),
                        "inspection1": entry.get("inspection1", ""),
                        "inspection2": entry.get("inspection2", ""),
                        "widthAD": entry.get("widthAD", ""),
                        "widthGH": entry.get("widthGH", ""),
                        "widthBC": entry.get("widthBC", ""),
                        "widthAverage": entry.get("widthAverage", ""),
                        "lengthAB": entry.get("lengthAB", ""),
                        "lengthEF": entry.get("lengthEF", ""),
                        "lengthDC": entry.get("lengthDC", ""),
                        "lengthAverage": entry.get("lengthAverage", ""),
                        "diagonalAC": entry.get("diagonalAC", ""),
                        "diagonalBD": entry.get("diagonalBD", ""),
                        "difflinecross": entry.get("difflinecross", ""),
                        "difflinewidth": entry.get("difflinewidth", ""),
                        "difflinelenght": entry.get("difflinelenght", 0),
                        "thick1": entry.get("thick1", ""),
                        "thick2": entry.get("thick2", ""),
                        "thick3": entry.get("thick3", ""),
                        "thick4": entry.get("thick4", ""),
                        "thick5": entry.get("thick5", ""),
                        "thick6": entry.get("thick6", ""),
                        "thick7": entry.get("thick7", ""),
                        "thick8": entry.get("thick8", ""),
                        "thickAverage": entry.get("thickAverage", ""),
                        "thickDiff": entry.get("thickDiff", ""),
                        "edgemmAB": entry.get("edgemmAB", ""),
                        "edgemmDC": entry.get("edgemmDC", ""),
                        "edgemmBC": entry.get("edgemmBC", ""),
                        "edgemmAD": entry.get("edgemmAD", ""),
                        "edgeperAB": entry.get("edgeperAB", ""),
                        "edgeperDC": entry.get("edgeperDC", ""),
                        "edgeperBC": entry.get("edgeperBC", ""),
                        "edgeperAD": entry.get("edgeperAD", ""),
                        "beforepressAB": entry.get("beforepressAB", ""),
                        "beforepressDC": entry.get("beforepressDC", ""),
                        "beforepressBC": entry.get("beforepressBC", ""),
                        "beforepressAD": entry.get("beforepressAD", ""),
                        "afterpressAB": entry.get("afterpressAB", ""),
                        "afterpressDC": entry.get("afterpressDC", ""),
                        "afterpressBC": entry.get("afterpressBC", ""),
                        "afterpressAD": entry.get("afterpressAD", ""),
                        "roughness": entry.get("roughness", ""),
                        "rzAvg": entry.get("rzAvg", ""),
                        "wzAvg": entry.get("wzAvg", ""),
                        "fzAvg": entry.get("fzAvg", ""),
                        "liftupleft": entry.get("liftupleft", ""),
                        "liftupright": entry.get("liftupright", ""),
                        "liftupAverage": entry.get("liftupAverage", ""),
                        "denweightair": entry.get("denweightair", None),
                        "denweightwater": entry.get("denweightwater", ""),
                        "denweightdry": entry.get("denweightdry", ""),
                        "densityCal": entry.get("densityCal", ""),
                        "waterAbspCal": entry.get("waterAbspCal", ""),
                        "moisturebefore": entry.get("moisturebefore", ""),
                        "moistureafter": entry.get("moistureafter", ""),
                        "moistureCal": entry.get("moistureCal", ""),
                        "dryL1": entry.get("dryL1", ""),
                        "dryL2": entry.get("dryL2", ""),
                        "dryCal": entry.get("dryCal", ""),
                        "screwamount": entry.get("screwamount", ""),
                        "screwbreak": entry.get("screwbreak", ""),
                        "leakage": entry.get("leakage", ""),
                        "laminaLoad": entry.get("laminaLoad", ""),
                        "laminaLamina": entry.get("laminaLamina", ""),
                        "laminatorn": entry.get("laminatorn", ""),
                        "hardpress": entry.get("hardpress", ""),
                        "harddepth": entry.get("harddepth", ""),
                        "hardness": entry.get("hardness", ""),
                        "thickness11": entry.get("thickness11", ""),
                        "thickness12": entry.get("thickness12", ""),
                        "thickness1Average": entry.get("thickness1Average", ""),
                        "loadPAR": entry.get("loadPAR", ""),
                        "usPAR": entry.get("usPAR", ""),
                        "thickness21": entry.get("thickness21", ""),
                        "thickness22": entry.get("thickness22", ""),
                        "thickness2Average": entry.get("thickness2Average", ""),
                        "loadPER": entry.get("loadPER", ""),
                        "usPER": entry.get("usPER", ""),
                        "usAverage": entry.get("usAverage", ""),
                        "isPAR": entry.get("isPAR", ""),
                        "isPER": entry.get("isPER", ""),
                        "result": entry.get("result", ""),
                        "note": entry.get("note", ""),
                        "lockpallet": entry.get("lockpallet", ""),
                        "amountlock": entry.get("amountlock", ""),
                        "symp": entry.get("symp", ""),
                        "status": entry.get("status", 0),
                        "shift": entry.get("shift", ""),
                    }
                )
                saved_count += 1

            except Exception as e:
                errors.append({key: str(e)})

        # Handle response
        if saved_count == len(data):
            return Response({'message': f'All {saved_count} entries saved successfully!'}, status=status.HTTP_201_CREATED)
        elif saved_count > 0:
            return Response({
                'message': f'{saved_count} entries saved successfully, but some entries failed.',
                'errors': errors
            }, status=status.HTTP_206_PARTIAL_CONTENT)
        else:
            return Response({'message': 'No entries saved.', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        


class get_spanLenexample(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            product = request.GET.get('pdname')

            queryset = Locklabspec.objects.filter(product_thai=product).values('span', 'lenexsample')

            if queryset.exists():
                value = [value for value in queryset[0].values()]
                print(value)
                return Response({'success': True, 'value': value})
            else:
                return Response({'success': True, 'value': []})

        except Exception as e:
            error_trace = traceback.format_exc()
            print("Error Traceback:", error_trace)
            return Response({'success': False, 'error': str(e), 'traceback': error_trace}, status=500)




class get_cloundDate(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            machine = request.GET.get('machine')

            queryset = ViewCloundlocklab.objects.filter(machine=machine).values()

            if queryset.exists():
                dates = [(entry['time'].split(' ')[0], entry['status']) for entry in queryset]
                unique_dates = list(set(dates))
                sorted_dates = sorted(unique_dates, key=lambda date: datetime.strptime(date[0], "%Y-%m-%d"), reverse=True)
                date_dict = {date: status for date, status in sorted_dates}
                # print(date_dict)
                return Response({'success': True, 'date': date_dict})
            else:
                return Response({'success': True, 'date': []})

        except Exception as e:
            error_trace = traceback.format_exc()
            print("Error Traceback:", error_trace)
            return Response({'success': False, 'error': str(e), 'traceback': error_trace}, status=500)
        
class get_cloundData(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            date = request.GET.get('date')

            queryset = ViewCloundlocklab.objects.filter(time__startswith=date).values()
            # print(queryset)
            if queryset.exists():
                grouped_data = {}
                for entry in queryset:
                    if 'time' in entry and entry['time']:
                        # Extract date part (YYYY-MM-DD)
                        date_key = entry['time'].split(' ')[0]
                        if date_key not in grouped_data:
                            grouped_data[date_key] = []
                        grouped_data[date_key].append(entry)

                sorted_data = {
                    date: sorted(entries, key=lambda x: x['caption'])
                    for date, entries in grouped_data.items()
                }
                return Response({'success': True, 'data': sorted_data})
            else:
                return Response({'success': True, 'data': []})

        except Exception as e:
            error_trace = traceback.format_exc()
            print("Error Traceback:", error_trace)
            return Response({'success': False, 'error': str(e), 'traceback': error_trace}, status=500)

class update_statusBoardData(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def post(self, request):
        rowkey = request.data[0]
        print(rowkey)

        for item in rowkey:
            try:
                LockLabHSBoardData.objects.update_or_create(
                    id=item['rowdataid'],
                    defaults={'status': item['status']}
                )
            except Exception as error:
                return Response({'message': 'Status Change Fail!', 'errors': str(error)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'All entries status changed!'}, status=status.HTTP_201_CREATED)
    

class get_cloundSelectDate(APIView):
    permission_classes = [PlannerPerm|PlantCoPerm| AdminPerm]

    @swagger_auto_schema()
    def get(self, request):
        try:
            machine = request.GET.get('machine')
            sdate = request.GET.get('startdate')
            edate = request.GET.get('enddate')
            # print(sdate, edate)

            queryset = ViewCloundlocklab.objects.filter(machine=machine).values()

            if queryset.exists():
                dates = [(entry['time'].split(' ')[0], entry['status']) for entry in queryset if sdate <= entry['time'].split(' ')[0] <= edate]
                unique_dates = list(set(dates))
                sorted_dates = sorted(unique_dates, key=lambda date: datetime.strptime(date[0], "%Y-%m-%d"), reverse=True)
                date_dict = {date: status for date, status in sorted_dates}
                # print(date_dict)
                return Response({'success': True, 'date': date_dict})
            else:
                return Response({'success': True, 'date': {}})

        except Exception as e:
            error_trace = traceback.format_exc()
            print("Error Traceback:", error_trace)
            return Response({'success': False, 'error': str(e), 'traceback': error_trace}, status=500)