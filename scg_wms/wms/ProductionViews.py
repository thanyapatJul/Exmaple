import sys

if sys.platform == "win32":
    from asyncio.windows_events import NULL
else:
    NULL = None  # or some other appropriate value for non-Windows platforms

from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import get_user_model, login, logout, authenticate
from rest_framework.authentication import SessionAuthentication
from rest_framework import routers, serializers, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from drf_yasg.utils import swagger_auto_schema
from rest_framework_bulk import BulkModelViewSet
from .models import *
from .serializers import *
from .permissions import *
# from .validations import *
from django.forms.models import model_to_dict
from django.db.models import OuterRef, Subquery, Max, ExpressionWrapper
from django.db.models import Max, Q, F, Sum, FloatField,When,Value


from datetime import datetime, timedelta
import os
import csv
import math
from collections import defaultdict
import random

def get_nowshift():
    current_datetime = datetime.now()
    if 0 <= current_datetime.hour < 8:
        result = "C"
    elif 8 <= current_datetime.hour < 16:
        result = "A"
    else:
        result = "B"
    return result

def searchInfo_Operator(employee_id_input):
    try:
        result = CustomUser.objects.get(employee_id=employee_id_input).first_name
    except:
        result = None
    return result

def searchInfo_WIP(zca_search):
    query = ItemMasterProductWIP.objects.filter(field_zca=zca_search).values()[0]
    return query

def searchInfo_FG(zca_search):
    query = ItemMasterProductFG.objects.filter(zca=zca_search).values()[0]
    return query

def wood_in_pallet(total_wood, wood_per_pallet, pallet_number):
    # คำนวณจำนวนไม้ที่เหลือหลังจากแบ่งเข้าพาเลตก่อนหน้า
    remaining_wood = total_wood - (wood_per_pallet * (pallet_number - 1))
    
    # ถ้าไม้ที่เหลือมากกว่าหรือเท่ากับจำนวนไม้ต่อพาเลต ให้คืนค่าว่าพาเลตนั้นเต็ม
    # ถ้าไม่เช่นนั้น คืนค่าไม้ที่เหลือในพาเลตนั้น
    return min(remaining_wood, wood_per_pallet) if remaining_wood > 0 else 0


class get_pisproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            date_sql = request.query_params.get('date')
            mc_sql = request.query_params.get('machine')
            shift_sql = request.query_params.get('shift')

            data_raw = list(ViewActiveplan.objects.filter(starttime=date_sql,machine=mc_sql,shift=shift_sql).values_list('materialcode','materialname','plancount','planname','starttime'))

            # added_data = []
            # try:
            #     for row in data_raw:
            #         row = list(row)
            #         planname = "TL" + "-" + mc_sql + "-" + row[4].replace("-", "") + "-" + shift_sql + "-" + row[3]
            #         row.append(planname)
            #         added_data.append(row)
            # except Exception as e:
            #     print("No SQL >>>> ",e)

            # data_raw = added_data

            #clear Null
            data = []
            for i in data_raw:
                if i[0] != None:
                    data.append(i)

            return Response({'success': True, 'data': data})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_zcawipproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            if mc_sql == "Lab":
                data = (ItemMasterProductWIP.objects.values_list('field_zca','field_name').distinct())
            else:
                data = (ItemMasterProductWIP.objects.filter(field_mc=mc_sql).values_list('field_zca','field_name'))


            # data = (ItemMasterProductWIP.objects.values_list('field_zca','field_name'))
            
            select_data = []
            for i in data:
                select_data.append({"value":i[0],"label":str(i[0])+" "+str(i[1])})
            
            return Response({'success': True, 'data':select_data,'data_list':data})
        except Exception as e:
            print("Error >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_zcawipwithdrawproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            if mc_sql == "Lab":
                data = (ItemMasterProductWIP.objects.values_list('field_zca','field_name','field_prodgroup','field_prodname').distinct())
            else:
                data = ItemMasterProductWIP.objects.filter().values_list('field_zca','field_name','field_prodgroup','field_prodname').distinct()

            select_data = []
            for i in data:
                i = list(i)

                try:
                    # select_balance = Tiger_StockBalance.objects.get(zca=i[0])
                    # i.append(select_balance.urstock)


                    latest_mapid_subquery = Map_management.objects.filter(
                        mapid=OuterRef('mapid'), 
                        level=OuterRef('level'), 
                        sub_column=OuterRef('sub_column')
                    ).exclude(map_approve = 2).order_by('-created_at').values('created_at')[:1]

                    queryset = Map_management.objects.annotate(latest_created_at = Subquery(latest_mapid_subquery)).filter(map_approve=1 ,created_at=F('latest_created_at'),zca_on=i[0]).values("zca_on","name_th","machine","qty","product_length","map_approve","lab")

                    instock_good = 0
                    instock_lab = 0
                    for pallet_count in queryset:
                        if pallet_count["lab"] == 1:
                            instock_good += pallet_count["qty"]
                        else:
                            instock_lab += pallet_count["qty"]

                    queryset_pw = ListWithdrawPlanProduction.objects.filter(zca_on=i[0],withdraw_keyin="success")
                    for j in queryset_pw:
                        if j.approve_withdraw == "success":
                            try:
                                if MapListWithdrawPlan.objects.get(listwithdraw_link=j).withdraw_success == 0:
                                    instock_good -= int(j.qty)
                            except Exception as e:
                                pass
                        else:
                            instock_good -= int(j.qty)

                    
                    i.append(instock_good)

                except Exception as e:
                    i.append(0)

                # i.append(999)
                # i.append(888)

                select_data.append({"value":i[0],"label":"[ "+str(i[2])+" ] "+str(i[0])+" "+str(i[1])+" (UR คงเหลือ: "+str(i[4])+" PC ) "})

            return Response({'success': True, 'data':select_data,'data_list':data})
        except Exception as e:
            print("Error >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_zcafgproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

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
        
class get_zcaallproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')

            variable_column = mc_sql + "_TL"
            variable_column = variable_column.lower()

            if mc_sql == "Lab":
                data = (ItemMasterProductFG.objects.values_list('zca','name').distinct())
            else:
                data = (ItemMasterProductFG.objects.filter(**{ variable_column: "1" }).values_list('zca','name'))

            select_data = []
            for i in data:
                select_data.append({"value":i[0],"label":str(i[0])+" "+str(i[1])})

            if mc_sql == "Lab":
                data = (ItemMasterProductWIP.objects.values_list('field_zca','field_name').distinct())
            else:
                data = (ItemMasterProductWIP.objects.filter(field_mc=mc_sql).values_list('field_zca','field_name'))

            # data = (ItemMasterProductWIP.objects.values_list('field_zca','field_name'))
            for i in data:
                select_data.append({"value":i[0],"label":str(i[0])+" "+str(i[1])})
            
            return Response({'success': True, 'data':select_data,'data_list':data})
            
        except Exception as e:
            print("Error >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_planproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            date_filter = request.query_params.getlist('date_search[]')
            shift_sql = request.query_params.get('shift')
            data = []
            start_date = datetime.strptime(date_sql, "%Y-%m-%d")
            # คำนวณวันที่ย้อนหลัง 7 วัน
            end_date = start_date - timedelta(days=7)
            queryset = PlanProduction.objects.exclude(pdplan_machine="Lab").filter(pdplan_machine=mc_sql, pdplan_date__range=[end_date, start_date],pdplan_delete="0")

            if shift_sql != "ALL" and shift_sql != None:
                queryset = queryset.filter(pdplan_shift=shift_sql)
            queryset = queryset.order_by('-id')

            for plan_production in queryset:
                items_good = list(ListFillPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                items_withdraw = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                
                for item in items_good:
                    items_pallet = list(ListFillTicketPalletProduction.objects.filter(fillplan_link=item["id"]).values())
                    item["palletticket_list"] = items_pallet
                    
                    item["pallet_ticket_blue"] = []
                    item["pallet_ticket_yellow"] = []
                    for i in items_pallet:
                        if i["ticket"] == "yellow":
                            item["pallet_ticket_yellow"].append(i["pallet_no"]-item["offset_pallet_no"]+1)
                        elif i["ticket"] == "blue":
                            item["pallet_ticket_blue"].append(i["pallet_no"]-item["offset_pallet_no"]+1)


                    item["operator_keyin_name"] = searchInfo_Operator(item["operator_keyin"])
                    item["operator_approve_name"] = searchInfo_Operator(item["operator_approve"])
                
                data.append({
                    "create_at": plan_production.created_at,
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "pdplan_operator": CustomUser.objects.get(employee_id=plan_production.pdplan_operator).first_name,
                    "items": items_good,
                    "items_withdraw": items_withdraw,
                })

            for i_index, i in enumerate(data):
                list_all = 0
                list_wait = 0
                list_keyin = 0
                list_approve = 0
                for j in data[i_index]["items"]:
                    list_all += 1
                    if j["fill_success"] == "success":
                        list_keyin += 1
                    else:
                        list_wait += 1
                for j in data[i_index]["items"]:
                    if (j["approve_fill"] == "success") and (j["fill_success"] == "success"):
                        list_approve += 1
                data[i_index]["list_all"] = list_all
                data[i_index]["list_wait"] = list_wait
                data[i_index]["list_keyin"] = list_keyin
                data[i_index]["list_approve"] = list_approve

            return Response({'success': True, 'data': data})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class get_editplanproduction(APIView):
    permission_classes = [AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            id = request.query_params.get('id')
            id_plan = Map_management.objects.filter(id=id).values("plan_link_id","action_type")
            data = []
            queryset = PlanProduction.objects.exclude(pdplan_machine="Lab").filter(id=id_plan[0]['plan_link_id'])
            queryset = queryset.order_by('-id')
            print('queryset',queryset)

            for plan_production in queryset:
                items_good = list(ListFillPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                items_withdraw = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                
                for item in items_good:
                    items_pallet = list(ListFillTicketPalletProduction.objects.filter(fillplan_link=item["id"]).values())
                    item["palletticket_list"] = items_pallet
                    
                    item["pallet_ticket_blue"] = []
                    item["pallet_ticket_yellow"] = []
                    for i in items_pallet:
                        if i["ticket"] == "yellow":
                            item["pallet_ticket_yellow"].append(i["pallet_no"]-item["offset_pallet_no"]+1)
                        elif i["ticket"] == "blue":
                            item["pallet_ticket_blue"].append(i["pallet_no"]-item["offset_pallet_no"]+1)


                    item["operator_keyin_name"] = searchInfo_Operator(item["operator_keyin"])
                    item["operator_approve_name"] = searchInfo_Operator(item["operator_approve"])
                
                data.append({
                    "create_at": plan_production.created_at,
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "pdplan_operator": CustomUser.objects.get(employee_id=plan_production.pdplan_operator).first_name,
                    "items": items_good,
                    "items_withdraw": items_withdraw,
                })

            for i_index, i in enumerate(data):
                list_all = 0
                list_wait = 0
                list_keyin = 0
                list_approve = 0
                for j in data[i_index]["items"]:
                    list_all += 1
                    if j["fill_success"] == "success":
                        list_keyin += 1
                    else:
                        list_wait += 1
                for j in data[i_index]["items"]:
                    if (j["approve_fill"] == "success") and (j["fill_success"] == "success"):
                        list_approve += 1
                data[i_index]["list_all"] = list_all
                data[i_index]["list_wait"] = list_wait
                data[i_index]["list_keyin"] = list_keyin
                data[i_index]["list_approve"] = list_approve

            return Response({'success': True, 'data': data , 'action_type':id_plan[0]['action_type']})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
             
class post_planproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        pdplan_machine = request.data.get('pdplan_machine')
        pdplan_date = datetime.strptime(request.data.get('pdplan_date'), "%Y-%m-%d").date()
        pdplan_shift  = request.data.get('pdplan_shift')
        pdlist_data = request.data.get('pdlist_data')
        pdplan_operator = request.user.employee_id
        
        PlanSQL = PlanProduction(
            pdplan_machine=pdplan_machine,
            pdplan_date=pdplan_date,
            pdplan_shift=pdplan_shift,
            pdplan_operator=pdplan_operator,
            pdplan_planapprove="0",
            pdplan_labapprove="1",
            pdplan_delete="0",
        )
        PlanSQL.save()

        for element in pdlist_data:
            try:
                query = list(ItemMasterProductWIP.objects.filter(field_zca=element[1]).values_list('field_zca','field_name','field_nameeng','field_pcspallet','field_lengthpallet','field_kgpcs')[0])
                type_select = "WIP"
            except Exception as e:
                query = list(ItemMasterProductFG.objects.filter(zca=element[1]).values_list('zca','name','nameen','pcpallet','size','kg')[0])
                size = query[4].split('x')[1]
                if size[-1] == "'" :
                    query[4] = float(size[0])*30.48
                else:
                    query[4] = size
                type_select = "FG"

            list_good = ListFillPlanProduction(
                machine=pdplan_machine,
                zca_on= query[0],
                name_th= query[1],
                name_en= query[2],
                product_type=type_select,
                pcsperpallet=query[3],
                product_length=query[4],
                kgpcs = query[5],
                status= "รอส่งยอด",
                plan_link=PlanSQL,

            )
            list_good.save()
            
            try:
                line=[]
                search_first = ProcessLock.objects.filter(field_zca=query[0]).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                index_temp = int(search_first["field_id"])
                index_first = int(search_first["field_id"])
                up=down=index_first
                if (search_first["field_source"] == "1")and(search_first["field_destination"] == "*"):
                    line.append(search_second)
                elif (search_first["field_source"] == "1*"):
                    pass
                # Middle WIP
                elif (search_first["field_source"] == None) and (search_first["field_destination"] == None):
                    # Go up until found  1 Null
                    search_second = ProcessLock.objects.filter(field_id=up).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                    line.append(search_second)
                    while(True) :
                        up -= 1
                        print('op',up)
                        search_second = ProcessLock.objects.filter(field_id=up).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                        line.append(search_second)
                        if search_second["field_destination"] == None and (search_second["field_source"] == '1' or search_second["field_source"] == '1*'):
                            break
                            
                    # Go down until found  _ *
                    while(True) :
                        down += 1
                        print('dwo',down)
                        search_second = ProcessLock.objects.filter(field_id=down).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                        line.append(search_second)
                        if search_second["field_destination"] == None and (search_second["field_source"] == '1' or search_second["field_source"] == '1*' ):
                            line.pop()
                            down -=1

                            break
                    
                elif (search_first["field_source"] == None) and (search_first["field_destination"] == '*'):
                        
                    search_second = ProcessLock.objects.filter(field_id=up).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                    line.append(search_second)
                    while(True) :
                        up -= 1
                        print('op',up)
                        search_second = ProcessLock.objects.filter(field_id=up).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                        line.append(search_second)
                        if search_second["field_destination"] == None and search_second["field_source"] == '1':
                            break
                        


                        
                search_second = ProcessLock.objects.filter(field_id=up).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                print('pree',line)
                if(up != index_temp)or (down!=index_temp):
                    try:

                        query = list(ItemMasterProductWIP.objects.filter(field_zca=search_second['field_zca']).values_list('field_zca','field_name','field_nameeng','field_pcspallet','field_lengthpallet','field_kgpcs')[0])
                        type_select = "WIP"
                        print('query',query)
                    except Exception as e:
                        query = list(ItemMasterProductFG.objects.filter(field_zca=search_second['field_zca']).values_list('zca','name','nameen','pcpallet','size','kg')[0])
                        print('query',query)
                        size = query[4].split('x')[1]
                        if size[-1] == "'" :
                            query[4] = float(size[0])*30.48
                        else:
                            query[4] = size
                        type_select = "FG"
                    
                    list_withdraw = ListWithdrawPlanProduction(
                        machine=pdplan_machine,
                        zca_on= query[0],
                        name_th= query[1],
                        name_en= query[2],
                        pcsperpallet=query[3],
                        product_length=query[4],
                        kgpcs = query[5],
                        status= "รอเบิก",
                        listfillplan_link = list_good,
                        plan_link=PlanSQL,

                    )

                    list_withdraw.save()


            except Exception as e:
                print('123',e)
                pass

        try:
            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class post_deleteFillplanProduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    def post(self, request, *args, **kwargs):
        try:
            edit_id = request.data.get('id_plan')
            item = ListFillPlanProduction.objects.get(id=int(edit_id))
            if item.fill_success == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูกส่งยอดอยู่"})
            elif item.approve_fill == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            else:
                item.delete_add = "Delete"
                # print(item.id)
                item.save()
                return Response({'success': True})
        except ListFillPlanProduction.DoesNotExist:
            return Response({'success': False, 'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class remove_planproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        data = request.data

        row_to_update = PlanProduction.objects.get(pk=data["id"])
        print(row_to_update)
        check_fill = ListFillPlanProduction.objects.filter(fill_success="success",plan_link=row_to_update)
        check_withdraw = ListWithdrawPlanProduction.objects.filter(withdraw_keyin="success",plan_link=row_to_update)

        if(len(check_fill) > 0):
            return Response({'success': False, "message":"มีการส่งยอดแล้วไม่สามารถลบได้"})
        if(len(check_withdraw) > 0):
            return Response({'success': False, "message":"มีการขอเบิกแล้วไม่สามารถลบได้"})
        
        row_to_update.pdplan_delete = "1"
        row_to_update.pdplan_delete_operator = request.user.employee_id
        row_to_update.pdplan_delete_datetime = datetime.now()
        row_to_update.save()
        return Response({'success': True})
    
class additem_planproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        data = request.data

        row_to_update = PlanProduction.objects.get(pk=data["id_plan"])

        try:
            query = list(ItemMasterProductWIP.objects.filter(field_zca=data["zca_add"]).values_list('field_zca','field_name','field_nameeng','field_pcspallet','field_lengthpallet','field_kgpcs')[0])
            type_select = "WIP"
        except Exception as e:
            query = list(ItemMasterProductFG.objects.filter(zca=data["zca_add"]).values_list('zca','name','nameen','pcpallet','size','kg')[0])
            size = query[4].split('x')[1]
            if size[-1] == "'" :
                query[4] = float(size[0])*30.48
            else:
                query[4] = size
            type_select = "FG"
        
        list_good = ListFillPlanProduction(
            machine=row_to_update.pdplan_machine,
            zca_on= query[0],
            name_th= query[1],
            name_en= query[2],
            product_type=type_select,
            pcsperpallet=query[3],
            product_length=query[4],
            kgpcs = query[5],
            status= "รอส่งยอด",
            plan_link=row_to_update,
        )
        list_good.save()
        
        try:
            search_first = ProcessLock.objects.filter(field_zca=query[0]).values('field_id','field_zca','field_name','field_source','field_destination')[0]
            index_temp = int(search_first["field_id"])
            index_first = int(search_first["field_id"])

            if (search_first["field_source"] == "1") or (search_first["field_source"] == "1*"):
                pass
            else:
                if (search_first["field_destination"] == "*"):
                    while(True):
                        index_first -= 1
                        search_second = ProcessLock.objects.filter(field_id=index_first).values('field_id','field_zca','field_name','field_source','field_destination')[0]
                        if search_second["field_destination"] != "*":
                            break
                else:
                    index_first -= 1
                    
            search_second = ProcessLock.objects.filter(field_id=index_first).values('field_id','field_zca','field_name','field_source','field_destination')[0]

            
            if(index_first != index_temp):
                try:
                    query = list(ItemMasterProductWIP.objects.filter(field_zca=search_second['field_zca']).values_list('field_zca','field_name','field_nameeng','field_pcspallet','field_lengthpallet','field_kgpcs')[0])
                    type_select = "WIP"
                except Exception as e:
                    query = list(ItemMasterProductFG.objects.filter(field_zca=search_second['field_zca']).values_list('zca','name','nameen','pcpallet','size','kg')[0])
                    size = query[4].split('x')[1]
                    if size[-1] == "'" :
                        query[4] = float(size[0])*30.48
                    else:
                        query[4] = size
                    type_select = "FG"

                list_withdraw = ListWithdrawPlanProduction(
                    machine=row_to_update.pdplan_machine,
                    zca_on= query[0],
                    name_th= query[1],
                    name_en= query[2],
                    status= "รอเบิก",
                    listfillplan_link = list_good,
                    plan_link=row_to_update,
                )
                list_withdraw.save()
        except Exception as g:
            pass

        # list_temp = TempListPlanProduction(
        #     machine=query[3],
        #     zca_on= query[0],
        #     name_th= query[1],
        #     name_en= query[2],
        #     plan_link=PlanSQL
        # )
        # list_temp.save()

        try:
            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_fillplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            element = request.data

            def test2_int(input):
                try:
                    return int(input)
                except:
                    return 0

            def test_int(input):
                try:
                    return int(input)
                except:
                    return None
                
            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None
            
            select_row = ListFillPlanProduction.objects.get(id=int(element["id"]))

            if select_row.approve_fill == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            
            select_row.product_date = test_year(element["product_date"])
            select_row.product_shift = element["product_shift"]

            select_row.qty_good = test_int(element["qty_good"])
            select_row.qty_loss = test_int(element["qty_loss"])
            select_row.qty_lab = test_int(element["qty_lab"])

            select_row.offset_pallet_no = test_int(element["offset_pallet_no"])

            select_row.ticket_qty_blue = test_int(element["ticket_qty_blue"])
            select_row.ticket_qty_yellow = test_int(element["ticket_qty_yellow"])
            select_row.ticket_problem_blue = element["ticket_problem_blue"]
            select_row.ticket_problem_yellow = element["ticket_problem_yellow"]

            select_row.send_date = test_year(element["send_date"])
            select_row.send_shift = element["send_shift"]

            select_row.fill_success = "success"
            select_row.operator_keyin = request.user.employee_id
            select_row.save()
            
            ListFillTicketPalletProduction.objects.filter(fillplan_link=select_row).delete()
            
            if (test2_int(element["ticket_qty_yellow"]) > 0):
                for row in sorted(element["pallet_ticket_yellow"]):
                    pallet_ticket = ListFillTicketPalletProduction(
                        machine = select_row.machine,
                        zca_on = select_row.zca_on,
                        name_th = select_row.name_th,
                        ticket = "yellow",
                        ticket_problem = element["ticket_problem_yellow"],
                        qty_ticket = int(select_row.pcsperpallet or 0),
                        pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                        fillplan_link = select_row
                    )
                    pallet_ticket.save()

            if (test2_int(element["ticket_qty_blue"]) > 0):
                for row in sorted(element["pallet_ticket_blue"]):
                    pallet_ticket = ListFillTicketPalletProduction(
                        machine = select_row.machine,
                        zca_on = select_row.zca_on,
                        name_th = select_row.name_th,
                        ticket = "blue",
                        ticket_problem = element["ticket_problem_blue"],
                        qty_ticket = int(select_row.pcsperpallet or 0),
                        pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                        fillplan_link = select_row
                    )
                    pallet_ticket.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def editmap_fillplan(element):
    def test2_int(input):
        try:
            return int(input)
        except:
            return 0

    def test_int(input):
        try:
            return int(input)
        except:
            return None
        
    def test_year(input):
        try:
            return datetime.strptime(input, "%Y-%m-%d").date()
        except:
            return None
    select_row_listfillplan = ListFillPlanProduction.objects.get(id=int(element["id"]))
    plankid = select_row_listfillplan.plan_link_id

    select_row_mapmangement = Map_management.objects.filter(plan_link_id=int(plankid))
    for i in range(len(select_row_mapmangement)):
        select_row_mapmangement[i].product_date = test_year(element["product_date"])
        select_row_mapmangement[i].product_shift = element["product_shift"]
        select_row_mapmangement[i].receive_date = test_year(element["send_date"])
        select_row_mapmangement[i].receive_shift = element["send_shift"]
        try:
            select_row_mapmangement[i].pallet_no = select_row_mapmangement[i].pallet_no + (test_int(element["offset_pallet_no"]) - select_row_listfillplan.offset_pallet_no)
        except:
            pass
        select_row_mapmangement[i].save()
    
    select_row_maplistfillpallet = MapListFillPallet.objects.filter(plan_link_id=int(plankid))
    for i in range(len(select_row_maplistfillpallet)):
        select_row_maplistfillpallet[i].product_date = test_year(element["product_date"])
        select_row_maplistfillpallet[i].product_shift = element["product_shift"]
        select_row_maplistfillpallet[i].receive_date = test_year(element["send_date"])
        select_row_maplistfillpallet[i].receive_shift = element["send_shift"]
        select_row_maplistfillpallet[i].pallet_no = select_row_maplistfillpallet[i].pallet_no + (test_int(element["offset_pallet_no"]) - select_row_listfillplan.offset_pallet_no)
        select_row_maplistfillpallet[i].save()

    select_row_listfillplan.product_date = test_year(element["product_date"])
    select_row_listfillplan.product_shift = element["product_shift"]
    select_row_listfillplan.qty_good = test_int(element["qty_good"])
    select_row_listfillplan.qty_loss = test_int(element["qty_loss"])
    select_row_listfillplan.qty_lab = test_int(element["qty_lab"])
    select_row_listfillplan.offset_pallet_no = test_int(element["offset_pallet_no"])
    select_row_listfillplan.ticket_qty_blue = test_int(element["ticket_qty_blue"])
    select_row_listfillplan.ticket_qty_yellow = test_int(element["ticket_qty_yellow"])
    select_row_listfillplan.ticket_problem_blue = element["ticket_problem_blue"]
    select_row_listfillplan.ticket_problem_yellow = element["ticket_problem_yellow"]
    select_row_listfillplan.send_date = test_year(element["send_date"])
    select_row_listfillplan.send_shift = element["send_shift"]
    # select_row_listfillplan.operator_keyin = request.user.employee_id
    select_row_listfillplan.save()
    
    ListFillTicketPalletProduction.objects.filter(fillplan_link=select_row_listfillplan).delete()
    
    if (test2_int(element["ticket_qty_yellow"]) > 0):
        for row in sorted(element["pallet_ticket_yellow"]):
            pallet_ticket = ListFillTicketPalletProduction(
                machine = select_row_listfillplan.machine,
                zca_on = select_row_listfillplan.zca_on,
                name_th = select_row_listfillplan.name_th,
                ticket = "yellow",
                ticket_problem = element["ticket_problem_yellow"],
                qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
                pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                fillplan_link = select_row_listfillplan
            )
            pallet_ticket.save()

    if (test2_int(element["ticket_qty_blue"]) > 0):
        for row in sorted(element["pallet_ticket_blue"]):
            pallet_ticket = ListFillTicketPalletProduction(
                machine = select_row_listfillplan.machine,
                zca_on = select_row_listfillplan.zca_on,
                name_th = select_row_listfillplan.name_th,
                ticket = "blue",
                ticket_problem = element["ticket_problem_blue"],
                qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
                pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                fillplan_link = select_row_listfillplan
            )
            pallet_ticket.save()

    select_row_planproduction = PlanProduction.objects.get(id=int(plankid))
    select_row_planproduction.pdplan_date = test_year(element["product_date"])
    select_row_planproduction.pdplan_shift = element["product_shift"]
    select_row_planproduction.status_edit = "1"
    select_row_planproduction.save()

    select_row_tiger = Tiger_GoodsReceive.objects.get(idmainfromwms=int(element["id"]))
    select_row_tiger.dateproductionz = test_year(element["product_date"])
    select_row_tiger.shiftproductionz = element["product_shift"]
    select_row_tiger.save()
    
    select_row_maplistfillplan = MapListFillPlan.objects.get(plan_link_id=int(plankid))
    select_row_maplistfillplan.product_date = test_year(element["product_date"])
    select_row_maplistfillplan.product_shift = element["product_shift"]
    select_row_maplistfillplan.receive_date = test_year(element["send_date"])
    select_row_maplistfillplan.receive_shift = element["send_shift"]
    select_row_maplistfillplan.save()

def editmap_withdrawplan(element):
    def test2_int(input):
        try:
            return int(input)
        except:
            return 0

    def test_int(input):
        try:
            return int(input)
        except:
            return None
        
    def test_year(input):
        try:
            return datetime.strptime(input, "%Y-%m-%d").date()
        except:
            return None
    select_row_listfillplan = ListFillPlanProduction.objects.get(id=int(element["id"]))
    plankid = select_row_listfillplan.plan_link_id

    select_row_mapmangement = Map_management.objects.filter(plan_link_id=int(plankid))
    for i in range(len(select_row_mapmangement)):
        select_row_mapmangement[i].product_date = test_year(element["product_date"])
        select_row_mapmangement[i].product_shift = element["product_shift"]
        select_row_mapmangement[i].receive_date = test_year(element["send_date"])
        select_row_mapmangement[i].receive_shift = element["send_shift"]
        select_row_mapmangement[i].pallet_no = select_row_mapmangement[i].pallet_no + (test_int(element["offset_pallet_no"]) - select_row_listfillplan.offset_pallet_no)
        select_row_mapmangement[i].save()
    
    select_row_maplistfillpallet = MapListFillPallet.objects.filter(plan_link_id=int(plankid))
    for i in range(len(select_row_maplistfillpallet)):
        select_row_maplistfillpallet[i].product_date = test_year(element["product_date"])
        select_row_maplistfillpallet[i].product_shift = element["product_shift"]
        select_row_maplistfillpallet[i].receive_date = test_year(element["send_date"])
        select_row_maplistfillpallet[i].receive_shift = element["send_shift"]
        select_row_maplistfillpallet[i].pallet_no = select_row_maplistfillpallet[i].pallet_no + (test_int(element["offset_pallet_no"]) - select_row_listfillplan.offset_pallet_no)
        select_row_maplistfillpallet[i].save()

    select_row_listfillplan.product_date = test_year(element["product_date"])
    select_row_listfillplan.product_shift = element["product_shift"]
    select_row_listfillplan.qty_good = test_int(element["qty_good"])
    select_row_listfillplan.qty_loss = test_int(element["qty_loss"])
    select_row_listfillplan.qty_lab = test_int(element["qty_lab"])
    select_row_listfillplan.offset_pallet_no = test_int(element["offset_pallet_no"])
    select_row_listfillplan.ticket_qty_blue = test_int(element["ticket_qty_blue"])
    select_row_listfillplan.ticket_qty_yellow = test_int(element["ticket_qty_yellow"])
    select_row_listfillplan.ticket_problem_blue = element["ticket_problem_blue"]
    select_row_listfillplan.ticket_problem_yellow = element["ticket_problem_yellow"]
    select_row_listfillplan.send_date = test_year(element["send_date"])
    select_row_listfillplan.send_shift = element["send_shift"]
    # select_row_listfillplan.operator_keyin = request.user.employee_id
    select_row_listfillplan.save()
    
    ListFillTicketPalletProduction.objects.filter(fillplan_link=select_row_listfillplan).delete()
    
    if (test2_int(element["ticket_qty_yellow"]) > 0):
        for row in sorted(element["pallet_ticket_yellow"]):
            pallet_ticket = ListFillTicketPalletProduction(
                machine = select_row_listfillplan.machine,
                zca_on = select_row_listfillplan.zca_on,
                name_th = select_row_listfillplan.name_th,
                ticket = "yellow",
                ticket_problem = element["ticket_problem_yellow"],
                qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
                pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                fillplan_link = select_row_listfillplan
            )
            pallet_ticket.save()

    if (test2_int(element["ticket_qty_blue"]) > 0):
        for row in sorted(element["pallet_ticket_blue"]):
            pallet_ticket = ListFillTicketPalletProduction(
                machine = select_row_listfillplan.machine,
                zca_on = select_row_listfillplan.zca_on,
                name_th = select_row_listfillplan.name_th,
                ticket = "blue",
                ticket_problem = element["ticket_problem_blue"],
                qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
                pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
                fillplan_link = select_row_listfillplan
            )
            pallet_ticket.save()

    select_row_planproduction = PlanProduction.objects.get(id=int(plankid))
    select_row_planproduction.pdplan_date = test_year(element["product_date"])
    select_row_planproduction.pdplan_shift = element["product_shift"]
    select_row_planproduction.save()

    select_row_tiger = Tiger_GoodsReceive.objects.get(idmainfromwms=int(element["id"]))
    select_row_tiger.dateproductionz = test_year(element["product_date"])
    select_row_tiger.shiftproductionz = element["product_shift"]
    select_row_tiger.save()
    
    select_row_maplistfillplan = MapListFillPlan.objects.get(plan_link_id=int(plankid))
    select_row_maplistfillplan.product_date = test_year(element["product_date"])
    select_row_maplistfillplan.product_shift = element["product_shift"]
    select_row_maplistfillplan.receive_date = test_year(element["send_date"])
    select_row_maplistfillplan.receive_shift = element["send_shift"]
    select_row_maplistfillplan.save()

class post_Admineditfillplanproduct(APIView):
    permission_classes = [AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            element = request.data
            def test2_int(input):
                try:
                    return int(input)
                except:
                    return 0

            def test_int(input):
                try:
                    return int(input)
                except:
                    return None
                
            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None
            
            if element["action_type"] == "fill" or element["action_type"] == "ticket" or element["action_type"] == "return" or element["action_type"] == "badfill" or element["action_type"] == "labreturn":
                try:
                    editmap_fillplan(element)
                except:
                    return Response({'success': False, 'error':"not finish plan"})
            elif element["action_type"] == "withdrawmap":
                # editmap_withdrawplan(element)
                pass
            else:
                print(element["action_type"])


            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class post_deleteAdmin_pallet(APIView):
    permission_classes = [PlannerPerm | AdminPerm | ManagerPerm | PISPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            data = request.data['params']


            select_idplan = Map_management.objects.filter(id=data['id']).values("plan_link_id")

            allpallet = Map_management.objects.filter(plan_link_id=select_idplan[0]['plan_link_id']).values()

            if select_idplan[0]['plan_link_id'] != None :
                for record in allpallet:

                    try:
                        select_warehouse_id = Warehouse.objects.get(id=int(record["warehouse_id"]))
                    except:
                        select_warehouse_id = None


                    map_management = Map_management(
                        warehouse=select_warehouse_id,
                        zone=record["zone"],
                        row=record.get("row"),
                        column=record.get("column"),
                        mapid=record.get("mapid"),
                        level=record.get("level"),
                        sub_column = record.get("sub_column"),
                        success=True,
                        map_approve = 0,
                        action_type='deletemap'
                    )

                    select_row_planproduction = PlanProduction.objects.get(id=int(select_idplan[0]['plan_link_id']))
                    select_row_planproduction.status_edit = "2"
                    select_row_planproduction.save()
                    # print(map_management.action_type)
                    map_management.save()
                return Response({'success': True}, status=status.HTTP_200_OK)
            else:
                return Response({'success': False, 'error':"ไม่มี plan นี้โปรด delete ในหน้า inventory"}, status=status.HTTP_200_OK)
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_AdminNewPlan(APIView):
    permission_classes = [AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            pdplan_machine = request.data.get('machine')
            pdplan_date = datetime.strptime(request.data.get('date'), "%d/%m/%Y").date()
            pdplan_shift  = request.data.get('shift')
            pdplan_operator = request.user.employee_id
            element = request.data
            def test2_int(input):
                try:
                    return int(input)
                except:
                    return 0

            def test_int(input):
                try:
                    return int(input)
                except:
                    return None
                
            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None
            


            select_row_listfillplan = ListFillPlanProduction.objects.get(id=int(element["id"]))
            plankid = select_row_listfillplan.plan_link_id

            select_row_listfillplan.delete_add = "Edit"
            # select_row_listfillplan.save()

            select_row_mapmangement = Map_management.objects.filter(plan_link_id=int(plankid))
            for i in range(len(select_row_mapmangement)):
                select_row_mapmangement[i].status_edit_admin = "edit"
                # select_row_mapmangement[i].save()

            select_row_maplistfillpallet = MapListFillPallet.objects.filter(plan_link_id=int(plankid))
            for i in range(len(select_row_maplistfillpallet)):
                select_row_maplistfillpallet[i].status_edit_admin = "edit"
                # select_row_maplistfillpallet[i].save()
            # select_row_listfillplan.operator_keyin = request.user.employee_id
            
            # ListFillTicketPalletProduction.objects.filter(fillplan_link=select_row_listfillplan).delete()
            
            # if (test2_int(element["ticket_qty_yellow"]) > 0):
            #     for row in sorted(element["pallet_ticket_yellow"]):
            #         pallet_ticket = ListFillTicketPalletProduction(
            #             machine = select_row_listfillplan.machine,
            #             zca_on = select_row_listfillplan.zca_on,
            #             name_th = select_row_listfillplan.name_th,
            #             ticket = "yellow",
            #             ticket_problem = element["ticket_problem_yellow"],
            #             qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
            #             pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
            #             fillplan_link = select_row_listfillplan
            #         )
            #         # pallet_ticket.save()

            # if (test2_int(element["ticket_qty_blue"]) > 0):
            #     for row in sorted(element["pallet_ticket_blue"]):
            #         pallet_ticket = ListFillTicketPalletProduction(
            #             machine = select_row_listfillplan.machine,
            #             zca_on = select_row_listfillplan.zca_on,
            #             name_th = select_row_listfillplan.name_th,
            #             ticket = "blue",
            #             ticket_problem = element["ticket_problem_blue"],
            #             qty_ticket = int(select_row_listfillplan.pcsperpallet or 0),
            #             pallet_no = int(row)-1+test_int(element["offset_pallet_no"]),
            #             fillplan_link = select_row_listfillplan
            #         )
            #         # pallet_ticket.save()

            select_row_planproduction = PlanProduction.objects.get(id=int(plankid))
            select_row_planproduction.status_edit_newplan = "edited"
            # select_row_planproduction.save()

            select_row_tiger = Tiger_GoodsReceive.objects.get(idmainfromwms=int(element["id"]))
            
            select_row_maplistfillplan = MapListFillPlan.objects.get(plan_link_id=int(plankid))
            select_row_maplistfillplan.status_edit_admin = "edited"

            # newplan = PlanProduction(
            #     pdplan_machine=pdplan_machine,
            #     pdplan_date=pdplan_date,
            #     pdplan_shift=pdplan_shift,
            #     pdplan_operator=pdplan_operator,
            #     pdplan_planapprove="0",
            #     pdplan_labapprove="1",
            #     pdplan_delete="0",
            # )
            # newplan.save()
            # newplan_id = newplan.id

            # list_good = ListFillPlanProduction(
            #     machine=pdplan_machine,
            #     zca_on= query[0],
            #     name_th= query[1],
            #     name_en= query[2],
            #     product_type=type_select,
            #     pcsperpallet=query[3],
            #     product_length=query[4],
            #     kgpcs = query[5],
            #     status= "รอส่งยอด",
            #     plan_link=newplan,
            # )

            return Response({'success': True , 'newid':newplan_id})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class post_fillplandeleteproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        edit_id = request.data.get('id_plan')

        select_row = ListFillPlanProduction.objects.get(id=int(edit_id))
        if select_row.withdraw_keyin == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูกส่งเบิกอยู่"})
        elif select_row.approve_withdraw == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.delete_add = "Delete"
            select_row.save()
            return Response({'success': True})
        
class post_edittimefillplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        def test_int(input):
            try:
                return int(input)
            except:
                return None
                
        def test_year(input):
            try:
                return datetime.strptime(input, "%Y-%m-%d").date()
            except:
                return None

        element = request.data
        select_row = ListFillPlanProduction.objects.get(id=int(element["id"]))

        if select_row.approve_fill == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        
        select_row.send_date = test_year(element["input_date"])
        select_row.send_shift = element["input_shift"]
        
        select_row.save()
        return Response({'success': True, "message":"บันทึกข้อมูลเรียบร้อย"})

     
class post_editfillplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        element = request.data
        select_row = ListFillPlanProduction.objects.get(id=int(element["id"]))

        if select_row.approve_fill == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.fill_success = None
            select_row.save()
            return Response({'success': True, "message":"แก้ไขข้อมูล"})
    
def get_withdraw_plan_data(mc_sql, date_sql, shift_sql):
    try:
        data = []
        start_date = datetime.strptime(date_sql, "%Y-%m-%d")
        end_date = start_date - timedelta(days=7)
        queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql, pdplan_date__range=[end_date, start_date], pdplan_delete="0")
        if shift_sql != "ALL" and shift_sql is not None:
            queryset = queryset.filter(pdplan_shift=shift_sql)
        queryset = queryset.order_by('-id')

        for plan_production in queryset:
                items_listview = list(ListFillPlanProduction.objects.filter(plan_link=plan_production).exclude(status__in=["Delete"]).values())
                items = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                product_source_zca = []
                for i in items:
                    i["operator_keyin_name"] = searchInfo_Operator(i["operator_keyin"])
                    i["operator_approve_name"] = searchInfo_Operator(i["operator_approve"])
                    try:
                        query_search = ItemMasterProductWIP.objects.filter(field_zca=i["zca_on"]).values('field_zca','field_name','field_nameeng','field_mc','pcsperpallet')[0]
                        type_select = "WIP"
                        i["pcperpallet"] = int(query_search['pcsperpallet'])
                    except:
                        query_search = ItemMasterProductFG.objects.filter(zca=i["zca_on"]).values('zca','name','nameen','pcpallet')[0]
                        type_select = "FG"
                        i["pcperpallet"] = int(query_search['pcpallet'])

                    try:
                        select_row = ListFillPlanProduction.objects.get(id=int(i['listfillplan_link_id']))
                        i["source_zca"] = select_row.zca_on
                        i["source_name"] = select_row.name_th
                        product_source_zca.append(i["source_zca"])
                    except:
                        pass

                    try:
                        # select_balance = Tiger_StockBalance.objects.get(zca=i["zca_on"])
                        # i["instock_good"] = select_balance.urstock
                        # i["instock_lab"] = select_balance.block

                        latest_mapid_subquery = Map_management.objects.filter(
                            mapid=OuterRef('mapid'), 
                            level=OuterRef('level'), 
                            sub_column=OuterRef('sub_column')
                        ).exclude(map_approve = 2).order_by('-created_at').values('created_at')[:1]

                        queryset_map = Map_management.objects.annotate(latest_created_at = Subquery(latest_mapid_subquery)).filter(map_approve=1 ,created_at=F('latest_created_at'),zca_on=i["zca_on"]  ).values("zca_on","name_th","machine","qty","product_length","map_approve","lab")

                        i["instock_good"] = 0
                        i["instock_lab"] = 0
                        for pallet_count in queryset_map:
                            if pallet_count["lab"] == 1:
                                i["instock_good"] += pallet_count["qty"]
                            else:
                                i["instock_lab"] += pallet_count["qty"]

                        queryset_pw = ListWithdrawPlanProduction.objects.filter(zca_on=i["zca_on"],withdraw_keyin="success")
                        for j in queryset_pw:

                            if j.approve_withdraw == "success":
                                try:
                                    if MapListWithdrawPlan.objects.get(listwithdraw_link=j).withdraw_success == 0:

                                        i["instock_good"] -= int(j.qty)
                                except Exception as e:

                                    pass
                            else:
                                i["instock_good"] -= int(j.qty)

                        
                        

                    except Exception as e:
                        print("error instock>>>",e)
                        i["instock_good"] = 0
                        i["instock_lab"] = 0
                    
                    try:
                        maplist_query = MapListWithdrawPlan.objects.get(listwithdraw_link=int(i["id"]))
                        forklift_query = list(Forklift_Worklist.objects.filter(maplistwithdrawplan_link=int(maplist_query.id)).values())
                        success = 0
                        i["forklift_total"] = len(forklift_query)
                        for work in forklift_query:
                            if work["forklift_success"] == True:
                                success += 1
                        i["forklift_success"] = success
                        i["forklift_list"] = forklift_query
                    except Exception as e:
                        i["forklift_total"] = 0
                        i["forklift_success"] = 0
                        i["forklift_list"] = []
                    
                    try:
                        qty_send_query = list(maplist_query.values("qty"))
                        total_sum = 0
                        for item_qty in qty_send_query:
                            total_sum += item_qty["qty"]
                        i["qtysend"]= total_sum
                    except:
                        i["qtysend"] = 0


                for i in items_listview:
                    if i["zca_on"] in product_source_zca:
                        i["have_withdraw"] = 1
                    else:
                        i["have_withdraw"] = 0

                withdraw_add_num = len(items_listview) - len(items)
                data.append({
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "withdraw_add_num": withdraw_add_num,
                    "items": items,
                    "items_listview": items_listview,
                })
            
            # Your existing logic for processing each plan_production
            # Append data to the 'data' list
        
        # Your existing logic for calculating additional fields
        for i_index, i in enumerate(data):
                list_all = 0
                list_wait = 0
                list_keyin = 0
                list_approve = 0
                for j in data[i_index]["items"]:
                    list_all += 1
                    if j["withdraw_keyin"] == "success":
                        list_keyin += 1
                    else:
                        list_wait += 1
                for j in data[i_index]["items"]:
                    if (j["approve_withdraw"] == "success") and (j["withdraw_keyin"] == "success"):
                        list_approve += 1
                data[i_index]["list_all"] = list_all
                data[i_index]["list_wait"] = list_wait
                data[i_index]["list_keyin"] = list_keyin
                data[i_index]["list_approve"] = list_approve

        return {'success': True, 'data': data}
    except Exception as e:
        return {'success': False, 'error': str(e)}

class get_withdrawplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]
    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:

            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            shift_sql = request.query_params.get('shift')

            response_data = get_withdraw_plan_data(mc_sql, date_sql, shift_sql)
            return Response(response_data)
        except Exception as e:
            print("ERROR >>>", e)
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_withdrawplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            element = request.data

            def test_int(input):
                try:
                    return int(input)
                except:
                    return None
                
            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row = ListWithdrawPlanProduction.objects.get(id=int(element["sqlindex"]))
            if select_row.approve_withdraw == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            select_row.qty = test_int(element["qty"])
            select_row.note_production = element["note_production"]
            select_row.receive_date = test_year(element["receive_date"])
            select_row.receive_shift = element["receive_shift"]
            select_row.withdraw_keyin = "success"
            select_row.operator_keyin = request.user.employee_id
            select_row.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_withdrawaddplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            data = request.data.get('id_plan')
            data_zca = request.data.get('zca_add')

            query = ItemMasterProductWIP.objects.filter(field_zca=data_zca).values_list('field_zca','field_name','field_nameeng','field_mc')[0]

            plan_to_link = PlanProduction.objects.get(pk=data)

            list_withdraw = ListWithdrawPlanProduction(
                            machine=plan_to_link.pdplan_machine,
                            zca_on=query[0],
                            name_th=query[1],
                            name_en=query[2],
                            status= "รอเบิก",
                            plan_link=plan_to_link
                        )
            list_withdraw.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_withdraweditplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        edit_id = request.data.get('id_plan')

        select_row = ListWithdrawPlanProduction.objects.get(id=int(edit_id))

        if select_row.approve_withdraw == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.withdraw_keyin = None
            select_row.save()
            return Response({'success': True})
        
class post_withdrawdeleteplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        edit_id = request.data.get('id_plan')
        select_row = ListWithdrawPlanProduction.objects.get(id=int(edit_id))

        if select_row.withdraw_keyin == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูกส่งเบิกอยู่"})
        elif select_row.approve_withdraw == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.delete_add = "Delete"
            select_row.save()
            return Response({'success': True})
    
class get_statmachine(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

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

class get_dontsendfill(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            type_sql = request.query_params.get('type')
            if type_sql == "fill":
                search = DontsendData.objects.filter(machine=mc_sql, date=datetime.now(),shift=get_nowshift(), fill="yes")
            else:
                search = DontsendData.objects.filter(machine=mc_sql, date=datetime.now(),shift=get_nowshift(), withdraw="yes")
            if len(search) == 0:
                return Response({'success': True,'data':False})

            return Response({'success': True,'data':True})
        except Exception as e:
            print("Error: >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class post_dontsendfill(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            request_input = request.data
            
            if request_input["type"] == "fill":
                DontsendSQL = DontsendData(
                    machine=request_input["machine"],
                    date= datetime.now(),
                    shift=get_nowshift(),
                    fill="yes",
                    operator=request.user.employee_id,
                )
                DontsendSQL.save()
            elif request_input["type"] == "withdraw":
                DontsendSQL = DontsendData(
                    machine=request_input["machine"],
                    date= datetime.now(),
                    shift=get_nowshift(),
                    withdraw="yes",
                    operator=request.user.employee_id,
                )
                DontsendSQL.save()

            return Response({'success': True})
        except Exception as e:
            print("Error: >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class get_returnplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # try:
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            shift_sql = request.query_params.get('shift')
            data = []
            plan = []

            start_date = datetime.strptime(date_sql, "%Y-%m-%d")
            # คำนวณวันที่ย้อนหลัง 7 วัน
            end_date = start_date - timedelta(days=7)

            queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql,pdplan_delete="0", pdplan_date__range=[end_date, start_date])
            if shift_sql != "ALL" and shift_sql != None:
                queryset = queryset.filter(pdplan_shift=shift_sql)
            queryset = queryset.order_by('-id')

            for plan_production in queryset:
                query_planwithdraw_plan = ListWithdrawPlanProduction.objects.filter(plan_link=plan_production,approve_withdraw="success").values()
                for plan_withdraw in query_planwithdraw_plan:
                    plan_withdraw["operator_keyin_name"] = searchInfo_Operator(plan_withdraw["operator_keyin"])
                    plan_withdraw["operator_approve_name"] = searchInfo_Operator(plan_withdraw["operator_approve"])
                    query_planwithdraw = list(MapListWithdrawPallet.objects.filter(listwithdraw_link=plan_withdraw["id"]).values("id","zca_on","product_date","product_shift","pallet_no","qty","pcsperpallet"))

                    if len(query_planwithdraw) == 0:
                        continue

                    # Initialize a dictionary to hold the grouped data
                    grouped_data = defaultdict(lambda: defaultdict(list))
                    # Iterate over each item in the data list
                    for item in query_planwithdraw:
                        try:
                            plan_withdraw["section"] = searchInfo_WIP(item["zca_on"])['field_type']
                            plan_withdraw["brand"] = searchInfo_WIP(item["zca_on"])['brand']
                            plan_withdraw["type"] = "WIP"
                        except:
                            plan_withdraw["section"] = searchInfo_FG(item["zca_on"])
                            plan_withdraw["brand"] = searchInfo_WIP(item["zca_on"])['brand']
                            plan_withdraw["type"] = "FG"
                        try:
                            select_pallet = ListReturnPalletProduction.objects.get(maplistwithdrawpallet_link=int(item["id"]))
                        except Exception as e:
                            item["return_pallet"] = 0
                        else:
                            item["qty"] = select_pallet.qty
                            if(select_pallet.return_type == "good"):
                                item["return_pallet"] = 1
                            else:
                                item["return_pallet"] = 2

                        # Use the 'receive_date' and 'receive_shift' to group the items
                        grouped_data[item['product_date']][item['product_shift']].append(item)

                    # Now, transform the grouped data into the desired list format
                    grouped_list = []
                    for date, shifts in grouped_data.items():
                        for shift, pallets in shifts.items():
                            grouped_list.append({
                                "product_date": date,
                                "product_shift": shift,
                                "total_pallets": len(pallets),
                                "pallets": sorted(pallets, key=lambda d: d['pallet_no']),
                            })

                    try: 
                        select_plan = ListReturnPlanProduction.objects.get(withdrawplan_link=int(plan_withdraw["id"]))
                        
                        select_note = ListReturnPlanNoteProduction.objects.filter(returnplan_link=select_plan).values()
                        note_good = []
                        note_bad = []
                        for note in select_note:
                            if note["type"] == "good":
                                note_good.append({"value":note["message"],"label":note["message"]})
                            elif note["type"] == "bad":
                                note_bad.append({"value":note["message"],"label":note["message"]})

                        total_qty = 0
                        for i in query_planwithdraw:
                            total_qty += i["qty"]
                        plan.append({
                            "zca_on": plan_withdraw["zca_on"],
                            "name_th": plan_withdraw["name_th"],
                            "machine": select_plan.product_machine,
                            "return_date": select_plan.return_date,
                            "return_shift": select_plan.return_shift,
                            "note_production": select_plan.note_production,
                            "note_planner": select_plan.note_planner,
                            "section":plan_withdraw["section"],
                            "type":plan_withdraw["type"],
                            "brand":plan_withdraw["brand"],
                            "note_good": note_good,
                            "note_bad": note_bad,

                            "return_approve": select_plan.return_approve,

                            "return_keyin": select_plan.return_keyin,

                            "operator_keyin_name": searchInfo_Operator(select_plan.operator_keyin),
                            "operator_approve_name": searchInfo_Operator(select_plan.operator_approve),
                            
                            "total_allpallets" : len(query_planwithdraw),
                            "total_allqty" : total_qty,
                            "planwithdraw": plan_withdraw["id"],
                            "items": grouped_list,
                        })
                    except Exception as e:
                        print(e)

                        total_qty = 0
                        for i in query_planwithdraw:
                            total_qty += i["qty"]
                        plan.append({
                            "zca_on": plan_withdraw["zca_on"],
                            "name_th": plan_withdraw["name_th"],
                            "machine": plan_withdraw["machine"],
                            "section":plan_withdraw["section"],
                            "brand":plan_withdraw["brand"],
                            "type":plan_withdraw["type"],
                            "return_date": None,
                            "return_shift": None,
                            "note_production": None,
                            "note_planner": None,
                            "note_good": [],
                            "note_bad": [],
                            "return_approve": None,
                            "return_keyin": None,
                            "total_allpallets" : len(query_planwithdraw),
                            "total_allqty" : total_qty,
                            "planwithdraw": plan_withdraw["id"],
                            "items": grouped_list,
                        })

                    # plan.append({
                    #     "zca_on": plan_withdraw.zca_on,
                    #     "name_th": plan_withdraw.name_th,
                    #     "machine": plan_withdraw.machine,
                    #     "return_date": select_plan.return_date,
                    #     "return_shift": select_plan.return_shift,
                        
                    #     "total_allpallets" : len(query_planwithdraw),
                    #     "planwithdraw": plan_withdraw.id,
                    #     "items": grouped_list,
                    # })
                    
                data.append({
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "items": plan,
                })
                plan = []

            return Response({'success': True, 'data': data})
        # except Exception as e:
        #     print("ERROR >>>",e)
        #     return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_returnplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            mc = request.data.get('mc')
            data = request.data.get('data')
            planwithdraw_id = request.data.get('planwithdraw')

            return_date_input = request.data.get('dateinput')
            return_shift_input = request.data.get('shiftinput')
            note_production = request.data.get('noteproduction')
            note_good = request.data.get('notegood')
            note_bad = request.data.get('notebad')

            status_summit = request.data.get('submit')

            request.data

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            sorted_data = sorted(data, key=lambda x: x['return_status'])

            try:
                return_plan = ListReturnPlanProduction.objects.get(withdrawplan_link=int(planwithdraw_id))
                select_note = ListReturnPlanNoteProduction.objects.filter(returnplan_link=return_plan).delete()
                for message in note_good:
                    message_row = ListReturnPlanNoteProduction(returnplan_link=return_plan,type="good",message=message["value"]).save()
                for message in note_bad:
                    message_row = ListReturnPlanNoteProduction(returnplan_link=return_plan,type="bad",message=message["value"]).save()

                if return_plan.return_approve == "success":
                    return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
                withdrawplan = return_plan.withdrawplan_link
                if status_summit == "reject":
                    return_plan.return_keyin = None
                    return_plan.operator_keyin = request.user.employee_id
                    return_plan.save()
                    return Response({'success': True})
                elif status_summit == "success":
                    return_plan.return_keyin = "success"
                    return_plan.operator_keyin = request.user.employee_id
                    return_plan.save()
            except:
                withdrawplan = ListWithdrawPlanProduction.objects.get(id=int(planwithdraw_id))
                query = ItemMasterProductWIP.objects.filter(field_zca=withdrawplan.zca_on).values_list('field_zca','field_name','field_nameeng','field_mc')[0]
                return_plan = ListReturnPlanProduction(
                    return_machine=mc,
                    product_machine=query[3],
                    zca_on=withdrawplan.zca_on,
                    name_th=withdrawplan.name_th,
                    name_en=withdrawplan.name_en,
                    receive_date=withdrawplan.receive_date,
                    receive_shift=withdrawplan.receive_shift,
                    return_date=return_date_input,
                    return_shift=return_shift_input,
                    withdrawplan_link=withdrawplan,
                    return_keyin = "success",
                    operator_keyin = request.user.employee_id,
                    plan_link = withdrawplan.plan_link
                )
                return_plan.save()

                for message in note_good:
                    message_row = ListReturnPlanNoteProduction(returnplan_link=return_plan,type="good",message=message["value"]).save()
                for message in note_bad:
                    message_row = ListReturnPlanNoteProduction(returnplan_link=return_plan,type="bad",message=message["value"]).save()

            query = ItemMasterProductWIP.objects.filter(field_zca=withdrawplan.zca_on).values_list('field_zca','field_name','field_nameeng','field_mc')[0]
            
            ListReturnPalletProduction.objects.filter(returnplan_link=return_plan).delete()
            
            total_pcs = 0
            total_pcs_good = 0
            total_pcs_bad = 0
            
            for element in sorted_data:
                select_row = MapListWithdrawPallet.objects.get(id=int(element["sqlindex"]))

                if element["return_status"] == 1 :
                    return_type_select = "good"
                elif element["return_status"] == 2 :
                    return_type_select = "bad"
                elif element["return_status"] == 0 :
                    continue
                return_pallet = ListReturnPalletProduction(
                    product_machine = query[3],
                    zca_on = select_row.zca_on,
                    name_th = select_row.name_th,
                    name_en = select_row.name_en,
                    product_type = select_row.product_type,
                    product_date = select_row.product_date,
                    product_shift = select_row.product_shift,
                    qty = element["qty"],
                    pcsperpallet = select_row.pcsperpallet,
                    product_length = select_row.product_length,
                    kgpcs = select_row.kgpcs,
                    ton = select_row.ton,
                    receive_date = select_row.send_date,
                    receive_shift = select_row.send_shift,

                    pallet_no = select_row.pallet_no,

                    listfillplan_link = select_row.listgood_link,
                    plan_link = withdrawplan.plan_link,

                    withdrawplan_link=withdrawplan,
                    returnplan_link=return_plan,

                    return_type=return_type_select,
                    return_machine=mc,

                    maplistwithdrawpallet_link=select_row
                )
                return_pallet.save()

                if return_type_select == "good":
                    total_pcs_good += element["qty"]
                elif return_type_select == "bad":
                    total_pcs_bad += element["qty"]

            return_plan.return_machine = mc
            return_plan.return_date = test_year(return_date_input)
            return_plan.return_shift = return_shift_input

            return_plan.qty_good = total_pcs_good
            # return_plan.qty_good_format = 
            return_plan.qty_bad = total_pcs_bad
            # return_plan.qty_bad_format = 
            return_plan.note_production = note_production

            return_plan.save()


            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_ticketplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            shift_sql = request.query_params.get('shift')
            data = []
            plan = []

            start_date = datetime.strptime(date_sql, "%Y-%m-%d")
            # คำนวณวันที่ย้อนหลัง 7 วัน
            end_date = start_date - timedelta(days=7)
            queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql, pdplan_date__range=[end_date, start_date],pdplan_delete="0")

            # queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql,pdplan_delete="0", pdplan_date=date_sql)
            if shift_sql != "ALL" and shift_sql != None:
                queryset = queryset.filter(pdplan_shift=shift_sql)
            queryset = queryset.order_by('-id')

            for plan_production in queryset:
                query_planticketplan = ListFillPlanProduction.objects.filter(plan_link=plan_production,approve_fill="success").filter(
                        Q(ticket_qty_yellow__isnull=False, ticket_qty_yellow__gt=0) | 
                        Q(ticket_qty_blue__isnull=False, ticket_qty_blue__gt=0)
                    ).values()
                for plan_fill in query_planticketplan:
                    plan_fill["operator_keyin_name"] = searchInfo_Operator(plan_fill["operator_keyin"])
                    plan_fill["operator_approve_name"] = searchInfo_Operator(plan_fill["operator_approve"])

                    query_palletticket = list(ListFillTicketPalletProduction.objects.filter(fillplan_link=plan_fill["id"]).values())
                    plan_fill["total_allpallets"] = len(query_palletticket)
                    plan_fill["pallets"] = query_palletticket
                    
                    for pallet in plan_fill["pallets"]: #เพื่อใช้ให้ Frontend ทำการเลือกไม้
                            pallet["select"] = 0
                    
                    # #ทำการแยก ตั๋วเหลือง, ตั๋วฟ้า และรวมแผ่นทั้งหมด
                    # pallet_yellow = []
                    # pallet_blue = []
                    # total_qty = 0
                    # for pallet in query_palletticket:
                    #     pallet["select"] = 0 #เพื่อใช้ให้ Frontend ทำการเลือกไม้
                    #     if pallet["ticket"] == "blue":
                    #         pallet_blue.append(pallet)
                    #     elif pallet["ticket"] == "yellow":
                    #         pallet_yellow.append(pallet)
                    #     total_qty += pallet["qty_ticket"]


                    # plan_fill["total_pallet"] = len(query_palletticket)
                    # plan_fill["total_qty"] = total_qty
                    # plan_fill["pallet_blue"] = pallet_blue
                    # plan_fill["pallet_yellow"] = pallet_yellow






                    #เพื่อหา Plan ที่ส่งคืนแล้ว
                    query_planticket = list(ListTicketPlanProduction.objects.filter(fillplan_link=plan_fill["id"]).values())
                    plan_fill["planpallet"] = query_planticket
                    for k in plan_fill["planpallet"]:
                        k["operator_keyin_name"] = searchInfo_Operator(k["operator_keyin"])
                        k["operator_approve_name"] = searchInfo_Operator(k["operator_approve"])
                    for i in plan_fill["planpallet"]:
                        query_palletticket_plan = list(ListFillTicketPalletProduction.objects.filter(fillplan_link=plan_fill["id"],fillticketreturnplan_link=i["id"]).values())
                        i["pallets"] = query_palletticket_plan
                    plan.append(plan_fill)
                    
                data.append({
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "items": plan,
                })
                plan = []

            return Response({'success': True, 'data': data})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_ticketplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            mc = request.data.get('mc')
            data = request.data.get('data')
            planticket_id = request.data.get('planticket_id')
            return_date_input = request.data.get('dateinput')
            return_shift_input = request.data.get('shiftinput')
            note_production = request.data.get('note_production')
            status_summit = request.data.get('submit')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row = ListFillPlanProduction.objects.get(id=planticket_id)

            select_ticketplan = ListTicketPlanProduction(
                machine = select_row.machine,
                zca_on = select_row.zca_on,
                name_th = select_row.name_th,
                name_en = select_row.name_en,
                product_type = select_row.product_type,
                product_date = select_row.product_date,
                product_shift = select_row.product_shift,
                send_date = test_year(return_date_input),
                send_shift = return_shift_input,
                note_production = note_production,

                pcsperpallet = select_row.pcsperpallet,
                product_length = select_row.product_length,
                kgpcs = select_row.kgpcs,

                plan_link = select_row.plan_link,
                fillplan_link = select_row,

                fill_success = "success",
                operator_keyin = request.user.employee_id,
                
            )
            for pallet_data in data:
                select_pallet = ListFillTicketPalletProduction.objects.get(id=pallet_data["sqlindex"])
                if select_pallet.fillticketreturnplan_link:
                    return Response({"success": False, "message":"Pallet ที่ " + str(select_pallet.pallet_no) + " ถูกส่งคัดแล้ว"})

            select_ticketplan.save()
            

            total_wood = 0
            for pallet_data in data:
                select_pallet = ListFillTicketPalletProduction.objects.get(id=pallet_data["sqlindex"])
                try:
                    qty_ticket_int = int(pallet_data["qty_ticket"])
                except:
                    qty_ticket_int = 0
                if qty_ticket_int > 0:
                    select_pallet.ticket_return_status = pallet_data["ticket_return_status"]
                    select_pallet.qty_ticket = qty_ticket_int
                else:
                    select_pallet.ticket_return_status = 0
                    select_pallet.qty_ticket = 0

                select_pallet.fillticketreturnplan_link = select_ticketplan
                select_pallet.save()
                if(select_pallet.ticket_return_status == 1):
                    total_wood += int(select_pallet.qty_ticket)

            select_ticketplan.ticket_qty = total_wood
            select_ticketplan.save()



            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_deleteticketplansendproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            planticket_id = request.data.get('planticket_id')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row_plan = ListTicketPlanProduction.objects.get(id=int(planticket_id))
            if select_row_plan.approve_fill:
                    return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            select_row_pallet = ListFillTicketPalletProduction.objects.filter(fillticketreturnplan_link=select_row_plan)
            for pallet in select_row_pallet:
                pallet.fillticketreturnplan_link = None
                pallet.save()

            select_row_plan.delete()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class get_labplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            date_sql = request.query_params.get('date')
            date_filter = request.query_params.getlist('date_search[]')
            shift_sql = request.query_params.get('shift')
            data = []



            # queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql,pdplan_delete="0")
            # if len(date_filter) == 2:
            #     queryset = queryset.filter(pdplan_date__gte=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')), pdplan_date__lte=datetime.fromisoformat(date_filter[1].replace('Z', '+00:00')))
            # elif len(date_filter) == 1:
            #     queryset = queryset.filter(pdplan_date=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')))
            
            start_date = datetime.strptime(date_sql, "%Y-%m-%d")
            # คำนวณวันที่ย้อนหลัง 7 วัน
            end_date = start_date - timedelta(days=7)
            queryset = PlanProduction.objects.filter(pdplan_machine="Lab", pdplan_date__range=[end_date, start_date],pdplan_delete="0")

            if shift_sql != "ALL" and shift_sql != None:
                queryset = queryset.filter(pdplan_shift=shift_sql)
            queryset = queryset.order_by('-id')

            for plan_production in queryset:
                items_withdraw = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())

                
                data.append({
                    "create_at": plan_production.created_at,
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "pdplan_operator": CustomUser.objects.get(employee_id=plan_production.pdplan_operator).first_name,
                    "items_withdraw": items_withdraw,
                })

            return Response({'success': True, 'data': data})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_labplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        pdplan_date = datetime.strptime(request.data.get('pdplan_date'), "%Y-%m-%d").date()
        pdplan_shift  = request.data.get('pdplan_shift')
        pdlist_data = request.data.get('pdlist_data')
        pdplan_operator = request.user.employee_id
        
        PlanSQL = PlanProduction(
            pdplan_machine="Lab",
            pdplan_date=pdplan_date,
            pdplan_shift=pdplan_shift,
            pdplan_operator=pdplan_operator,
            pdplan_planapprove="0",
            pdplan_labapprove="1",
            pdplan_delete="0",
        )
        PlanSQL.save()

        for element in pdlist_data:
            try:
                query = list(ItemMasterProductWIP.objects.filter(field_zca=element[1]).values_list('field_zca','field_name','field_nameeng','field_pcspallet','field_lengthpallet','field_kgpcs')[0])
                type_select = "WIP"
            except Exception as e:
                query = list(ItemMasterProductFG.objects.filter(zca=element[1]).values_list('zca','name','nameen','pcpallet','size','kg')[0])
                size = query[4].split('x')[1]
                if size[-1] == "'" :
                    query[4] = float(size[0])*30.48
                else:
                    query[4] = size
                type_select = "FG"
            
            print(query)
            list_good = ListWithdrawPlanProduction(
                machine="Lab",
                zca_on= query[0],
                name_th= query[1],
                name_en= query[2],
                pcsperpallet=query[3],
                product_length=query[4],
                kgpcs = query[5],
                plan_link=PlanSQL,

            )
            list_good.save()

        try:
            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_labwithdrawplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            mc_sql = request.query_params.get('machine')
            date_sql = request.query_params.get('date')
            shift_sql = request.query_params.get('shift')
            data = []

            start_date = datetime.strptime(date_sql, "%Y-%m-%d")
            # คำนวณวันที่ย้อนหลัง 7 วัน
            end_date = start_date - timedelta(days=7)
            queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql, pdplan_date__range=[end_date, start_date],pdplan_delete="0")
            # queryset = PlanProduction.objects.filter(pdplan_machine=mc_sql,pdplan_delete="0", pdplan_date=date_sql)
            if shift_sql != "ALL" and shift_sql != None:
                queryset = queryset.filter(pdplan_shift=shift_sql)
            queryset = queryset.order_by('-id')

            for plan_production in queryset:
                items = list(ListWithdrawPlanProduction.objects.filter(plan_link=plan_production).exclude(delete_add__in=["Delete"]).values())
                product_source_zca = []
                for i in items:
                    i["operator_keyin_name"] = searchInfo_Operator(i["operator_keyin"])
                    i["operator_approve_name"] = searchInfo_Operator(i["operator_approve"])
                    try:
                        query_search = ItemMasterProductWIP.objects.filter(field_zca=i["zca_on"]).values('field_zca','field_name','field_nameeng','field_mc','pcsperpallet')[0]
                        type_select = "WIP"
                        i["pcperpallet"] = int(query_search['pcsperpallet'])
                    except:
                        query_search = ItemMasterProductFG.objects.filter(zca=i["zca_on"]).values('zca','name','nameen','pcpallet')[0]
                        type_select = "FG"
                        i["pcperpallet"] = int(query_search['pcpallet'])

                    try:
                        select_balance = Tiger_StockBalance.objects.get(zca=i["zca_on"])
                        i["instock_good"] = select_balance.urstock
                        i["instock_lab"] = select_balance.block
                    except Exception as e:
                        i["instock_good"] = 0
                        i["instock_lab"] = 0
                    
                    try:
                        qty_send_query = list(MapListWithdrawPallet.objects.filter(listwithdraw_link=int(i["id"])).values("qty"))
                        total_sum = 0
                        for item_qty in qty_send_query:
                            total_sum += item_qty["qty"]
                        i["qtysend"]= total_sum
                    except:
                        i["qtysend"] = 0

                    try:
                        maplist_query = MapListWithdrawPlan.objects.get(listwithdraw_link=int(i["id"]))
                        forklift_query = list(Forklift_Worklist.objects.filter(maplistwithdrawplan_link=int(maplist_query.id)).values())
                        success = 0
                        i["forklift_total"] = len(forklift_query)
                        for work in forklift_query:
                            if work["forklift_success"] == True:
                                success += 1
                        i["forklift_success"] = success
                        i["forklift_list"] = forklift_query
                    except Exception as e:
                        print(e)
                        i["forklift_total"] = 0
                        i["forklift_success"] = 0
                        i["forklift_list"] = []
                
                
                data.append({
                    "id": plan_production.id,
                    "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                    "pdplan_shift": plan_production.pdplan_shift,
                    "pdplan_delete": plan_production.pdplan_delete,
                    "items": items,
                })
            
            for i_index, i in enumerate(data):
                list_all = 0
                list_wait = 0
                list_keyin = 0
                list_approve = 0
                for j in data[i_index]["items"]:
                    list_all += 1
                    if j["withdraw_keyin"] == "success":
                        list_keyin += 1
                    else:
                        list_wait += 1
                for j in data[i_index]["items"]:
                    if (j["approve_withdraw"] == "success") and (j["withdraw_keyin"] == "success"):
                        list_approve += 1
                data[i_index]["list_all"] = list_all
                data[i_index]["list_wait"] = list_wait
                data[i_index]["list_keyin"] = list_keyin
                data[i_index]["list_approve"] = list_approve

            return Response({'success': True, 'data': data})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_labwithdrawplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            element = request.data

            def test_int(input):
                try:
                    return int(input)
                except:
                    return None
                
            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row = ListWithdrawPlanProduction.objects.get(id=int(element["sqlindex"]))
            if select_row.approve_withdraw == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            select_row.qty = test_int(element["qty"])
            select_row.note_production = element["note_production"]
            select_row.receive_date = test_year(element["receive_date"])
            select_row.receive_shift = element["receive_shift"]
            select_row.withdraw_keyin = "success"
            select_row.operator_keyin = request.user.employee_id
            select_row.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_labwithdrawaddplanproduct(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            data = request.data.get('id_plan')
            data_zca = request.data.get('zca_add')

            query = ItemMasterProductWIP.objects.filter(field_zca=data_zca).values_list('field_zca','field_name','field_nameeng','field_mc')[0]
            plan_to_link = PlanProduction.objects.get(pk=data)

            list_withdraw = ListWithdrawPlanProduction(
                            machine="Lab",
                            zca_on=query[0],
                            name_th=query[1],
                            name_en=query[2],
                            status= "รอเบิก",
                            plan_link=plan_to_link
                        )
            list_withdraw.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_labwithdraweditplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        edit_id = request.data.get('id_plan')

        select_row = ListWithdrawPlanProduction.objects.get(id=int(edit_id))

        if select_row.approve_withdraw == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.withdraw_keyin = None
            select_row.save()
            return Response({'success': True})
        
class post_labwithdrawdeleteplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):

        edit_id = request.data.get('id_plan')

        select_row = ListWithdrawPlanProduction.objects.get(id=int(edit_id))
        if select_row.withdraw_keyin == "success":
                return Response({"success": False, "message":"ข้อมูลนี้ถูกส่งเบิกอยู่"})
        elif select_row.approve_withdraw == "success":
            return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
        else:
            select_row.delete_add = "Delete"
            select_row.save()
            return Response({'success': True})
        
class get_labreturnplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        date_sql = request.query_params.get('date')
        shift_sql = request.query_params.get('shift')
        data = []
        plan = []

        start_date = datetime.strptime(date_sql, "%Y-%m-%d")
        # คำนวณวันที่ย้อนหลัง 7 วัน
        end_date = start_date - timedelta(days=7)
        queryset = PlanProduction.objects.filter(pdplan_machine="Lab", pdplan_date__range=[end_date, start_date],pdplan_delete="0")

        # queryset = PlanProduction.objects.filter(pdplan_machine="Lab",pdplan_delete="0", pdplan_date=date_sql)
        if shift_sql != "ALL" and shift_sql != None:
            queryset = queryset.filter(pdplan_shift=shift_sql)
        queryset = queryset.order_by('-id')

        for plan_production in queryset:
            query_planwithdraw_plan = ListWithdrawPlanProduction.objects.filter(plan_link=plan_production,delete_add=None,approve_withdraw="success").values()
            for plan_withdraw in query_planwithdraw_plan:
                plan_withdraw["operator_keyin_name"] = searchInfo_Operator(plan_withdraw["operator_keyin"])
                plan_withdraw["operator_approve_name"] = searchInfo_Operator(plan_withdraw["operator_approve"])
                # query_planwithdraw = list(MapListWithdrawPallet.objects.filter(listwithdraw_link=plan_withdraw["id"]).values())
                query_planwithdraw = list(MapListWithdrawPallet.objects.filter(listwithdraw_link=plan_withdraw["id"]).values("id","zca_on","product_date","product_shift","pallet_no","qty","pcsperpallet"))

                # Initialize a dictionary to hold the grouped data
                grouped_data = defaultdict(lambda: defaultdict(list))

                # Iterate over each item in the data list
                for item in query_planwithdraw:
                    try:
                        select_pallet = ListLabReturnPalletProduction.objects.get(maplistwithdrawpallet_link=int(item["id"]))
                    except Exception as e:
                        item["return_pallet"] = 0
                    else:
                        item["qty"] = select_pallet.qty
                        if(select_pallet.return_type == "good"):
                            item["return_pallet"] = 1
                        else:
                            item["return_pallet"] = 2

                    item["select"] = 0
                    item["select_button"] = 0

                    # Use the 'receive_date' and 'receive_shift' to group the items
                    grouped_data[item['product_date']][item['product_shift']].append(item)

                # Now, transform the grouped data into the desired list format
                grouped_list = []
                for date, shifts in grouped_data.items():
                    for shift, pallets in shifts.items():
                        grouped_list.append({
                            "product_date": date,
                            "product_shift": shift,
                            "total_pallets": len(pallets),
                            "pallets": sorted(pallets, key=lambda d: d['pallet_no']),
                        })

                query_planreturn = list(ListLabReturnPlanProduction.objects.filter(withdrawplan_link=int(plan_withdraw["id"])).values())
                
                for k in query_planreturn:
                    k["operator_keyin_name"] = searchInfo_Operator(k["operator_keyin"])
                    k["operator_approve_name"] = searchInfo_Operator(k["operator_approve"])
                for i in query_planreturn:
                    query_palletticket_plan = list(ListLabReturnPalletProduction.objects.filter(labreturnplan_link=int(i["id"])).values())
                    grouped_data_2 = defaultdict(lambda: defaultdict(list))
                    for item in query_palletticket_plan:
                        grouped_data_2[item['product_date']][item['product_shift']].append(item)

                    grouped_list_2 = []
                    for date, shifts in grouped_data_2.items():
                        for shift, pallets in shifts.items():
                            grouped_list_2.append({
                                "product_date": date,
                                "product_shift": shift,
                                "total_pallets": len(pallets),
                                "pallets": sorted(pallets, key=lambda d: d['pallet_no']),
                            })
                    i["pallets"] = grouped_list_2

                try: 
                    select_plan = ListLabReturnPlanProduction.objects.get(withdrawplan_link=int(plan_withdraw["id"]))

                    total_qty = 0
                    for i in query_planwithdraw:
                        total_qty += i["qty"]

                    plan.append({
                        "zca_on": plan_withdraw["zca_on"],
                        "name_th": plan_withdraw["name_th"],
                        "machine": select_plan.product_machine,
                        "return_date": select_plan.return_date,
                        "return_shift": select_plan.return_shift,
                        "note_production": select_plan.note_production,
                        "note_planner": select_plan.note_planner,

                        "return_approve": select_plan.return_approve,

                        "return_keyin": select_plan.return_keyin,

                        "operator_keyin_name": searchInfo_Operator(select_plan.operator_keyin),
                        "operator_approve_name": searchInfo_Operator(select_plan.operator_approve),
                        
                        "total_allpallets" : len(query_planwithdraw),
                        "total_allqty" : total_qty,
                        "planwithdraw": plan_withdraw["id"],
                        "listreturn": query_planreturn,
                        "items": grouped_list,
                    })
                except Exception as e:
                    print(e)

                    total_qty = 0
                    for i in query_planwithdraw:
                        total_qty += i["qty"]
                    plan.append({
                        "zca_on": plan_withdraw["zca_on"],
                        "name_th": plan_withdraw["name_th"],
                        "machine": plan_withdraw["machine"],
                        "return_date": None,
                        "return_shift": None,
                        "note_production": None,
                        "note_planner": None,
                        "return_approve": None,
                        "return_keyin": None,
                        "total_allpallets" : len(query_planwithdraw),
                        "total_allqty" : total_qty,
                        "planwithdraw": plan_withdraw["id"],
                        "listreturn": query_planreturn,
                        "items": grouped_list,
                    })

                # plan.append({
                #     "zca_on": plan_withdraw.zca_on,
                #     "name_th": plan_withdraw.name_th,
                #     "machine": plan_withdraw.machine,
                #     "return_date": select_plan.return_date,
                #     "return_shift": select_plan.return_shift,
                    
                #     "total_allpallets" : len(query_planwithdraw),
                #     "planwithdraw": plan_withdraw.id,
                #     "items": grouped_list,
                # })
                
            data.append({
                "id": plan_production.id,
                "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                "pdplan_shift": plan_production.pdplan_shift,
                "pdplan_delete": plan_production.pdplan_delete,
                "items": plan,
            })
            plan = []

        return Response({'success': True, 'data': data})
    
class post_labreturnplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:

            data = request.data.get('data')
            planwithdraw_id = request.data.get('planwithdraw')
            return_date_input = request.data.get('dateinput')
            return_shift_input = request.data.get('shiftinput')
            note_production = request.data.get('note_production')
            status_summit = request.data.get('submit')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None
                
            withdrawplan = ListWithdrawPlanProduction.objects.get(id=int(planwithdraw_id))
            query = ItemMasterProductWIP.objects.filter(field_zca=withdrawplan.zca_on).values_list('field_zca','field_name','field_nameeng','field_mc')[0]
            return_plan = ListLabReturnPlanProduction(
                return_machine="Lab",
                product_machine=query[3],
                zca_on=withdrawplan.zca_on,
                name_th=withdrawplan.name_th,
                name_en=withdrawplan.name_en,
                # receive_date=withdrawplan.receive_date,
                # receive_shift=withdrawplan.receive_shift,
                return_date=return_date_input,
                return_shift=return_shift_input,
                note_production=note_production,
                withdrawplan_link=withdrawplan,
                return_keyin = "success",
                operator_keyin = request.user.employee_id
            )

            total_pcs = 0
            total_pcs_good = 0
            total_pcs_bad = 0
            
            for pallet_data in data:
                try:
                    select_pallet = ListLabReturnPalletProduction.objects.get(maplistwithdrawpallet_link=pallet_data["sqlindex"])
                    if select_pallet:
                        return Response({"success": False, "message":"Pallet ที่ " + str(select_pallet.pallet_no) + " ถูกส่งคัดแล้ว"})
                except:
                    select_pallet = None

            return_plan.save()

            for element in sorted(data, key=lambda x: x['select_button']):
                select_row = MapListWithdrawPallet.objects.get(id=int(element["sqlindex"]))

                if element["select_button"] == 1 :
                    return_type_select = "good"
                elif element["select_button"] == 0 :
                    return_type_select = "delete"
                elif element["select_button"] == 2 :
                    continue
                else:
                    continue
                return_pallet = ListLabReturnPalletProduction(
                    product_machine = query[3],
                    zca_on = select_row.zca_on,
                    name_th = select_row.name_th,
                    name_en = select_row.name_en,
                    product_type = select_row.product_type,
                    product_date = select_row.product_date,
                    product_shift = select_row.product_shift,
                    qty = element["qty"],
                    pcsperpallet = select_row.pcsperpallet,
                    product_length = select_row.product_length,
                    kgpcs = select_row.kgpcs,
                    ton = select_row.ton,
                    receive_date = select_row.send_date,
                    receive_shift = select_row.send_shift,

                    pallet_no = select_row.pallet_no,

                    # listfillplan_link = select_row.listgood_link,
                    plan_link = select_row.plan_link,

                    # withdrawplan_link=withdrawplan,
                    labreturnplan_link=return_plan,

                    return_type=return_type_select,
                    return_machine="Lab",

                    maplistwithdrawpallet_link=select_row
                )
                return_pallet.save()

                if return_type_select == "good":
                    total_pcs_good += element["qty"]
                elif return_type_select == "bad":
                    total_pcs_bad += element["qty"]

            return_plan.qty_good = total_pcs_good
            return_plan.qty_bad = total_pcs_bad
            return_plan.save()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_deletelabreturnplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            planticket_id = request.data.get('planticket_id')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row_plan = ListLabReturnPlanProduction.objects.get(id=int(planticket_id))
            # if select_row_plan.approve_fill:
            #         return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            select_row_pallet = ListLabReturnPalletProduction.objects.filter(labreturnplan_link=select_row_plan).delete()

            select_row_plan.delete()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_labunlockbadplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        date_sql = request.query_params.get('date')
        shift_sql = request.query_params.get('shift')
        data = []
        plan = []

        start_date = datetime.strptime(date_sql, "%Y-%m-%d")
        # คำนวณวันที่ย้อนหลัง 7 วัน
        end_date = start_date - timedelta(days=7)
        queryset = PlanProduction.objects.exclude(pdplan_machine="Lab").filter(pdplan_date__range=[end_date, start_date],pdplan_delete="0")

        # queryset = PlanProduction.objects.filter(pdplan_machine="Lab",pdplan_delete="0", pdplan_date=date_sql)
        if shift_sql != "ALL" and shift_sql != None:
            queryset = queryset.filter(pdplan_shift=shift_sql)
        queryset = queryset.order_by('-id')

        for plan_production in queryset:
            query_returnplan = ListReturnPlanProduction.objects.exclude(qty_bad=0).filter(plan_link=plan_production,return_approve="success").values()
            total_badpallet = 0
            for plan_withdraw in query_returnplan:
                plan_withdraw["operator_keyin_name"] = searchInfo_Operator(plan_withdraw["operator_keyin"])
                plan_withdraw["operator_approve_name"] = searchInfo_Operator(plan_withdraw["operator_approve"])
                # query_planwithdraw = list(MapListWithdrawPallet.objects.filter(listwithdraw_link=plan_withdraw["id"]).values())
                query_returnpallet = list(ListReturnPalletProduction.objects.filter(returnplan_link=plan_withdraw["id"]).exclude(return_type="good").values("id","return_type","zca_on","product_date","product_shift","pallet_no","qty","pcsperpallet"))

                # Initialize a dictionary to hold the grouped data
                grouped_data = defaultdict(lambda: defaultdict(list))

                # Iterate over each item in the data list
                for item in query_returnpallet:
                    try:
                        select_pallet = ListLabBadUnlockPalletProduction.objects.get(returnpallet_link=int(item["id"]))
                    except Exception as e:
                        item["return_pallet"] = 0
                        item["select"] = 0
                        item["select_button"] = 0
                    else:
                        item["return_pallet"] = 1
                        item["select"] = 0
                        item["select_button"] = 0

                    # Use the 'receive_date' and 'receive_shift' to group the items
                    grouped_data[item['product_date']][item['product_shift']].append(item)

                    total_badpallet += 1
                # Now, transform the grouped data into the desired list format
                grouped_list = []
                for date, shifts in grouped_data.items():
                    for shift, pallets in shifts.items():
                        grouped_list.append({
                            "product_date": date,
                            "product_shift": shift,
                            "total_pallets": len(pallets),
                            "pallets": sorted(pallets, key=lambda d: d['pallet_no']),
                        })


                #เพื่อหา Plan ที่ส่งคืนแล้ว
                query_planreturn = list(ListLabBadUnlockPlanProduction.objects.filter(returnplan_link=int(plan_withdraw["id"])).values())
                
                for k in query_planreturn:
                    k["operator_keyin_name"] = searchInfo_Operator(k["operator_keyin"])
                    k["operator_approve_name"] = searchInfo_Operator(k["operator_approve"])
                for i in query_planreturn:
                    query_palletticket_plan = list(ListLabBadUnlockPalletProduction.objects.filter(labunlockbadplan_link=int(i["id"])).values())
                    grouped_data_2 = defaultdict(lambda: defaultdict(list))
                    for item in query_palletticket_plan:
                        grouped_data_2[item['product_date']][item['product_shift']].append(item)

                    grouped_list_2 = []
                    for date, shifts in grouped_data_2.items():
                        for shift, pallets in shifts.items():
                            grouped_list_2.append({
                                "product_date": date,
                                "product_shift": shift,
                                "total_pallets": len(pallets),
                                "pallets": sorted(pallets, key=lambda d: d['pallet_no']),
                            })
                    i["pallets"] = grouped_list_2
                
                # ปั้นก้อนข้อมูล
                try: 
                    print("id:",int(plan_withdraw["id"]))
                    select_plan = ListReturnPlanProduction.objects.get(id=int(plan_withdraw["id"]))

                    total_qty = 0
                    for i in query_returnpallet:
                        total_qty += i["qty"]

                    plan.append({
                        "zca_on": plan_withdraw["zca_on"],
                        "name_th": plan_withdraw["name_th"],
                        "machine": select_plan.product_machine,
                        "return_date": select_plan.return_date,
                        "return_shift": select_plan.return_shift,
                        "note_production": select_plan.note_production,
                        "note_planner": select_plan.note_planner,

                        "return_approve": select_plan.return_approve,

                        "return_keyin": select_plan.return_keyin,

                        "operator_keyin_name": searchInfo_Operator(select_plan.operator_keyin),
                        "operator_approve_name": searchInfo_Operator(select_plan.operator_approve),
                        
                        "total_allpallets" : total_badpallet,
                        "total_allqty" : total_qty,
                        "planwithdraw": plan_withdraw["id"],
                        "listreturn": query_planreturn,
                        "items": grouped_list,
                    })
                except Exception as e:
                    print(e)

                    total_qty = 0
                    for i in query_returnpallet:
                        total_qty += i["qty"]
                    plan.append({
                        "zca_on": plan_withdraw["zca_on"],
                        "name_th": plan_withdraw["name_th"],

                        "return_date": None,
                        "return_shift": None,
                        "note_production": None,
                        "note_planner": None,
                        "return_approve": None,
                        "return_keyin": None,
                        "total_allpallets" : total_badpallet,
                        "total_allqty" : total_qty,
                        "planwithdraw": plan_withdraw["id"],
                        "listreturn": query_planreturn,
                        "items": grouped_list,
                    })

                # plan.append({
                #     "zca_on": plan_withdraw.zca_on,
                #     "name_th": plan_withdraw.name_th,
                #     "machine": plan_withdraw.machine,
                #     "return_date": select_plan.return_date,
                #     "return_shift": select_plan.return_shift,
                    
                #     "total_allpallets" : len(query_planwithdraw),
                #     "planwithdraw": plan_withdraw.id,
                #     "items": grouped_list,
                # })
                
            data.append({
                "id": plan_production.id,
                "pdplan_machine": plan_production.pdplan_machine,
                "pdplan_date": plan_production.pdplan_date.strftime("%d/%m/%Y"),
                "pdplan_shift": plan_production.pdplan_shift,
                "pdplan_delete": plan_production.pdplan_delete,
                "items": plan,
            })
            plan = []

        return Response({'success': True, 'data': data})
    
class post_labunlockbadplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:

            data = request.data.get('data')
            planwithdraw_id = request.data.get('planwithdraw')
            return_date_input = request.data.get('dateinput')
            return_shift_input = request.data.get('shiftinput')
            note_production = request.data.get('note_production')
            status_summit = request.data.get('submit')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None
                
            withdrawplan = ListReturnPlanProduction.objects.get(id=int(planwithdraw_id))
            query = ItemMasterProductWIP.objects.filter(field_zca=withdrawplan.zca_on).values_list('field_zca','field_name','field_nameeng','field_mc')[0]
            return_plan = ListLabBadUnlockPlanProduction(
                return_machine="Lab",
                product_machine=query[3],
                zca_on=withdrawplan.zca_on,
                name_th=withdrawplan.name_th,
                name_en=withdrawplan.name_en,
                receive_date=withdrawplan.receive_date,
                receive_shift=withdrawplan.receive_shift,
                return_date=return_date_input,
                return_shift=return_shift_input,
                return_keyin = "success",
                operator_keyin = request.user.employee_id,
                note_production=note_production,
                plan_link=withdrawplan.plan_link,
                returnplan_link=withdrawplan,
            )

            
            for pallet_data in data:
                try:

                    select_pallet = ListLabBadUnlockPalletProduction.objects.get(returnpallet_link=int(pallet_data["sqlindex"]))
                    if select_pallet.returnpallet_link:
                        return Response({"success": False, "message":"Pallet ที่ " + str(select_pallet.pallet_no) + " ถูกส่งคัดแล้ว"})
                except Exception as e:
                    print(e)
                    select_pallet = None

            return_plan.save()

            total_pcs = 0
            total_pcs_good = 0
            total_pcs_bad = 0

            for element in sorted(data, key=lambda x: x['select_button']):
                select_row = ListReturnPalletProduction.objects.get(id=int(element["sqlindex"]))

                if element["select_button"] == 1 :
                    return_type_select = "good"
                elif element["select_button"] == 0 :
                    return_type_select = "delete"
                elif element["select_button"] == 2 :
                    continue
                else:
                    continue
                
                return_pallet = ListLabBadUnlockPalletProduction(
                    product_machine = query[3],
                    zca_on = select_row.zca_on,
                    name_th = select_row.name_th,
                    name_en = select_row.name_en,
                    product_type = select_row.product_type,
                    product_date = select_row.product_date,
                    product_shift = select_row.product_shift,
                    qty = element["qty"],
                    pcsperpallet = select_row.pcsperpallet,
                    product_length = select_row.product_length,
                    kgpcs = select_row.kgpcs,
                    ton = select_row.ton,

                    pallet_no = select_row.pallet_no,

                    # listfillplan_link = select_row.listgood_link,
                    plan_link = select_row.plan_link,
                    returnpallet_link = select_row,

                    # withdrawplan_link=withdrawplan,
                    returnplan_link=withdrawplan,
                    labunlockbadplan_link=return_plan,

                    return_type=return_type_select,
                    return_machine="Lab",

                )
                return_pallet.save()

                if return_type_select == "good":
                    total_pcs_good += element["qty"]
                elif return_type_select == "bad":
                    total_pcs_bad += element["qty"]

            return_plan.qty_good = total_pcs_good
            return_plan.qty_bad = total_pcs_bad
            return_plan.save()



            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class post_deletelabunlockbadplanproduction(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        try:
            planticket_id = request.data.get('planticket_id')

            def test_year(input):
                try:
                    return datetime.strptime(input, "%Y-%m-%d").date()
                except:
                    return None

            select_row_plan = ListLabBadUnlockPlanProduction.objects.get(id=int(planticket_id))
            # if select_row_plan.approve_fill:
            #         return Response({"success": False, "message":"ข้อมูลนี้ถูก Approve แล้ว"})
            select_row_pallet = ListLabBadUnlockPalletProduction.objects.filter(labunlockbadplan_link=select_row_plan).delete()

            select_row_plan.delete()

            return Response({'success': True})
        except Exception as e:
            print("ERROR >>>",e)
            return Response({'success': False, 'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class get_DashboardPerformance(APIView):
    permission_classes = [ ProductionPerm | PlannerPerm | AdminPerm | ManagerPerm | PISPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            
            mc_filter = request.query_params.get('machine')
            date_filter = request.query_params.getlist('date_search[]')
            group = request.query_params.getlist('group')
            item = ItemMasterProductWIP.objects.values('field_zca','field_prodgroup')
            if group[0] != None and group[0] != "ALL":
                item_query = item.filter(field_prodgroup = group[0]).values('field_zca')
            else:
                item_query = ItemMasterProductWIP.objects.values('field_zca')
                
            queryset_pis = ViewActiveplan.objects
            if mc_filter != None:
                queryset_pis = queryset_pis.filter(machine=mc_filter)
            if len(date_filter) == 2:
                queryset_pis = queryset_pis.filter(starttime__gte=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')), starttime__lte=datetime.fromisoformat(date_filter[1].replace('Z', '+00:00')))
            elif len(date_filter) == 1:
                queryset_pis = queryset_pis.filter(starttime=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')))
            

            intersection = queryset_pis.filter(materialcode__in=item_query)

            data_raw = list(intersection.values_list('materialcode','materialname','plancount','planweight','planname','starttime'))
            # print(intersection)
            #clear Null
            data_pis = []
            for i in data_raw:
                if i[0] != None and i[0] != "NULL" :
                    data_pis.append(i)

            queryset = ListFillPlanProduction.objects.filter(approve_fill="success")
            if mc_filter != None:
                queryset = queryset.filter(machine=mc_filter)
            if len(date_filter) == 2:
                queryset = queryset.filter(created_at__gte=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')), created_at__lte=datetime.fromisoformat(date_filter[1].replace('Z', '+00:00')))
            elif len(date_filter) == 1:
                queryset = queryset.filter(created_at=datetime.fromisoformat(date_filter[0].replace('Z', '+00:00')))

            data_act = queryset.order_by('-id').values()

            data_all = {}
            for i in data_pis:
                if i[0] not in data_all:
                    data_all[i[0]] = { "name":i[1],"pis_pcs":int(i[2]),"act_pcs":0,"pis_tons":round(float(i[3]), 3),"act_tons":0}
                else:
                    data_all[i[0]]["pis_pcs"] += int(i[2])
                    data_all[i[0]]["pis_tons"] += round(float(i[3]), 3)

            for i in data_act:
                if i["zca_on"] not in data_all:
                    data_all[i["zca_on"]] = { "name":i["name_th"], "pis_pcs":0, "act_pcs":i["qty_good"], "pis_tons":0, "act_tons":round((i["qty_good"]*i["kgpcs"]/1000), 3)}
                else:
                    data_all[i["zca_on"]]["act_pcs"] += int(i["qty_good"])
                    data_all[i["zca_on"]]["act_tons"] += round((i["qty_good"]*i["kgpcs"]/1000), 3)
                
            # Convert data_all to a list of tuples and sort by pis_pcs in descending order
            sorted_data = sorted(data_all.items(), key=lambda item: item[1]["pis_pcs"], reverse=True)
            # Get the top 30 items
            top_30_data = dict(sorted_data[:30])
            for i in top_30_data:
                top_30_data[i]['pis_tons'] = round(top_30_data[i]['pis_tons'],3)
            return Response({'success': True, 'data': top_30_data})
        except Exception as e:
            print(e)
    
class get_Progroup(APIView):
    permission_classes = [PlannerPerm | AdminPerm | ManagerPerm | PISPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # try:
            # group_filter = request.query_params.get('group')
            # subgroup_filter = request.query_params.get('subgroup')
            dropdownlist = ItemMasterProductWIP.objects.exclude(field_prodgroup="NULL").values("field_prodgroup","field_prodname").distinct()
            formatted_data = {}
            for item in dropdownlist:
                group = item['field_prodgroup']
                prodname = item['field_prodname']
                
                if group in formatted_data:
                    formatted_data[group].append(prodname)
                else:
                    formatted_data[group] = [prodname]

            # แปลงเป็นรูปแบบที่ต้องการ
            output = [{"group": key, "subgroup": value} for key, value in formatted_data.items()]

            return Response({'success': True,'dropdownlist': output})

class get_monitorfillplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # try:
            
            mc_filter = request.query_params.get('machine')

            data_all = ListFillPlanProduction.objects.filter(machine=mc_filter,fill_success=None).order_by("-id").values()
            for i in data_all:
                queryplan = PlanProduction.objects.get(id=i["plan_link_id"])
                i["plan_date"] = queryplan.pdplan_date
                i["plan_shift"] = queryplan.pdplan_shift 

            return Response({'success': True, 'data': data_all})
    
class get_monitorwithdrawplan(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        # try:
            
            mc_filter = request.query_params.get('machine')

            data_all = ListWithdrawPlanProduction.objects.filter(machine=mc_filter,withdraw_keyin=None).exclude(delete_add__in=["Delete"]).order_by("-id").values()
            for i in data_all:
                queryplan = PlanProduction.objects.get(id=i["plan_link_id"])
                i["plan_date"] = queryplan.pdplan_date
                i["plan_shift"] = queryplan.pdplan_shift 

            return Response({'success': True, 'data': data_all})
    
class get_allInfozca(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
            zca = request.query_params.get('zca')
            print(zca)
            try:
                result = searchInfo_WIP(zca)
            except:
                result = searchInfo_FG(zca)

            return Response({'success': True, 'data': result})


class PostActualView(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def post(self, request, *args, **kwargs):
        print('request','123')
        try:
            # id_actual = request.data.get('id')
            text = request.data.get('text')
            startDate = datetime.now()
            frozen_id=request.data.get('frozen_id')
            stk_actual = request.data.get('stk_actual')
            print('request',text)
            if text:
                save_data = ActualMat(
                    zca=text,
                    date_start=startDate,
                    th_name='-',
                    stk_actual=stk_actual,
                    id_frozen=frozen_id,
                )
                save_data.save()

                print("Saved data:", save_data)
                return Response({'success': True, 'calculated_stock': stk_actual})
            else:
                return Response({'success': False, 'error': 'Missing fields or incorrect data'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error: {e}")  # Print the error to the console
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class GetActualView(APIView):
    permission_classes = [ProductionPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):
        try:
            appointment_id = request.query_params.get('appointment_id', None)
            print('appointment_id', appointment_id)
            if appointment_id is None:
                return Response({'success': False, 'error': 'appointment_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            result = FrozenMat.objects.filter(id_frozen=appointment_id).values()
            actual_result = ActualMat.objects.filter(id_frozen=appointment_id).values()
            if not result and not actual_result:
                return Response({'success': False, 'error': 'No data found for the provided appointment_id'}, status=status.HTTP_404_NOT_FOUND)
            
            response_data = {
                'frozen_data': list(result),
                'actual_data': list(actual_result)
            }
            return Response({'success': True, 'data': response_data})
        
        except Exception as e:
            print(f"Error: {e}")  # Print the error to the console
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)