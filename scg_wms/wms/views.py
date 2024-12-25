from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.urls import reverse
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
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

from datetime import datetime
import os
import csv
import math


def searchInfo_WIP(zca_search):
    query = ItemMasterProductWIP.objects.filter(field_zca=zca_search).values()[0]
    return query

def searchInfo_FG(zca_search):
    query = ItemMasterProductFG.objects.filter(zca=zca_search).values()[0]
    return query

class doManualUser(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @swagger_auto_schema(
        operation_summary="User Login",
        operation_description="API endpoint for user login.",
        responses={200: "OK", 401: "Unauthorized", 400: "Bad Request"}
    )

    def get(self, request, *args, **kwargs):

        # Basic validation
        try:
            # Check for duplicate employee_id and username
            if CustomUser.objects.filter(employee_id="9999999999").exists():
                return Response({'success': False, 'message': 'Employee ID is Duplicate'}, status=status.HTTP_400_BAD_REQUEST)
            if CustomUser.objects.filter(username="iBeamKung").exists():
                return Response({'success': False, 'message': 'Username is Duplicate'}, status=status.HTTP_400_BAD_REQUEST)

            # Create new user
            user = CustomUser.objects.create(
                username="iBeamKung",
                password="iBeamKung",  # Ensure the password is hashed
                email="Netipat@scg.com",
                last_name="Suksai",
                first_name="Natipat",
                employee_id="9999999999",
                role_id=1
            )
            user = CustomUser.objects.get(id=user)
            user.set_password("iBeamKung")
            user.save()
            return Response({'success': True, 'message': f'Successfully added user: {"iBeamKung"}'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'message': 'Failed to add user', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class doLogin(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @swagger_auto_schema(
        operation_summary="User Login",
        operation_description="API endpoint for user login.",
        responses={200: "OK", 401: "Unauthorized", 400: "Bad Request"}
    )

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            role_mapping = {
                1: "Admin",
                2: "Planner",
                3: "Production",
                4: "Plantco",
                5: "Lab",
                6: "SCM",
                7: "PIS",

            }

            role_id = request.user.role_id
            role_name = role_mapping.get(int(role_id), "Unknown")
            print('role_name',role_name)
            role_url = "/home"
            if role_name == "Admin":
                role_url = "/admin"

            elif role_name == "Planner":
                role_url = "/planner"

            elif role_name == "Production":
                role_url = "/planner"

            elif role_name == "Plantco":
                role_url = "/PlantCo"

            elif role_name == "Lab":
                role_url = "/Lab"
                
            elif role_name == "SCM":
                role_url = "/SCM"

            elif role_name == "PIS":
                role_url = "/pis"

            elif role_name == "PlantCo":
                role_url = "/planner"


            return Response({'success': True, 'message': 'Successfully logged in.','role':role_name ,'redirect_url':role_url,}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False, 'message': 'Username / Password ผิด.'}, status=status.HTTP_200_OK)

class doLogout(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @swagger_auto_schema(
        operation_summary="User Logout",
        responses={200: "OK", 401: "Unauthorized", 400: "Bad Request"}
    )
    def get(self, request, *args, **kwargs):
        try:
            print('request',request)
            logout(request)
            return Response({'success': True, 'message': 'ออกจากระบบสำเร็จ'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'success': False, 'message': 'ระบบผิดพลาด 500'}, status=status.HTTP_200_OK)

class checkSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="checkSession",
        operation_description="API endpoint for user login.",
        responses={200: "OK", 401: "Unauthorized", 400: "Bad Request"}
    )
    def get(self, request, *args, **kwargs):
        
        if request.user.is_authenticated:
            role_mapping = {
                1: "Admin",
                2: "Planner",
                3: "Production",
                4: "Plantco",
                5: "Lab",
                6: "SCM",
            }
            role_id = request.user.role_id
            role_name = role_mapping.get(int(role_id), "Unknown")

            data = {
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "employee_id": request.user.employee_id,
                "role_id": request.user.role_id,
                "role_name": role_name,
            }
            return Response({'success': True,'data': data}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False}, status=status.HTTP_200_OK)

class getUser(APIView):
    permission_classes = [PlannerPerm | AdminPerm]

    @swagger_auto_schema(
        operation_summary="get User",
        operation_description="API endpoint for user login.",
        responses={200: "OK", 401: "Unauthorized", 400: "Bad Request"}
    )
    def get(self, request, *args, **kwargs):
        
        query = CustomUser.objects.values('id','date_joined','username','first_name','last_name','employee_id','email','role_id')
        
        return Response({'success': True, 'data': query}, status=status.HTTP_200_OK)
        
class doRegister(APIView):
    # permission_classes = (permissions.AllowAny,)
    permission_classes = [PlannerPerm | AdminPerm]

    @swagger_auto_schema(
        operation_summary="User Registration",
        operation_description="API endpoint for user registration.",
        responses={201: "Created", 500: "Internal Server Error", 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        # Extracting data from request
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        employee_id = request.data.get('employee_id')
        role_id = request.data.get('role_id')


        # Basic validation
        if not all([username, password, email, employee_id, role_id]):
            return Response({'success': False, 'message': 'Missing required fields'})

        try:
            # Check for duplicate employee_id and username
            if CustomUser.objects.filter(employee_id=employee_id).exists():
                return Response({'success': False, 'message': 'Employee ID is Duplicate'})
            if CustomUser.objects.filter(username=username).exists():
                return Response({'success': False, 'message': 'Username is Duplicate'})

            # Create new user
            user = CustomUser.objects.create(
                username=username,
                email=email,
                last_name=last_name,
                first_name=first_name,
                employee_id=employee_id,
                role_id=int(role_id)
            )

            # Set the password for the user
            # It's important to use set_password to ensure the password is hashed
            user.set_password(password)

            # Save the user object with the updated password
            user.save()
            return Response({'success': True, 'message': f'Successfully added user: {username}'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'message': 'Failed to add user', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class doSetPassword(APIView):
    permission_classes = [PlannerPerm | AdminPerm]

    @swagger_auto_schema(
        request_body=UserRegisterSerializer,
        operation_summary="User Registration",
        operation_description="API endpoint for updating user details and password.",
        responses={201: "Created", 500: "Internal Server Error", 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        id_select = request.data.get('id_select')
        new_name = request.data.get('first_name')
        new_lastname = request.data.get('last_name')
        new_email = request.data.get('email')
        new_password = request.data.get('new_password')
        
        try:
            # Retrieve user by id
            user = CustomUser.objects.get(id=int(id_select))
            
            # Update first name if provided
            if new_name:
                user.first_name = new_name
            
            # Update last name if provided
            if new_lastname:
                user.last_name = new_lastname
            
            # Update email if provided
            if new_email:
                user.email = new_email
            
            # Update password if provided and valid
            if new_password:
                user.set_password(new_password)
            else:
                return Response({'success': False, 'message': 'Password is empty'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Save user with updated fields
            user.save()
            
            return Response({'success': True, 'message': f'Successfully updated user details for user_id: {id_select}'}, status=status.HTTP_201_CREATED)

        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'success': False, 'message': 'Failed to update user.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class doDeleteUser(APIView):
    permission_classes = [PlannerPerm | AdminPerm]

    @swagger_auto_schema(
        request_body=UserRegisterSerializer,
        operation_summary="User Registration",
        operation_description="API endpoint for user registration.",
        responses={201: "Created", 500: "Internal Server Error", 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        id_select = request.data.get('id_select')
        
        try:
            CustomUser.objects.get(id=id_select).delete()
            return Response({'success': True, 'message': f'Successfully Deleted user_id: {id_select}'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'message': 'Failed to add user.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    



class emergency_redbutton(APIView):
    permission_classes = [PlannerPerm | AdminPerm]

    @swagger_auto_schema()
    def get(self, request, *args, **kwargs):

        FGPlanningStock.objects.all().delete()
        DontsendData.objects.all().delete()
        Forklift_Worklist.objects.all().delete()
        Map_management.objects.all().delete()
        MapListFillPlan.objects.all().delete()
        MapListFillPallet.objects.all().delete()
        MapListWithdrawPlan.objects.all().delete()
        MapListWithdrawPallet.objects.all().delete()
        ListWithdrawPlanProduction.objects.all().delete()
        ListReturnPlanProduction.objects.all().delete()
        ListReturnPalletProduction.objects.all().delete()
        ListReturnPlanNoteProduction.objects.all().delete()
        # ListGoodFillPlanProduction.objects.all().delete()
        # ListYellowFillPlanProduction.objects.all().delete()
        # ListBlueFillPlanProduction.objects.all().delete()
        ListFillPlanProduction.objects.all().delete()
        ListTicketPlanProduction.objects.all().delete()
        ListFillTicketPalletProduction.objects.all().delete()

        ListLabReturnPlanProduction.objects.all().delete()
        ListLabReturnPalletProduction.objects.all().delete()

        ListLabBadUnlockPlanProduction.objects.all().delete()
        ListLabBadUnlockPalletProduction.objects.all().delete()

        PlanProduction.objects.all().delete()

        return Response({'success': True,'message':"วิ่งงงงงงงงง"})

    
# Create your views here.
def index(request):
    # return HttpResponse("OK")
    return render(request,"index.html")

def addMap(request):
    x = [
            ["113", "SZ1", 4, 1, "", -1],
            ["113", "SZ1", 4, 2, "", -1],
            ["113", "SZ1", 4, 3, "", -1],
            ["113", "SZ1", 4, 4, "", -1],
            ["113", "SZ1", 4, 5, "", -1],
            ["113", "SZ1", 4, 6, "", -1],
            ["113", "SZ2", 4, 1, "", -1],
            ["113", "SZ2", 4, 2, "", -1],
            ["113", "SZ2", 4, 3, "", -1],
            ["113", "SZ2", 4, 4, "", -1],
            ["113", "SZ2", 4, 5, "", -1],
            ["113", "SZ2", 4, 6, "", -1],
        ]
    
    for i in x:
        map = map_list(
                        zone            = i[0],
                        subzone         = i[1],
                        widesize        = i[2],
                        column          = i[3],
                        product_inside  = i[4],
                        wait_pallet     = i[5],
                    )
        map.save()
    
    return HttpResponse("OK")

def addProduct(request):
    module_dir = os.path.dirname(__file__)
    print(module_dir)

    file01 = open(os.path.join(module_dir, 'data1.txt'), 'r', encoding="utf8")
    file02 = open(os.path.join(module_dir, 'data2.txt'), 'r', encoding="utf8")
    file03 = open(os.path.join(module_dir, 'data3.txt'), 'r', encoding="utf8")
    file04 = open(os.path.join(module_dir, 'data4.txt'), 'r', encoding="utf8")
    file05 = open(os.path.join(module_dir, 'data5.txt'), 'r', encoding="utf8")
    file06 = open(os.path.join(module_dir, 'data6.txt'), 'r', encoding="utf8")
    file07 = open(os.path.join(module_dir, 'data7.txt'), 'r', encoding="utf8")
    file08 = open(os.path.join(module_dir, 'data8.txt'), 'r', encoding="utf8")
    file09 = open(os.path.join(module_dir, 'data9.txt'), 'r', encoding="utf8")
    file10 = open(os.path.join(module_dir, 'data10.txt'), 'r', encoding="utf8")

    Lines01 = file01.readlines()
    Lines02 = file02.readlines()
    Lines03 = file03.readlines()
    Lines04 = file04.readlines()
    Lines05 = file05.readlines()
    Lines06 = file06.readlines()
    Lines07 = file07.readlines()
    Lines08 = file08.readlines()
    Lines09 = file09.readlines()
    Lines10 = file10.readlines()


    count = 0
    # Strips the newline character
    for line in range(len(Lines01)):
        count += 1
        print("Line {}: {} | {} | {} | {} | {} | {} | {} | {} | {} | {}".format(count, 
                                                                                Lines01[line].strip('\n'), 
                                                                                Lines02[line].strip('\n'), 
                                                                                Lines03[line].strip('\n'), 
                                                                                Lines04[line].strip('\n'), 
                                                                                Lines05[line].strip('\n'), 
                                                                                Lines06[line].strip('\n'), 
                                                                                Lines07[line].strip('\n'), 
                                                                                Lines08[line].strip('\n'), 
                                                                                Lines09[line].strip('\n'), 
                                                                                Lines10[line].strip('\n')))
        try:
            x1 = int(Lines08[line].strip('\n'))
        except:
            x1 = 0
        try:
            x2 = float(Lines09[line].strip('\n'))
        except:
            x2 = 0
        try:
            x3 = float(Lines10[line].strip('\n'))
        except:
            x3 = 0

        Product = product_list(
            mat_no          = Lines01[line].strip('\n'),
            name_th         = Lines02[line].strip('\n'),
            name_en         = Lines03[line].strip('\n'),
            group           = Lines04[line].strip('\n'),
            nickname        = Lines05[line].strip('\n'),
            size            = Lines06[line].strip('\n'),
            wip             = Lines07[line].strip('\n'),
            unitperpallet   = x1,
            weight_unit     = x2,
            weight_pallet   = x3,
            )
        Product.save()

    return HttpResponse("addProduct OK!")