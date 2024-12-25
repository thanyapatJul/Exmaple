from django.db import models

# from django.db import models
# from django.contrib.auth.base_user import BaseUserManager
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

########################################################
#
#
#       User Model
#
#
########################################################
from django_cte import CTEManager, With

class CustomUser(AbstractUser):
    role_id_data=((1,"UserAdmin"),(2,"UserPlaner"),(3,"UserProduction"),(4,"UserLab"),(5,"UserForklift"),(6,"UserManager"),(7,"UserPIS"))
    role_id=models.IntegerField(default=1,choices=role_id_data)
    employee_id=models.CharField(max_length=255)
    

class UserAdmin(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class UserPlaner(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects=models.Manager()
    
class UserProduction(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects = models.Manager()
    
class UserLab(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects = models.Manager()
    
class UserForklift(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects = models.Manager()

class UserManager(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects = models.Manager()

class UserPIS(models.Model):
    id=models.AutoField(primary_key=True)
    admin=models.OneToOneField(CustomUser,on_delete=models.SET_NULL,blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    fcm_token=models.TextField(default="")
    objects = models.Manager()
    
@receiver(post_save,sender=CustomUser)
def create_user_profile(sender,instance,created,**kwargs):
    if created:
        if instance.role_id==1:
            UserAdmin.objects.create(admin=instance)
        if instance.role_id==2:
            UserPlaner.objects.create(admin=instance)
        if instance.role_id==3:
            UserProduction.objects.create(admin=instance)
        if instance.role_id==4:
            UserLab.objects.create(admin=instance)
        if instance.role_id==5:
            UserForklift.objects.create(admin=instance)
        if instance.role_id==6:
            UserManager.objects.create(admin=instance)
        if instance.role_id==7:
            UserPIS.objects.create(admin=instance)
            

@receiver(post_save,sender=CustomUser)
def save_user_profile(sender,instance,**kwargs):
    if instance.role_id==1:
        instance.useradmin.save()
    if instance.role_id==2:
        instance.userplaner.save()
    if instance.role_id==3:
        instance.userproduction.save()
    if instance.role_id==4:
        instance.userlab.save()
    if instance.role_id==5:
        instance.userforklift.save()
    if instance.role_id==6:
        instance.usermanager.save()
    if instance.role_id==7:
        instance.userpis.save()

########################################################
#
#
#       SATAE Model
#
#
########################################################


# class Warehouse(models.Model):
#     name = models.CharField(max_length=255)

# # รายละเอียดบริเวณภายในคลัง
# class Zone(models.Model):
#     name = models.CharField(max_length=255)
#     warehouse = models.ForeignKey(Warehouse, related_name='zones', on_delete=models.SET_NULL,blank=True,null=True)

# class Product(models.Model):
#     name = models.CharField(max_length=255)
#     description = models.TextField()
#     # lab = models.BooleanField(default=False)
#     # lock = models.BooleanField(default=False)
# # รายละเอียดแต่ละสถานที่ในคลังสินค้า
# class Storage_info(models.Model):
#     created_at = models.DateTimeField(auto_now_add=True,null=True)
#     zone = models.ForeignKey(Zone, related_name='storages', on_delete=models.SET_NULL,blank=True,null=True)
#     row = models.IntegerField()
#     column = models.IntegerField()
#     mapid = models.CharField(max_length=200, blank=True, null=True)
#     level = models.IntegerField()
#     product = models.ForeignKey(Product, related_name='storages', on_delete=models.SET_NULL, null=True, blank=True)
#     lab = models.BooleanField(default=False)
#     lock = models.BooleanField(default=False)



########################################################
#
#
#       Planner Model
#
#
########################################################

class PlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pdplan_machine = models.CharField(max_length=100)
    pdplan_date = models.DateField()
    pdplan_shift = models.CharField(max_length=100)
    pdplan_operator = models.CharField(max_length=100)
    pdplan_planapprove = models.CharField(max_length=100)
    pdplan_labapprove = models.CharField(max_length=100)
    pdplan_delete = models.CharField(max_length=100)
    pdplan_delete_operator = models.CharField(max_length=100,blank=True, null=True)
    pdplan_delete_datetime =models.DateTimeField(blank=True, null=True)
    pdplan_status_1 = models.CharField(max_length=100,blank=True, null=True)
    pdplan_status_2 = models.CharField(max_length=100,blank=True, null=True)
    pdplan_status_3 = models.CharField(max_length=100,blank=True, null=True)
    status_1 = models.CharField(max_length=100,blank=True, null=True)
    status_2 = models.CharField(max_length=100,blank=True, null=True)
    status_3 = models.CharField(max_length=100,blank=True, null=True)
    status_edit = models.CharField(max_length=100,blank=True, null=True)

#
#   List Fill Plan
#

class ListFillPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    qty_good = models.IntegerField(blank=True, null=True)
    qty_loss = models.IntegerField(blank=True, null=True)
    qty_lab = models.IntegerField(blank=True, null=True)

    offset_pallet_no = models.IntegerField(blank=True, null=True,default=1)

    ticket_problem_yellow = models.CharField(max_length=500,blank=True, null=True)
    ticket_qty_yellow = models.IntegerField(blank=True, null=True)

    ticket_problem_blue = models.CharField(max_length=500,blank=True, null=True)
    ticket_qty_blue = models.IntegerField(blank=True, null=True)

    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)
    carve_date = models.DateField(blank=True, null=True)
    carve_shift = models.CharField(max_length=100,blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)


    fill_success = models.CharField(max_length=100,blank=True, null=True)
    approve_fill = models.CharField(max_length=100,blank=True, null=True)
    operator = models.CharField(max_length=100,blank=True, null=True)
    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    datetime_keyin =models.DateTimeField(blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)
    datetime_approve =models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=100,blank=True, null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    delete_add = models.CharField(max_length=100,blank=True, null=True)

class ListTicketPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    ticket_problem = models.CharField(max_length=500,blank=True, null=True)
    ticket_qty = models.IntegerField(blank=True, null=True)
    ticket_note = models.CharField(max_length=100,blank=True, null=True)
    ticket_approve = models.CharField(max_length=100,blank=True, null=True)
    note_production = models.CharField(max_length=500,blank=True, null=True)
    note_planner = models.CharField(max_length=500,blank=True, null=True)
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)
    carve_date = models.DateField(blank=True, null=True)
    carve_shift = models.CharField(max_length=100,blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)


    fill_success = models.CharField(max_length=100,blank=True, null=True)
    approve_fill = models.CharField(max_length=100,blank=True, null=True)
    operator = models.CharField(max_length=100,blank=True, null=True)
    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    datetime_keyin =models.DateTimeField(blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)
    datetime_approve =models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=100,blank=True, null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    fillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

class ListFillTicketPalletProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    ticket = models.CharField(max_length=100,blank=True, null=True)
    ticket_problem = models.CharField(max_length=500,blank=True, null=True)
    qty_ticket = models.CharField(max_length=100,blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)

    ticket_return_status = models.IntegerField(default=0,blank=True, null=True)
    ticket_return_send = models.IntegerField(default=0,blank=True, null=True)
    fillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    fillticketreturnplan_link = models.ForeignKey(ListTicketPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

#
#   List Withdraw Plan
#

class ListWithdrawPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    qtysend = models.IntegerField(blank=True, null=True)
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    withdraw_keyin = models.CharField(max_length=100,blank=True, null=True)
    withdraw_success = models.CharField(max_length=100,blank=True, null=True)
    approve_withdraw = models.CharField(max_length=100,blank=True, null=True)
    approve_lab = models.CharField(max_length=100,blank=True, null=True)
    operator = models.CharField(max_length=100,blank=True, null=True)
    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    datetime_keyin =models.DateTimeField(blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)
    datetime_approve =models.DateTimeField(blank=True, null=True)
    note_production = models.CharField(max_length=500,blank=True, null=True)
    note_planner = models.CharField(max_length=500,blank=True, null=True)
    status = models.CharField(max_length=100,blank=True, null=True)
    status_1 = models.CharField(max_length=100,blank=True, null=True)
    status_2 = models.CharField(max_length=100,blank=True, null=True)
    status_3 = models.CharField(max_length=100,blank=True, null=True)
    have_processlock = models.CharField(max_length=100,blank=True, null=True)
    delete_add = models.CharField(max_length=100,blank=True, null=True)
    
    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True
    )

#
#   Return Plan
#
    




class LabStatus(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    product_type = models.CharField(max_length=100,blank=True, null=True)
    zca_no = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    pallet = models.IntegerField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    batch = models.CharField(max_length=100,blank=True, null=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    note = models.CharField(max_length=100,blank=True, null=True)

    status_lock = models.BooleanField(blank=True,null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listgood_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    tiger_fillplan_link = models.CharField(max_length=100,blank=True, null=True) # models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

class LabDetail(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    zca_no = models.CharField(max_length=100,blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    status_lock = models.BooleanField(blank=True,null=True)
    note_lock = models.CharField(max_length=100,blank=True, null=True)

    labstatus_link = models.ForeignKey(LabStatus, on_delete=models.SET_NULL,blank=True,null=True)



########################################################
#
#
#       For forklift
#
#
########################################################




########################################################
#
#
#       For Map Model
#
#
########################################################
class Warehouse(models.Model):
    name = models.CharField(max_length=255)
    type_warehouse = models.CharField(max_length=255,null=True, blank=True)

class Zone(models.Model):
    name = models.CharField(max_length=255)
    warehouse = models.ForeignKey(Warehouse, related_name='zones', on_delete=models.SET_NULL,blank=True,null=True)

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

class Storage_info(models.Model):
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    zone = models.ForeignKey(Zone, related_name='storages', on_delete=models.SET_NULL,blank=True,null=True)
    row = models.IntegerField()
    column = models.IntegerField()
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField()
    product = models.ForeignKey(Product, related_name='storages', on_delete=models.SET_NULL, null=True, blank=True)
    lab = models.BooleanField(default=False)
    lock = models.BooleanField(default=False)


class MapListFillPlan(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    work_type = models.CharField(max_length=100,blank=True, null=True)

    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)

    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    ticket_problem = models.CharField(max_length=500,blank=True, null=True)

    qty_format = models.IntegerField(blank=True, null=True)
    qty_good = models.IntegerField(blank=True, null=True)
    qty_loss = models.IntegerField(blank=True, null=True)
    qty_lab = models.IntegerField(blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)

    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listticketplan_link = models.ForeignKey(ListTicketPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    
    labstatus_link = models.ForeignKey(LabStatus, on_delete=models.SET_NULL,blank=True,null=True)

    operator_fill = models.CharField(max_length=100,blank=True, null=True)
    operator_approve_fill = models.CharField(max_length=100,blank=True, null=True)

    status = models.CharField(max_length=100,blank=True, null=True)

class MapListFillPallet(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    work_type = models.CharField(max_length=100,blank=True, null=True)

    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)

    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    ticket_problem = models.CharField(max_length=500,blank=True, null=True)

    qty = models.IntegerField(blank=True, null=True)

    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    pallet_no = models.IntegerField(blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listticketplan_link = models.ForeignKey(ListTicketPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    # listlabreturnticketplan_link = models.ForeignKey(ListLabReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistfillplan_link = models.ForeignKey(MapListFillPlan,on_delete=models.SET_NULL,blank=True,null=True)

    sub_column = models.IntegerField(blank=True,null=True,default=1)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL,blank=True,null=True)
    zone = models.CharField(max_length=100,blank=True, null=True)
    row = models.IntegerField(blank=True,null=True)
    column = models.IntegerField(blank=True,null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField(blank=True,null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    lab = models.BooleanField(default=False,blank=True,null=True)
    lock = models.BooleanField(default=False,blank=True,null=True)
    success = models.BooleanField(default=False,blank=True,null=True)

class MapListWithdrawPlan(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)

    qty = models.IntegerField(blank=True, null=True)
    qty_total_pallet = models.IntegerField(blank=True, null=True)
    qty_format = models.CharField(max_length=100,blank=True, null=True)

    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)
    
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    lab_approve = models.CharField(max_length=100,blank=True, null=True)

    withdraw_success = models.BooleanField(default=False,blank=True,null=True)
    listwithdraw_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    labstatus_link = models.ForeignKey(LabStatus, on_delete=models.SET_NULL,blank=True,null=True)

class MapListTransferPlan(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    transfer_success = models.BooleanField(default=False,blank=True,null=True)
    total_job = models.IntegerField(blank=True, null=True)



class MapListWithdrawPallet(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)

    lab_approve = models.CharField(max_length=100,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True) 
    listgood_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

    labstatus_link = models.ForeignKey(LabStatus, on_delete=models.SET_NULL,blank=True,null=True)
    
    listwithdraw_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    
    maplistwithdrawplan_link = models.ForeignKey(MapListWithdrawPlan, on_delete=models.SET_NULL,blank=True,null=True)
    fillplan_link = models.ForeignKey(MapListFillPlan, on_delete=models.SET_NULL,blank=True,null=True)
    
    machine_to = models.CharField(max_length=100,blank=True, null=True)

    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL,blank=True,null=True)
    zone = models.CharField(max_length=100,blank=True, null=True)
    row = models.IntegerField(blank=True,null=True)
    column = models.IntegerField(blank=True,null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField(blank=True,null=True)
    sub_column = models.IntegerField(blank=True,null=True,default=1)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    lab = models.BooleanField(default=False,blank=True,null=True)
    lock = models.BooleanField(default=False,blank=True,null=True)
    success = models.BooleanField(default=False,blank=True,null=True)
    map_approve = models.IntegerField(default=0,null=True)

class map_location_info(models.Model):
    id = models.AutoField(primary_key=True)
    x_position = models.FloatField(blank=True,null=True)
    y_position = models.FloatField(blank=True,null=True)
    max_level = models.IntegerField(blank=True,null=True)
    size = models.FloatField(blank=True,null=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL,blank=True,null=True)
    zone = models.CharField(max_length=100,blank=True, null=True)
    row = models.IntegerField(blank=True,null=True)
    column = models.IntegerField(blank=True,null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    # level = models.IntegerField(blank=True,null=True)
    actual_size = models.FloatField(blank=True,null=True)
    sub_column = models.IntegerField(blank=True,null=True)
    type_location = models.CharField(max_length=10, blank=True, null=True)

    height = models.FloatField(blank=True,null=True)
    width = models.FloatField(blank=True,null=True)
    activate = models.BooleanField(default=True,null=True)

class MapListTransferPallet(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    lab_approve = models.CharField(max_length=100,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True) 
    listgood_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    labstatus_link = models.ForeignKey(LabStatus, on_delete=models.SET_NULL,blank=True,null=True)
    maplisttransferplan_link = models.ForeignKey(MapListTransferPlan, on_delete=models.SET_NULL,blank=True,null=True)
    maplistmanagement_link = models.IntegerField(blank=True, null=True)

    type_transfer = models.CharField(max_length=100,blank=True, null=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL,blank=True,null=True)
    zone = models.CharField(max_length=100,blank=True, null=True)
    row = models.IntegerField(blank=True,null=True)
    column = models.IntegerField(blank=True,null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField(blank=True,null=True)
    sub_column = models.IntegerField(blank=True,null=True,default=1)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    lab = models.IntegerField(default=0,blank=True,null=True)
    lock = models.BooleanField(default=False,blank=True,null=True)
    success = models.BooleanField(default=False,blank=True,null=True)
    map_approve = models.IntegerField(default=0,null=True)


class EmergencyQrcode(models.Model):
    id = models.AutoField(db_column='id',primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    zca = models.CharField(max_length=15, db_collation='Thai_CI_AS')
    img = models.TextField(db_collation='Thai_CI_AS')
    forklift_id = models.CharField(max_length=100, db_collation='Thai_CI_AS')
    status = models.CharField(max_length=100, db_collation='Thai_CI_AS',null=True)

    class Meta:
        managed = False
        db_table = 'Emergency_QRcode'

class Forklift_Worklist(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listgood_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    
    maplistfillplan_link = models.ForeignKey(MapListFillPlan, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawplan_link = models.ForeignKey(MapListWithdrawPlan, on_delete=models.SET_NULL,blank=True,null=True)
    maplisttransferplan_link = models.ForeignKey(MapListTransferPlan, on_delete=models.SET_NULL,blank=True,null=True)

    maplistfillpallet_link = models.ForeignKey(MapListFillPallet, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawpallet_link = models.ForeignKey(MapListWithdrawPallet, on_delete=models.SET_NULL,blank=True,null=True)
    maplisttransferpallet_link = models.ForeignKey(MapListTransferPallet, on_delete=models.SET_NULL,blank=True,null=True)


    type_transport = models.CharField(max_length=100,blank=True, null=True)
    
    from_location = models.CharField(max_length=100,blank=True, null=True)
    to_location = models.CharField(max_length=100,blank=True, null=True)

    forklift_success = models.BooleanField(default=False,blank=True,null=True)

    forklift_force = models.BooleanField(default=False,blank=True,null=True)
    forklift_force_time = models.DateTimeField(blank=True, null=True)
    forklift_force_operator = models.CharField(max_length=100,blank=True, null=True)

    forklift_scan_check = models.IntegerField(blank=True, null=True)
    forklift_scan_check_time = models.DateTimeField(blank=True, null=True)
    forklift_scan_check_operator = models.CharField(max_length=100,blank=True, null=True)

    forklift_scan_location = models.IntegerField(blank=True, null=True)
    forklift_scan_location_time = models.DateTimeField(blank=True, null=True)
    forklift_scan_location_operator = models.CharField(max_length=100,blank=True, null=True)

    forklift_scan_finish = models.IntegerField(blank=True, null=True)
    forklift_scan_finish_time = models.DateTimeField(blank=True, null=True)
    forklift_scan_finish_operator = models.CharField(max_length=100,blank=True, null=True)

    forklift_truck = models.IntegerField(blank=True, null=True)
    forklift_truck_up_time = models.DateTimeField(blank=True, null=True)
    forklift_truck_up_operator = models.CharField(max_length=100,blank=True, null=True)
    forklift_truck_down_time = models.DateTimeField(blank=True, null=True)
    forklift_truck_down_operator = models.CharField(max_length=100,blank=True, null=True)





class Map_management(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    ticket_type = models.CharField(max_length=100,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    lab_approve = models.CharField(max_length=100,blank=True, null=True)
    
    listgood_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

    maplistfillplan_link = models.ForeignKey(MapListFillPlan, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawplan_link = models.ForeignKey(MapListWithdrawPlan, on_delete=models.SET_NULL,blank=True,null=True)
    maplisttransferplan_link = models.ForeignKey(MapListTransferPlan, on_delete=models.SET_NULL,blank=True,null=True)
    
    maplistfillpallet_link = models.ForeignKey(MapListFillPallet, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawpallet_link = models.ForeignKey(MapListWithdrawPallet, on_delete=models.SET_NULL,blank=True,null=True)
    maplisttransferpallet_link = models.ForeignKey(MapListTransferPallet, on_delete=models.SET_NULL,blank=True,null=True)
    kgpcs = models.FloatField(blank=True, null=True)


    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL,blank=True,null=True)
    zone = models.CharField(max_length=100,blank=True, null=True)
    row = models.IntegerField(blank=True,null=True)
    column = models.IntegerField(blank=True,null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField(blank=True,null=True)
    sub_column = models.IntegerField(blank=True,null=True,default=1)
    damaged = models.BooleanField(default=False,blank=True,null=True)

### sub_col = 1 /// มี 1 หรือ ไม่มี sub column
### sub_col = 2 /// มี 2
### sub_col = 3 /// มี 3
    lab = models.IntegerField(default=0,blank=True,null=True)
    lock = models.BooleanField(default=False,blank=True,null=True)
    success = models.BooleanField(default=False,blank=True,null=True)
    map_approve = models.IntegerField(default=0,null=True)
    forklift_link = models.ForeignKey(Forklift_Worklist, on_delete=models.SET_NULL,blank=True,null=True)

    action_type = models.CharField(max_length=100,blank=True, null=True)



class FGPlanningStock(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)

    location_1_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_1_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_1_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_1_info = models.CharField(max_length=600,blank=True, null=True)

    location_2_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_2_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_2_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_2_info = models.CharField(max_length=600,blank=True, null=True)

    location_3_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_3_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_3_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_3_info = models.CharField(max_length=600,blank=True, null=True)

    location_4_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_4_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_4_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_4_info = models.CharField(max_length=600,blank=True, null=True)

    location_5_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_5_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_5_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_5_info = models.CharField(max_length=600,blank=True, null=True)

    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

class FGPlanningStockTicket(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)

    location_1_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_1_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_1_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_1_info = models.CharField(max_length=600,blank=True, null=True)

    location_2_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_2_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_2_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_2_info = models.CharField(max_length=600,blank=True, null=True)

    location_3_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_3_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_3_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_3_info = models.CharField(max_length=600,blank=True, null=True)

    location_4_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_4_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_4_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_4_info = models.CharField(max_length=600,blank=True, null=True)

    location_5_select_1 = models.CharField(max_length=300,blank=True, null=True)
    location_5_select_2 = models.CharField(max_length=300,blank=True, null=True)
    location_5_select_3 = models.CharField(max_length=300,blank=True, null=True)
    location_5_info = models.CharField(max_length=600,blank=True, null=True)

    listticketplan_link = models.ForeignKey(ListTicketPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

class DontsendData(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    machine = models.CharField(max_length=100,blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    shift = models.CharField(max_length=100,blank=True, null=True)

    fill = models.CharField(max_length=100,blank=True, null=True)
    withdraw = models.CharField(max_length=100,blank=True, null=True)

    operator = models.CharField(max_length=100,blank=True, null=True)





class ListReturnPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    
    qty_good = models.IntegerField(blank=True, null=True)
    qty_good_format = models.CharField(max_length=100,blank=True, null=True)
    qty_bad = models.IntegerField(blank=True, null=True)
    qty_bad_format = models.CharField(max_length=100,blank=True, null=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    return_shift = models.CharField(max_length=100,blank=True, null=True)

    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    return_keyin = models.CharField(max_length=100,blank=True, null=True)
    return_approve = models.CharField(max_length=100,blank=True, null=True)

    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)

    note_production = models.CharField(max_length=300,blank=True, null=True)
    note_planner = models.CharField(max_length=300,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    withdrawplan_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

class ListReturnPalletProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)

    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)

    qty = models.IntegerField(blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    pallet_no = models.IntegerField(blank=True, null=True)

    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    withdrawplan_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    returnplan_link = models.ForeignKey(ListReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawpallet_link = models.ForeignKey(MapListWithdrawPallet,on_delete=models.SET_NULL,blank=True,null=True)

class ListReturnPlanNoteProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    returnplan_link = models.ForeignKey(ListReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)

    type = models.CharField(max_length=100,blank=True, null=True)
    message = models.CharField(max_length=400,blank=True, null=True)

class ListLabReturnPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    
    qty_good = models.IntegerField(blank=True, null=True)
    qty_good_format = models.CharField(max_length=100,blank=True, null=True)
    qty_bad = models.IntegerField(blank=True, null=True)
    qty_bad_format = models.CharField(max_length=100,blank=True, null=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    return_shift = models.CharField(max_length=100,blank=True, null=True)

    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    return_keyin = models.CharField(max_length=100,blank=True, null=True)
    return_approve = models.CharField(max_length=100,blank=True, null=True)

    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)

    note_production = models.CharField(max_length=300,blank=True, null=True)
    note_planner = models.CharField(max_length=300,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    withdrawplan_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistfillplan_link = models.ForeignKey(MapListFillPlan, on_delete=models.SET_NULL,blank=True,null=True)

class ListLabReturnPalletProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    ticket = models.CharField(max_length=100,blank=True, null=True)
    ticket_problem = models.CharField(max_length=500,blank=True, null=True)
    qty_ticket = models.CharField(max_length=100,blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)

    ticket_return_status = models.IntegerField(default=0,blank=True, null=True)
    ticket_return_send = models.IntegerField(default=0,blank=True, null=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)

    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)

    qty = models.IntegerField(blank=True, null=True)

    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    pallet_no = models.IntegerField(blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    listfillplan_link = models.ForeignKey(ListFillPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    withdrawplan_link = models.ForeignKey(ListWithdrawPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    labreturnplan_link = models.ForeignKey(ListLabReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistwithdrawpallet_link = models.ForeignKey(MapListWithdrawPallet,on_delete=models.SET_NULL,blank=True,null=True)
    maplistfillpallet_link = models.ForeignKey(MapListFillPallet, on_delete=models.SET_NULL,blank=True,null=True)

class ListLabBadUnlockPlanProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    
    qty_good = models.IntegerField(blank=True, null=True)
    qty_good_format = models.CharField(max_length=100,blank=True, null=True)
    qty_bad = models.IntegerField(blank=True, null=True)
    qty_bad_format = models.CharField(max_length=100,blank=True, null=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    return_shift = models.CharField(max_length=100,blank=True, null=True)

    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)

    return_keyin = models.CharField(max_length=100,blank=True, null=True)
    return_approve = models.CharField(max_length=100,blank=True, null=True)

    operator_keyin = models.CharField(max_length=100,blank=True, null=True)
    operator_approve = models.CharField(max_length=100,blank=True, null=True)

    note_production = models.CharField(max_length=300,blank=True, null=True)
    note_planner = models.CharField(max_length=300,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    returnplan_link = models.ForeignKey(ListReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistfillplan_link = models.ForeignKey(MapListFillPlan, on_delete=models.SET_NULL,blank=True,null=True)

class ListLabBadUnlockPalletProduction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    return_machine = models.CharField(max_length=100,blank=True, null=True)
    product_machine = models.CharField(max_length=100,blank=True, null=True)
    zca_on = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    name_en = models.CharField(max_length=400,blank=True, null=True)
    product_type = models.CharField(max_length=100,blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100,blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)

    return_type = models.CharField(max_length=100,blank=True, null=True)


    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100,blank=True, null=True)
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100,blank=True, null=True)

    plan_link = models.ForeignKey(PlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    labunlockbadplan_link = models.ForeignKey(ListLabBadUnlockPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    returnplan_link = models.ForeignKey(ListReturnPlanProduction, on_delete=models.SET_NULL,blank=True,null=True)
    returnpallet_link = models.ForeignKey(ListReturnPalletProduction, on_delete=models.SET_NULL,blank=True,null=True)
    maplistfillpallet_link = models.ForeignKey(MapListFillPallet, on_delete=models.SET_NULL,blank=True,null=True)
    


class ParameterSave(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    key = models.CharField(max_length=200,blank=True, null=True)
    value = models.CharField(max_length=200,blank=True, null=True)
    operator = models.CharField(max_length=100,blank=True, null=True)

########################################################
#
#
#       For SAP Model
#
#
########################################################

class BifrostStockBalance(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    zca_no = models.CharField(max_length=100,blank=True, null=True)
    name_th = models.CharField(max_length=400,blank=True, null=True)
    type = models.CharField(max_length=100,blank=True, null=True)
    qty_good = models.IntegerField(blank=True, null=True)
    qty_block = models.IntegerField(blank=True, null=True)
    qty_qi = models.IntegerField(blank=True, null=True)




class ItemMasterProductWIP(models.Model):
    field_id = models.AutoField(db_column='id',primary_key=True)
    field_zca = models.TextField(db_column='zca', blank=True, null=True)
    field_mc = models.TextField(db_column='mc', blank=True, null=True)

    field_name = models.TextField(db_column='NameThai', blank=True, null=True)  # Field name made lowercase.
    field_nameeng = models.TextField(db_column='NameEng', blank=True, null=True)  # Field name made lowercase.
    field_type = models.TextField(db_column='type',blank=True, null=True)
    brand = models.TextField(blank=True, null=True)
    field_prodgroup = models.TextField(db_column='ProdGroup', blank=True, null=True)  # Field name made lowercase.
    field_prodname = models.TextField(db_column='Prodname', blank=True, null=True)  # Field name made lowercase.
    field_size = models.TextField(db_column='Size', blank=True, null=True)  # Field name made lowercase.
    field_length = models.IntegerField(db_column='Length', blank=True, null=True)  # Field name made lowercase.
    field_lengthpallet = models.IntegerField(db_column='LengthPallet', blank=True, null=True)  # Field name made lowercase.
    field_pcspallet = models.IntegerField(db_column='PcsPallet', blank=True, null=True)  # Field name made lowercase.
    field_layer = models.IntegerField(db_column='Layer', blank=True, null=True)  # Field name made lowercase.
    field_kgpcs = models.TextField(db_column='KgPcs', blank=True, null=True)  # Field name made lowercase.
    pcsperpallet = models.IntegerField(db_column='PCsPerPallet', blank=True, null=True)  # Field name made lowercase.
    type1 = models.TextField(db_column='Type1', blank=True, null=True)  # Field name made lowercase.
    tickness = models.IntegerField(db_column='Tickness', blank=True, null=True)  # Field name made lowercase.
    ct1 = models.TextField(db_column='CT1', blank=True, null=True)  # Field name made lowercase.
    ct2 = models.TextField(db_column='CT2', blank=True, null=True)  # Field name made lowercase.
    ct3 = models.TextField(db_column='CT3', blank=True, null=True)  # Field name made lowercase.
    ct4 = models.TextField(db_column='CT4', blank=True, null=True)  # Field name made lowercase.
    xy1 = models.TextField(db_column='XY1', blank=True, null=True)  # Field name made lowercase.
    cm5 = models.TextField(db_column='CM5', blank=True, null=True)  # Field name made lowercase.
    cm6 = models.TextField(db_column='CM6', blank=True, null=True)  # Field name made lowercase.
    cm7 = models.TextField(db_column='CM7', blank=True, null=True)  # Field name made lowercase.
    cm8 = models.TextField(db_column='CM8', blank=True, null=True)  # Field name made lowercase.
    as1 = models.TextField(db_column='AS1', blank=True, null=True)  # Field name made lowercase.
    pk1 = models.TextField(db_column='PK1', blank=True, null=True)  # Field name made lowercase.
    pk2 = models.TextField(db_column='PK2', blank=True, null=True)  # Field name made lowercase.
    pk3 = models.TextField(db_column='PK3', blank=True, null=True)  # Field name made lowercase.
    pk4 = models.TextField(db_column='PK4', blank=True, null=True)  # Field name made lowercase.
    pk5 = models.TextField(db_column='PK5', blank=True, null=True)  # Field name made lowercase.
    dp1 = models.TextField(db_column='DP1', blank=True, null=True)  # Field name made lowercase.
    det = models.TextField(db_column='DET', blank=True, null=True)  # Field name made lowercase.
    ms1 = models.TextField(db_column='MS1', blank=True, null=True)  # Field name made lowercase.
    oc1 = models.TextField(db_column='OC1', blank=True, null=True)  # Field name made lowercase.
    oc2 = models.TextField(db_column='OC2', blank=True, null=True)  # Field name made lowercase.
    os1 = models.TextField(db_column='OS1', blank=True, null=True)  # Field name made lowercase.
    pl1 = models.TextField(db_column='PL1', blank=True, null=True)  # Field name made lowercase.
    rt1 = models.TextField(db_column='RT1', blank=True, null=True)  # Field name made lowercase.
    rt2 = models.TextField(db_column='RT2', blank=True, null=True)  # Field name made lowercase.
    sd1 = models.TextField(db_column='SD1', blank=True, null=True)  # Field name made lowercase.
    seg = models.TextField(db_column='SEG', blank=True, null=True)  # Field name made lowercase.
    dp2 = models.TextField(db_column='DP2', blank=True, null=True)  # Field name made lowercase.
    pk6 = models.TextField(db_column='PK6', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ItemMasterProductWIP'


class ItemMasterProductFG(models.Model):
    id = models.AutoField(db_column='id',primary_key=True)
    zca = models.CharField(max_length=15, db_collation='Thai_CI_AS')
    name = models.CharField(max_length=53, db_collation='Thai_CI_AS')
    type = models.CharField(max_length=5, db_collation='Thai_CI_AS')
    pcpallet = models.IntegerField()
    zcacustomer = models.CharField(max_length=14, db_collation='Thai_CI_AS', blank=True, null=True)
    kg = models.DecimalField(max_digits=7, decimal_places=4, blank=True, null=True)
    brand = models.CharField(max_length=4, db_collation='Thai_CI_AS')
    om = models.CharField(max_length=4, db_collation='Thai_CI_AS', blank=True, null=True)   
    format = models.CharField(max_length=4, db_collation='Thai_CI_AS')
    tis = models.CharField(db_column='TIS', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    namethai = models.CharField(max_length=42, db_collation='Thai_CI_AS')
    nameen = models.CharField(max_length=40, db_collation='Thai_CI_AS')
    size = models.CharField(max_length=16, db_collation='Thai_CI_AS')
    sizemm = models.CharField(max_length=16, db_collation='Thai_CI_AS', blank=True, null=True)
    nickname = models.CharField(max_length=5, db_collation='Thai_CI_AS', blank=True, null=True)
    csr = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=4, db_collation='Thai_CI_AS', blank=True, null=True)
    hs3_tl = models.CharField(db_column='HS3_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs4_tl = models.CharField(db_column='HS4_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs5_tl = models.CharField(db_column='HS5_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs6_tl = models.CharField(db_column='HS6_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs7_tl = models.CharField(db_column='HS7_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs8_tl = models.CharField(db_column='HS8_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs9_tl = models.CharField(db_column='HS9_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    ct1_tl = models.CharField(db_column='CT1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    ct2_tl = models.CharField(db_column='CT2_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    ct3_tl = models.CharField(db_column='CT3_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    ct4_tl = models.CharField(db_column='CT4_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    cm5_tl = models.CharField(db_column='CM5_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    cm6_tl = models.CharField(db_column='CM6_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    cm7_tl = models.CharField(db_column='CM7_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    cm8_tl = models.CharField(db_column='CM8_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    dp1_tl = models.CharField(db_column='DP1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    dp2_tl = models.CharField(db_column='DP2_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    det_tl = models.CharField(db_column='DET_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    ms1_tl = models.CharField(db_column='MS1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    oc1_tl = models.CharField(db_column='OC1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    oc2_tl = models.CharField(db_column='OC2_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    os1_tl = models.CharField(db_column='OS1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk1_tl = models.CharField(db_column='PK1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk2_tl = models.CharField(db_column='PK2_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk3_tl = models.CharField(db_column='PK3_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk4_tl = models.CharField(db_column='PK4_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk5_tl = models.CharField(db_column='PK5_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pk6_tl = models.CharField(db_column='PK6_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    pl1_tl = models.CharField(db_column='PL1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    rt1_tl = models.CharField(db_column='RT1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    rt2_tl = models.CharField(db_column='RT2_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    sd1_tl = models.CharField(db_column='SD1_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    seg_tl = models.CharField(db_column='SEG_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ItemMasterProductFG'


class ProductFrom(models.Model):
    id = models.IntegerField(primary_key=True)
    zca = models.TextField(blank=True, null=True)
    mc = models.TextField(blank=True, null=True)
    name = models.TextField(blank=True, null=True)
    brand = models.TextField(blank=True, null=True)
    type = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Product_from'


########################################################
#
#
#       PIS Model
#
#
########################################################


# class ViewActiveplan(models.Model):
#     company = models.TextField(db_column='Company', blank=True, null=True)  # Field name made lowercase.
#     plant = models.IntegerField(db_column='Plant', blank=True, null=True)  # Field name made lowercase.
#     shift = models.TextField(db_column='Shift', blank=True, null=True)  # Field name made lowercase.
#     planweek = models.TextField(db_column='PlanWeek', blank=True, null=True)  # Field name made lowercase.
#     versionno = models.IntegerField(db_column='VersionNo', blank=True, null=True)  # Field name made lowercase.
#     planname = models.TextField(db_column='PlanName', blank=True, null=True)  # Field name made lowercase.
#     machine = models.TextField(db_column='Machine', blank=True, null=True)  # Field name made lowercase.
#     materialcode = models.TextField(db_column='MaterialCode', blank=True, null=True)  # Field name made lowercase.
#     materialname = models.TextField(db_column='MaterialName', blank=True, null=True)  # Field name made lowercase.
#     planweight = models.TextField(db_column='PlanWeight', blank=True, null=True)  # Field name made lowercase.
#     plancount = models.FloatField(db_column='PlanCount', blank=True, null=True)  # Field name made lowercase.
#     starttime = models.TextField(db_column='StartTime', blank=True, null=True)  # Field name made lowercase.
#     duration = models.FloatField(db_column='Duration', blank=True, null=True)  # Field name made lowercase.
#     operationcode = models.TextField(db_column='OperationCode', blank=True, null=True)  # Field name made lowercase.
#     setupduration = models.FloatField(db_column='SetupDuration', blank=True, null=True)  # Field name made lowercase.
#     cleaningduration = models.FloatField(db_column='CleaningDuration', blank=True, null=True)  # Field name made lowercase.
#     startupduration = models.FloatField(db_column='StartupDuration', blank=True, null=True)  # Field name made lowercase.
#     ms = models.FloatField(db_column='MS', blank=True, null=True)  # Field name made lowercase.
#     es = models.FloatField(db_column='ES', blank=True, null=True)  # Field name made lowercase.
#     os = models.FloatField(db_column='OS', blank=True, null=True)  # Field name made lowercase.
#     mc = models.FloatField(db_column='MC', blank=True, null=True)  # Field name made lowercase.
#     ec = models.FloatField(db_column='EC', blank=True, null=True)  # Field name made lowercase.
#     oc = models.FloatField(db_column='OC', blank=True, null=True)  # Field name made lowercase.
#     msu = models.FloatField(db_column='MSU', blank=True, null=True)  # Field name made lowercase.
#     esu = models.FloatField(db_column='ESU', blank=True, null=True)  # Field name made lowercase.
#     osu = models.FloatField(db_column='OSU', blank=True, null=True)  # Field name made lowercase.
#     contractor = models.TextField(db_column='Contractor', blank=True, null=True)  # Field name made lowercase.
#     buname = models.TextField(db_column='BUName', blank=True, null=True)  # Field name made lowercase.
#     description = models.TextField(db_column='Description', blank=True, null=True)  # Field name made lowercase.

#     class Meta:
#         managed = False
#         db_table = 'View_activeplan'

class ProcessLock(models.Model):
    field_id = models.AutoField(db_column='id',primary_key=True) # Field renamed because it started with ''.
    field_mc = models.TextField(db_column='MC', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_typeno = models.IntegerField(db_column='TYPENO', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_type = models.TextField(db_column='TYPE', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_zca = models.TextField(db_column='ZCA', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_name = models.TextField(db_column='NAME', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_source = models.TextField(db_column='SOURCE', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    field_destination = models.TextField(db_column='DESTINATION', blank=True, null=True)  # Field name made lowercase. Field renamed because it started with ''.
    planid = models.IntegerField(db_column='PlanID', blank=True, null=True)  # Field name made lowercase.
    disable = models.BooleanField(db_column='Discontinue', default=False, blank=True, null=True)  # Set default to False.
    order = models.IntegerField(db_column='OrderNumber', blank=True, null=True)  # Field name made lowercase.
    class Meta:
        managed = False
        db_table = 'ProcessLock'

# class Stockbalancetiger(models.Model):
#     zca = models.TextField(primary_key=True)
#     urstock = models.IntegerField(blank=True, null=True)
#     block = models.IntegerField(blank=True, null=True)
#     qi = models.IntegerField(blank=True, null=True)
#     datetimeupdate = models.TextField(blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'StockbalanceTiger'

# class Stockbalancetiger(models.Model):
#     zca = models.CharField(primary_key=True, max_length=50, db_collation='Thai_CI_AS')
#     urstock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     block = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     qi = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     datetimeupdate = models.DateTimeField(blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'stockbalancefromtiger'

# class Stockbalancetiger(models.Model):
#     zca = models.CharField(primary_key=True, max_length=50, db_collation='Thai_CI_AS')
#     urstock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     block = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     qi = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     datetimeupdate = models.DateTimeField(blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'StockbalanceTiger'

# class Stockbalancetiger(models.Model):
#     zca = models.CharField(primary_key=True, max_length=50, db_collation='Thai_CI_AS')
#     urstock = models.IntegerField(blank=True, null=True)
#     block = models.IntegerField(blank=True, null=True)
#     qi = models.IntegerField(blank=True, null=True)
#     datetimeupdate = models.DateTimeField(blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'StockbalanceTiger'


# class GoodsReceiveToTiger(models.Model):
#     idmainfromwms = models.CharField(max_length=50, db_collation='Thai_CI_AS')
#     usermachine = models.CharField(max_length=50, db_collation='Thai_CI_AS')
#     matno = models.CharField(max_length=50, db_collation='Thai_CI_AS')
#     matname = models.CharField(max_length=100, db_collation='Thai_CI_AS')
#     qty = models.IntegerField(blank=True, null=True)
#     gdate = models.DateField()
#     shift = models.CharField(max_length=1, db_collation='Thai_CI_AS')
#     machine = models.CharField(max_length=3, db_collation='Thai_CI_AS')
#     typeproduct = models.CharField(max_length=3, db_collation='Thai_CI_AS')
#     qtyw = models.IntegerField(blank=True, null=True)
#     qtye = models.IntegerField(blank=True, null=True)
#     typez = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     dateproductionz = models.DateField(blank=True, null=True)
#     shiftproductionz = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     month = models.CharField(max_length=2, db_collation='Thai_CI_AS', blank=True, null=True)
#     pallet = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     ton = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
#     batch = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     approver = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     datetimewmssend = models.DateTimeField()
#     tigerpart = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     status = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     datesapgr = models.DateField(blank=True, null=True)
#     timesapgr = models.TimeField(blank=True, null=True)
#     matdocgr = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'goodsreceive_to_tiger'

# class LockTiger(models.Model):
#     id_goodsreceive_to_tiger = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     idmainfromwms_goodsreceive_to_tiger = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     matno = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     matname = models.CharField(max_length=100, db_collation='Thai_CI_AS', blank=True, null=True)
#     dateproductionz = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     shiftproductionz = models.CharField(max_length=1, db_collation='Thai_CI_AS', blank=True, null=True)
#     machine = models.CharField(max_length=3, db_collation='Thai_CI_AS', blank=True, null=True)
#     datelock = models.DateField(blank=True, null=True)
#     qtylock = models.IntegerField(blank=True, null=True)
#     notelock = models.CharField(max_length=100, db_collation='Thai_CI_AS', blank=True, null=True)
#     statuslock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet01 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet02 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet03 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet04 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet05 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet06 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet07 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet08 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet09 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet10 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet11 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet12 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet13 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet14 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet15 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet16 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet17 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet18 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet19 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet20 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet21 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet22 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet23 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet24 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet25 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet26 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet27 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet28 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet29 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet30 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet31 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet32 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet33 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet34 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet35 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet36 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet37 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet38 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet39 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet40 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet41 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet42 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet43 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet44 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet45 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet46 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet47 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet48 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet49 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet50 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet51 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet52 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet53 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet54 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet55 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet56 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet57 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet58 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet59 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet60 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet61 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet62 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet63 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet64 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet65 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet66 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet67 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet68 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet69 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet70 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet71 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet72 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet73 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet74 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet75 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet76 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet77 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet78 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet79 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet80 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet81 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet82 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet83 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet84 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet85 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet86 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet87 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet88 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet89 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet90 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet91 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet92 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet93 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet94 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet95 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet96 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet97 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet98 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
#     numberpallet99 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = 'lock_tiger'

########################################################
#
#
#       Tiger Model
#
#
########################################################

class Tiger_GoodsIssue(models.Model):
    idmainfromwms = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    usermachine = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    machine = models.CharField(max_length=3, db_collation='Thai_CI_AS')
    gdate = models.DateField()
    shift = models.CharField(max_length=1, db_collation='Thai_CI_AS')
    matno = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    matname = models.CharField(max_length=100, db_collation='Thai_CI_AS')
    qty = models.IntegerField()
    pallet = models.CharField(max_length=10, db_collation='Thai_CI_AS')
    ton = models.DecimalField(max_digits=18, decimal_places=2)
    urinsert = models.IntegerField()
    blockinsert = models.IntegerField()
    approver = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    datetimewmssend = models.DateTimeField()
    tigerpart = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    status = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    datesapgi = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    timesapgi = models.TimeField(blank=True, null=True)
    matdocgi = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tiger_goodsissue'


class Tiger_GoodsReceive(models.Model):
    idmainfromwms = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    usermachine = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    matno = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    matname = models.CharField(max_length=100, db_collation='Thai_CI_AS')
    qty = models.IntegerField(blank=True, null=True)
    gdate = models.DateField()
    shift = models.CharField(max_length=1, db_collation='Thai_CI_AS')
    machine = models.CharField(max_length=3, db_collation='Thai_CI_AS')
    typeproduct = models.CharField(max_length=3, db_collation='Thai_CI_AS')
    qtyw = models.IntegerField(blank=True, null=True)
    qtye = models.IntegerField(blank=True, null=True)
    typez = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    dateproductionz = models.DateField(blank=True, null=True)
    shiftproductionz = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    month = models.CharField(max_length=2, db_collation='Thai_CI_AS', blank=True, null=True)
    pallet = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    ton = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    batch = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    approver = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    datetimewmssend = models.DateTimeField()
    tigerpart = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    status = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    datesapgr = models.DateField(blank=True, null=True)
    timesapgr = models.TimeField(blank=True, null=True)
    matdocgr = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    statuslab = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tiger_goodsreceive'


class Tiger_GoodsReturn(models.Model):
    idmainfromwms = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    usermachine = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    datereturn = models.DateField()
    shiftreturn = models.CharField(max_length=1, db_collation='Thai_CI_AS')
    matno = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    matname = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    qtyreturn = models.IntegerField()
    pallet = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    ton = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    batch = models.CharField(max_length=9, db_collation='Thai_CI_AS')
    typereturn = models.CharField(max_length=4, db_collation='Thai_CI_AS')
    notereturn = models.CharField(max_length=100, db_collation='Thai_CI_AS')
    approver = models.CharField(max_length=50, db_collation='Thai_CI_AS')
    datetimewmssend = models.DateTimeField(primary_key=True)
    tigerpart = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    status = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    datesapreturn = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    timesapreturn = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    matdocreturn = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tiger_goodsreturn'


class Tiger_LockPallet(models.Model):
    id_tiger_goodsreceive = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    id_bifrost_goodsreceive = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    matno = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    matname = models.CharField(max_length=100, db_collation='Thai_CI_AS', blank=True, null=True)
    dateproductionz = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    shiftproductionz = models.CharField(max_length=1, db_collation='Thai_CI_AS', blank=True, null=True)
    machine = models.CharField(max_length=3, db_collation='Thai_CI_AS', blank=True, null=True)
    datelock = models.DateField(blank=True, null=True)
    qtylock = models.IntegerField(blank=True, null=True)
    notelock = models.CharField(max_length=100, db_collation='Thai_CI_AS', blank=True, null=True)
    statuslock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet01 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet02 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet03 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet04 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet05 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet06 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet07 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet08 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet09 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet10 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet11 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet12 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet13 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet14 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet15 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet16 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet17 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet18 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet19 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet20 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet21 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet22 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet23 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet24 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet25 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet26 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet27 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet28 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet29 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet30 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet31 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet32 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet33 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet34 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet35 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet36 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet37 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet38 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet39 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet40 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet41 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet42 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet43 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet44 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet45 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet46 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet47 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet48 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet49 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet50 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet51 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet52 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet53 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet54 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet55 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet56 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet57 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet58 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet59 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet60 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet61 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet62 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet63 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet64 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet65 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet66 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet67 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet68 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet69 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet70 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet71 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet72 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet73 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet74 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet75 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet76 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet77 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet78 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet79 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet80 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet81 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet82 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet83 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet84 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet85 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet86 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet87 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet88 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet89 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet90 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet91 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet92 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet93 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet94 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet95 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet96 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet97 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet98 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    numberpallet99 = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tiger_lockpallet'


class Tiger_StockBalance(models.Model):
    zca = models.CharField(primary_key=True, max_length=50, db_collation='Thai_CI_AS')
    urstock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    block = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    qi = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    datetimeupdate = models.DateTimeField(blank=True, null=True)
    class Meta:
        managed = False
        db_table = 'tiger_stockbalance'


########################################################
#
#
#       Distance Model
#
#
########################################################

class DistanceList(models.Model):
    warehouse = models.CharField(blank=True, null=True,max_length=50)
    table = models.CharField(blank=True, null=True,max_length=50) 
    type = models.CharField(blank=True, null=True,max_length=50)

class Distance_Main(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_Main'

class Distance_W111_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W111_M'


class Distance_W111_P1(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W111_P1'


class Distance_W111_P2(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W111_P2'


class Distance_W112_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W112_M'


class Distance_W113_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_M'


class Distance_W113_P1(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P1'


class Distance_W113_P2(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P2'


class Distance_W113_P3(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P3'


class Distance_W113_P4(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P4'


class Distance_W113_P5(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P5'


class Distance_W113_P6(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W113_P6'


class Distance_W121_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W121_M'


class Distance_W122_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W122_M'


class Distance_W123_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W123_M'


class Distance_W1_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_M'


class Distance_W1_P1(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P1'


class Distance_W1_P2(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P2'


class Distance_W1_P3(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P3'


class Distance_W1_P4(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P4'


class Distance_W1_P5(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P5'


class Distance_W1_P6(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W1_P6'


class Distance_W3_M(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W3_M'


class Distance_W3_P1(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W3_P1'


class Distance_W3_P2(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W3_P2'


class Distance_W3_P3(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W3_P3'


class Distance_W3_P4(models.Model):
    id = models.AutoField(primary_key=True)
    origin = models.CharField(blank=True, null=True,max_length=100)
    destination = models.CharField(blank=True, null=True,max_length=100)
    distance = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Distance_W3_P4'


class Info_WIPBalance(models.Model):
    id = models.AutoField(primary_key=True)
    plan = models.CharField(blank=True, null=True,max_length=100)
    zca_on = models.CharField(blank=True, null=True,max_length=100)
    name_th = models.CharField(blank=True, null=True,max_length=100)
    priceperunit = models.FloatField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'Info_WIPBalance'

class Info_MCCostcenter(models.Model):
    id = models.AutoField(primary_key=True)
    machine = models.CharField(blank=True, null=True,max_length=100)
    costcenter_machine = models.CharField(blank=True, null=True,max_length=100)
    costcenter_cutlab = models.CharField(blank=True, null=True,max_length=100)
    costcenter_cutbadafter = models.CharField(blank=True, null=True,max_length=100)

    class Meta:
        managed = False
        db_table = 'Info_MCCostcenter'



class Masterwipstk(models.Model):
    hscode = models.CharField(db_column='HsCode', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    hs = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    zca = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    name_th = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    name_en = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    weight_p_stk = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    sqr_p_stk = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    stk_p_shift = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    stk_p_hr = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    ton_p_shift = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    ton_p_hr = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    badge = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    compressed = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'MasterWIPSTK'

class CheckWip(models.Model):
    zca = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    name_th = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    name_eng = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    frozen = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    actual = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    stock = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)
    date_end = models.DateTimeField(blank=True, null=True)
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Check_wip'
        
class Demand(models.Model):
    class_field = models.CharField(db_column='Class', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase. Field renamed because it was a Python reserved word.
    materialcode = models.CharField(db_column='MaterialCode', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    nameth = models.CharField(db_column='NameTH', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    groupdetail = models.CharField(db_column='GroupDetail', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    kg_per_pcs = models.FloatField(db_column='KG_per_PCS', blank=True, null=True)  # Field name made lowercase.
    pcs_pal = models.SmallIntegerField(db_column='PCS_Pal', blank=True, null=True)  # Field name made lowercase.
    sp_short = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Demand'

class ActualMat(models.Model):
    id_actual = models.AutoField(primary_key=True)
    zca = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    th_name = models.CharField(max_length=100, db_collation='Thai_CI_AS', blank=True, null=True)
    product_type = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    stk_actual = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ton = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)
    date_added = models.DateTimeField(blank=True, null=True)
    id_frozen = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'actual_mat'

class FrozenMat(models.Model):
    id_frozen = models.AutoField(primary_key=True)
    zca = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    th_name = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    product_type = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    stk_frozen = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ton = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)
    date_end = models.DateTimeField(blank=True, null=True)
    type = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    submitted = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    planner = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'frozen_mat'

class MaterialModel(models.Model):
    materialid = models.AutoField(db_column='MaterialID', primary_key=True)
    zca = models.CharField(db_column='ZCA', max_length=100, db_collation='Thai_CI_AS')

    class Meta:
        managed = False
        db_table = 'Material'


class MaterialProcess(models.Model):
    parentid = models.ForeignKey(MaterialModel, models.DO_NOTHING, db_column='ParentID', related_name='parent_materials')
    childid = models.ForeignKey(MaterialModel, models.DO_NOTHING, db_column='ChildID', related_name='child_materials')

    class Meta:
        managed = False
        db_table = 'MaterialProcess'
        unique_together = (('parentid', 'childid'),)


class ViewActiveplan(models.Model):
    company = models.CharField(db_column='Company', max_length=20, blank=True, null=True)  # Field name made lowercase.   
    plant = models.CharField(db_column='Plant', max_length=20, blank=True, null=True)  # Field name made lowercase.       
    shift = models.CharField(db_column='Shift', max_length=20, blank=True, null=True)  # Field name made lowercase.       
    planweek = models.CharField(db_column='PlanWeek', max_length=50, blank=True, null=True)  # Field name made lowercase. 
    versionno = models.CharField(db_column='VersionNo', max_length=2, blank=True, null=True)  # Field name made lowercase.    
    planname = models.CharField(db_column='PlanName', max_length=50, blank=True, null=True)  # Field name made lowercase. 
    machine = models.CharField(db_column='Machine', max_length=20, blank=True, null=True)  # Field name made lowercase.   
    materialcode = models.CharField(db_column='MaterialCode', max_length=20, blank=True, null=True)  # Field name made lowercase.
    materialname = models.CharField(db_column='MaterialName', max_length=100, blank=True, null=True)  # Field name made lowercase.
    planweight = models.DecimalField(db_column='PlanWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    plancount = models.DecimalField(db_column='PlanCount', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    starttime = models.DateField(db_column='StartTime', blank=True, null=True)  # Field name made lowercase.
    duration = models.DecimalField(db_column='Duration', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    operationcode = models.CharField(db_column='OperationCode', max_length=20, blank=True, null=True)  # Field name made lowercase.
    setupduration = models.DecimalField(db_column='SetupDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    cleaningduration = models.DecimalField(db_column='CleaningDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    startupduration = models.DecimalField(db_column='StartupDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    ms = models.DecimalField(db_column='MS', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    es = models.DecimalField(db_column='ES', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    os = models.DecimalField(db_column='OS', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    mc = models.DecimalField(db_column='MC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    ec = models.DecimalField(db_column='EC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    oc = models.DecimalField(db_column='OC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    msu = models.DecimalField(db_column='MSU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    esu = models.DecimalField(db_column='ESU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    osu = models.DecimalField(db_column='OSU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    contractor = models.CharField(db_column='Contractor', max_length=20, blank=True, null=True)  # Field name made lowercase.
    buname = models.CharField(db_column='BUName', max_length=50, blank=True, null=True)  # Field name made lowercase.     
    description = models.TextField(db_column='Description', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'View_ActivePlan'



class ViewPisMergereportProduction(models.Model):
    ordernumber = models.CharField(db_column='OrderNumber', max_length=50)  # Field name made lowercase.
    prodorderdate = models.DateField(db_column='ProdOrderDate', blank=True, null=True)  # Field name made lowercase.
    machine = models.CharField(db_column='Machine', max_length=20, blank=True, null=True)  # Field name made lowercase.
    shift = models.CharField(db_column='Shift', max_length=20, blank=True, null=True)  # Field name made lowercase.
    operatorname = models.CharField(db_column='OperatorName', max_length=53, blank=True, null=True)  # Field name made lowercase.
    materialname = models.CharField(db_column='MaterialName', max_length=100, blank=True, null=True)  # Field name made lowercase.
    materialcode = models.CharField(db_column='MaterialCode', max_length=30, blank=True, null=True)  # Field name made lowercase.
    starttime = models.DateTimeField(db_column='StartTime', blank=True, null=True)  # Field name made lowercase.
    duration = models.DecimalField(db_column='Duration', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    runningduration = models.DecimalField(db_column='RunningDuration', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    downtimeduration = models.DecimalField(db_column='DowntimeDuration', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    labtestcount = models.DecimalField(db_column='LabTestCount', max_digits=38, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    goodcount = models.DecimalField(db_column='GoodCount', max_digits=38, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    rejectcount = models.DecimalField(db_column='RejectCount', max_digits=38, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    lockcount = models.DecimalField(db_column='LockCount', max_digits=38, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    น_ำหน_กต_อแผ_น = models.DecimalField(db_column='น้ำหนักต่อแผ่น', max_digits=18, decimal_places=3, blank=True, null=True)  # Field renamed to remove unsuitable characters.
    goodweight = models.DecimalField(db_column='GoodWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    lockweight = models.DecimalField(db_column='LockWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    rejectweight = models.DecimalField(db_column='RejectWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    labtestweight = models.DecimalField(db_column='LabTestWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    allweight = models.DecimalField(db_column='AllWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    gross0count = models.DecimalField(db_column='Gross0Count', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    gross0dryweight = models.DecimalField(db_column='Gross0DryWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    machineid = models.IntegerField(db_column='MachineID', blank=True, null=True)  # Field name made lowercase.
    plant = models.CharField(db_column='Plant', max_length=20, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'View_PIS_MergeReport_Production'



class ViewWmsListfillplanproduction(models.Model):
    # id = models.BigIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    machine = models.CharField(max_length=100, blank=True, null=True)
    zca_on = models.CharField(max_length=100, blank=True, null=True)
    name_th = models.CharField(max_length=400, blank=True, null=True)
    name_en = models.CharField(max_length=400, blank=True, null=True)
    product_type = models.CharField(max_length=100, blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100, blank=True, null=True)
    qty_good = models.IntegerField(blank=True, null=True)
    qty_loss = models.IntegerField(blank=True, null=True)
    qty_lab = models.IntegerField(blank=True, null=True)
    offset_pallet_no = models.IntegerField(blank=True, null=True)
    ticket_problem_yellow = models.CharField(max_length=500, blank=True, null=True)
    ticket_qty_yellow = models.IntegerField(blank=True, null=True)
    ticket_problem_blue = models.CharField(max_length=500, blank=True, null=True)
    ticket_qty_blue = models.IntegerField(blank=True, null=True)
    send_date = models.DateField(blank=True, null=True)
    send_shift = models.CharField(max_length=100, blank=True, null=True)
    carve_date = models.DateField(blank=True, null=True)
    carve_shift = models.CharField(max_length=100, blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)
    fill_success = models.CharField(max_length=100, blank=True, null=True)
    approve_fill = models.CharField(max_length=100, blank=True, null=True)
    operator = models.CharField(max_length=100, blank=True, null=True)
    operator_keyin = models.CharField(max_length=100, blank=True, null=True)
    datetime_keyin = models.DateTimeField(blank=True, null=True)
    operator_approve = models.CharField(max_length=100, blank=True, null=True)
    datetime_approve = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    plan_link_id = models.BigIntegerField(blank=True, null=True)
    delete_add = models.CharField(max_length=100, blank=True, null=True)
    note_location = models.CharField(max_length=500, blank=True, null=True)
    lab_check = models.CharField(db_column='Lab_check', max_length=100, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'View_wms_listfillplanproduction'




class ViewWmsMapManagement(models.Model):
    # id = models.BigAutoField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    machine = models.CharField(max_length=100, blank=True, null=True)
    zca_on = models.CharField(max_length=100, blank=True, null=True)
    name_th = models.CharField(max_length=400, blank=True, null=True)
    name_en = models.CharField(max_length=400, blank=True, null=True)
    product_type = models.CharField(max_length=100, blank=True, null=True)
    product_date = models.DateField(blank=True, null=True)
    product_shift = models.CharField(max_length=100, blank=True, null=True)
    ticket_type = models.CharField(max_length=100, blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    pallet_no = models.IntegerField(blank=True, null=True)
    receive_date = models.DateField(blank=True, null=True)
    receive_shift = models.CharField(max_length=100, blank=True, null=True)
    pcsperpallet = models.IntegerField(blank=True, null=True)
    product_length = models.IntegerField(blank=True, null=True)
    ton = models.FloatField(blank=True, null=True)
    lab_approve = models.CharField(max_length=100, blank=True, null=True)
    warehouse_id = models.BigIntegerField(blank=True, null=True)
    zone = models.CharField(max_length=100, blank=True, null=True)
    row = models.IntegerField(blank=True, null=True)
    column = models.IntegerField(blank=True, null=True)
    mapid = models.CharField(max_length=200, blank=True, null=True)
    level = models.IntegerField(blank=True, null=True)
    sub_column = models.IntegerField(blank=True, null=True)
    damaged = models.BooleanField(blank=True, null=True)
    lab = models.IntegerField(blank=True, null=True)
    lock = models.BooleanField(blank=True, null=True)
    success = models.BooleanField(blank=True, null=True)
    map_approve = models.IntegerField(blank=True, null=True)
    forklift_link_id = models.BigIntegerField(blank=True, null=True)
    listgood_link_id = models.BigIntegerField(blank=True, null=True)
    maplistfillpallet_link_id = models.BigIntegerField(blank=True, null=True)
    maplistfillplan_link_id = models.BigIntegerField(blank=True, null=True)
    maplisttransferpallet_link_id = models.BigIntegerField(blank=True, null=True)
    maplisttransferplan_link_id = models.BigIntegerField(blank=True, null=True)
    maplistwithdrawpallet_link_id = models.BigIntegerField(blank=True, null=True)
    maplistwithdrawplan_link_id = models.BigIntegerField(blank=True, null=True)
    plan_link_id = models.BigIntegerField(blank=True, null=True)
    action_type = models.CharField(max_length=100, blank=True, null=True)
    kgpcs = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'View_wms_map_management'


class Tempactiveplan(models.Model):
    company = models.CharField(db_column='Company', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    plant = models.CharField(db_column='Plant', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    shift = models.CharField(db_column='Shift', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    planweek = models.CharField(db_column='PlanWeek', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    versionno = models.CharField(db_column='VersionNo', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    productnum = models.CharField(db_column='Productnum', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    planname = models.CharField(db_column='PlanName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    machine = models.CharField(db_column='Machine', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    materialcode = models.CharField(db_column='MaterialCode', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    materialname = models.CharField(db_column='MaterialName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    planweight = models.DecimalField(db_column='PlanWeight', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    plancount = models.DecimalField(db_column='PlanCount', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    starttime = models.DateField(db_column='StartTime', blank=True, null=True)  # Field name made lowercase.
    duration = models.DecimalField(db_column='Duration', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    operationcode = models.CharField(db_column='OperationCode', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    setupduration = models.DecimalField(db_column='SetupDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    cleaningduration = models.DecimalField(db_column='CleaningDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    startupduration = models.DecimalField(db_column='StartupDuration', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    ms = models.DecimalField(db_column='MS', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    es = models.DecimalField(db_column='ES', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    os = models.DecimalField(db_column='OS', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    mc = models.DecimalField(db_column='MC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    ec = models.DecimalField(db_column='EC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    oc = models.DecimalField(db_column='OC', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    msu = models.DecimalField(db_column='MSU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    esu = models.DecimalField(db_column='ESU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    osu = models.DecimalField(db_column='OSU', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    contractor = models.CharField(db_column='Contractor', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    buname = models.CharField(db_column='BUName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    description = models.TextField(db_column='Description', db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    created_by = models.CharField(db_column='Created_by', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    create_at = models.DateTimeField(db_column='Create_at', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'TempActivePlan'

class ViewItemmasterproductfg(models.Model):
    # id = models.IntegerField()
    zca = models.CharField(max_length=20)
    name = models.CharField(max_length=53)
    type = models.CharField(max_length=5)
    pcpallet = models.IntegerField()
    zcacustomer = models.CharField(max_length=14, blank=True, null=True)
    kg = models.DecimalField(max_digits=7, decimal_places=4, blank=True, null=True)
    brand = models.CharField(max_length=10)
    om = models.CharField(max_length=4, blank=True, null=True)
    format = models.CharField(max_length=10)
    tis = models.BooleanField(db_column='TIS', blank=True, null=True)  # Field name made lowercase.
    namethai = models.CharField(max_length=42)
    nameen = models.CharField(max_length=40)
    size = models.CharField(max_length=50)
    sizemm = models.CharField(max_length=50, blank=True, null=True)
    nickname = models.CharField(max_length=5, blank=True, null=True)
    csr = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=4, blank=True, null=True)
    hs3_tl = models.CharField(db_column='HS3_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs4_tl = models.CharField(db_column='HS4_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs5_tl = models.CharField(db_column='HS5_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs6_tl = models.CharField(db_column='HS6_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs7_tl = models.CharField(db_column='HS7_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs8_tl = models.CharField(db_column='HS8_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    hs9_tl = models.CharField(db_column='HS9_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    ct1_tl = models.CharField(db_column='CT1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    ct2_tl = models.CharField(db_column='CT2_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    ct3_tl = models.CharField(db_column='CT3_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    ct4_tl = models.CharField(db_column='CT4_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    cm5_tl = models.CharField(db_column='CM5_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    cm6_tl = models.CharField(db_column='CM6_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    cm7_tl = models.CharField(db_column='CM7_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    cm8_tl = models.CharField(db_column='CM8_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    dp1_tl = models.CharField(db_column='DP1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    dp2_tl = models.CharField(db_column='DP2_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    det_tl = models.CharField(db_column='DET_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    ms1_tl = models.CharField(db_column='MS1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    oc1_tl = models.CharField(db_column='OC1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    oc2_tl = models.CharField(db_column='OC2_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    os1_tl = models.CharField(db_column='OS1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk1_tl = models.CharField(db_column='PK1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk2_tl = models.CharField(db_column='PK2_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk3_tl = models.CharField(db_column='PK3_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk4_tl = models.CharField(db_column='PK4_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk5_tl = models.CharField(db_column='PK5_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pk6_tl = models.CharField(db_column='PK6_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    pl1_tl = models.CharField(db_column='PL1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    rt1_tl = models.CharField(db_column='RT1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    rt2_tl = models.CharField(db_column='RT2_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    sd1_tl = models.CharField(db_column='SD1_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    seg_tl = models.CharField(db_column='SEG_TL', max_length=50, blank=True, null=True)  # Field name made lowercase.
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    nameshort = models.CharField(db_column='nameShort', max_length=53, blank=True, null=True)  # Field name made lowercase.
    operator_keyin = models.CharField(max_length=100, blank=True, null=True)
    operator_edit = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'View_ItemMasterProductFG'


class ViewItemmasterproductwip(models.Model):
    field_id = models.AutoField(db_column='id',primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    field_zca = models.TextField(db_column='zca', blank=True, null=True)
    field_mc = models.TextField(db_column='mc', blank=True, null=True)
 
    field_name = models.TextField(db_column='NameThai', blank=True, null=True)  # Field name made lowercase.
    field_nameShort = models.TextField(db_column='nameShort', blank=True, null=True)  # Field name made lowercase.
    field_nameeng = models.TextField(db_column='NameEng', blank=True, null=True)  # Field name made lowercase.
    field_type = models.TextField(db_column='type',blank=True, null=True)
    brand = models.TextField(blank=True, null=True)
    field_prodgroup = models.TextField(db_column='ProdGroup', blank=True, null=True)  # Field name made lowercase.
    field_prodname = models.TextField(db_column='Prodname', blank=True, null=True)  # Field name made lowercase.
    field_size = models.TextField(db_column='Size', blank=True, null=True)  # Field name made lowercase.
    field_length = models.TextField(db_column='Length', blank=True, null=True)  # Field name made lowercase.
    field_lengthpallet = models.IntegerField(db_column='LengthPallet', blank=True, null=True)  # Field name made lowercase.
    field_pcspallet = models.IntegerField(db_column='PcsPallet', blank=True, null=True)  # Field name made lowercase.
    field_layer = models.IntegerField(db_column='Layer', blank=True, null=True)  # Field name made lowercase.
    field_kgpcs = models.TextField(db_column='KgPcs', blank=True, null=True)  # Field name made lowercase.
    pcsperpallet = models.IntegerField(db_column='PCsPerPallet', blank=True, null=True)  # Field name made lowercase.
    type1 = models.TextField(db_column='Type1', blank=True, null=True)  # Field name made lowercase.
    tickness = models.IntegerField(db_column='Tickness', blank=True, null=True)  # Field name made lowercase.
    ct1 = models.TextField(db_column='CT1', blank=True, null=True)  # Field name made lowercase.
    ct2 = models.TextField(db_column='CT2', blank=True, null=True)  # Field name made lowercase.
    ct3 = models.TextField(db_column='CT3', blank=True, null=True)  # Field name made lowercase.
    ct4 = models.TextField(db_column='CT4', blank=True, null=True)  # Field name made lowercase.
    xy1 = models.TextField(db_column='XY1', blank=True, null=True)  # Field name made lowercase.
    cm5 = models.TextField(db_column='CM5', blank=True, null=True)  # Field name made lowercase.
    cm6 = models.TextField(db_column='CM6', blank=True, null=True)  # Field name made lowercase.
    cm7 = models.TextField(db_column='CM7', blank=True, null=True)  # Field name made lowercase.
    cm8 = models.TextField(db_column='CM8', blank=True, null=True)  # Field name made lowercase.
    as1 = models.TextField(db_column='AS1', blank=True, null=True)  # Field name made lowercase.
    pk1 = models.TextField(db_column='PK1', blank=True, null=True)  # Field name made lowercase.
    pk2 = models.TextField(db_column='PK2', blank=True, null=True)  # Field name made lowercase.
    pk3 = models.TextField(db_column='PK3', blank=True, null=True)  # Field name made lowercase.
    pk4 = models.TextField(db_column='PK4', blank=True, null=True)  # Field name made lowercase.
    pk5 = models.TextField(db_column='PK5', blank=True, null=True)  # Field name made lowercase.
    dp1 = models.TextField(db_column='DP1', blank=True, null=True)  # Field name made lowercase.
    det = models.TextField(db_column='DET', blank=True, null=True)  # Field name made lowercase.
    ms1 = models.TextField(db_column='MS1', blank=True, null=True)  # Field name made lowercase.
    oc1 = models.TextField(db_column='OC1', blank=True, null=True)  # Field name made lowercase.
    oc2 = models.TextField(db_column='OC2', blank=True, null=True)  # Field name made lowercase.
    os1 = models.TextField(db_column='OS1', blank=True, null=True)  # Field name made lowercase.
    pl1 = models.TextField(db_column='PL1', blank=True, null=True)  # Field name made lowercase.
    rt1 = models.TextField(db_column='RT1', blank=True, null=True)  # Field name made lowercase.
    rt2 = models.TextField(db_column='RT2', blank=True, null=True)  # Field name made lowercase.
    sd1 = models.TextField(db_column='SD1', blank=True, null=True)  # Field name made lowercase.
    seg = models.TextField(db_column='SEG', blank=True, null=True)  # Field name made lowercase.
    dp2 = models.TextField(db_column='DP2', blank=True, null=True)  # Field name made lowercase.
    pk6 = models.TextField(db_column='PK6', blank=True, null=True)  # Field name made lowercase.
    operator_keyin = models.CharField(db_column='operator_keyin', max_length=100,blank=True, null=True)
    operator_edit = models.CharField(db_column='operator_edit', max_length=100,blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'View_ItemMasterProductWIP'


class RemainPlan(models.Model):
    planname = models.CharField(db_column='PlanName', max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    planweek = models.CharField(db_column='PlanWeek', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    machine = models.CharField(db_column='Machine', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    zca = models.CharField(max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    planamount = models.DecimalField(db_column='PlanAmount', max_digits=18, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    total_submit = models.DecimalField(db_column='Total_submit', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    remain_pallet = models.CharField(db_column='Remain_pallet', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    remain_qty = models.DecimalField(db_column='Remain_qty', max_digits=18, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    list_fillplan_link = models.CharField(max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Remain_plan'


class StockHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    stock_date = models.DateField()
    zca = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    name_th = models.CharField(max_length=400, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    type = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    cur_stock = models.IntegerField(blank=True, null=True)
    child_zca = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    child_stock = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stock_history'



class ViewWmsCustomuser(models.Model):
    last_login = models.CharField(primary_key=True, max_length=34, db_collation='SQL_Latin1_General_CP1_CI_AS')
    is_superuser = models.BooleanField()
    first_name = models.CharField(max_length=17, db_collation='SQL_Latin1_General_CP1_CI_AS')
    last_name = models.CharField(max_length=17, db_collation='SQL_Latin1_General_CP1_CI_AS')
    email = models.CharField(max_length=22, db_collation='SQL_Latin1_General_CP1_CI_AS')
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.CharField(max_length=34, db_collation='SQL_Latin1_General_CP1_CI_AS')
    role_id = models.IntegerField()
    employee_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'View_wms_customuser'



class LockLabHSBoardData(models.Model):
    sheet = models.CharField(max_length=10, db_collation='Thai_CI_AS', blank=True, null=True)
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    product = models.CharField(max_length=255, db_collation='Thai_CI_AS', blank=True, null=True)
    date = models.CharField(max_length=255, db_collation='Thai_CI_AS', blank=True, null=True)
    pallet = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    inspection1 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    inspection2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    widthad = models.FloatField(db_column='widthAD', blank=True, null=True)  # Field name made lowercase.
    widthgh = models.FloatField(db_column='widthGH', blank=True, null=True)  # Field name made lowercase.
    widthbc = models.FloatField(db_column='widthBC', blank=True, null=True)  # Field name made lowercase.
    widthaverage = models.FloatField(db_column='widthAverage', blank=True, null=True)  # Field name made lowercase.
    lengthab = models.FloatField(db_column='lengthAB', blank=True, null=True)  # Field name made lowercase.
    lengthef = models.FloatField(db_column='lengthEF', blank=True, null=True)  # Field name made lowercase.
    lengthdc = models.FloatField(db_column='lengthDC', blank=True, null=True)  # Field name made lowercase.
    lengthaverage = models.FloatField(db_column='lengthAverage', blank=True, null=True)  # Field name made lowercase.
    diagonalac = models.FloatField(db_column='diagonalAC', blank=True, null=True)  # Field name made lowercase.
    diagonalbd = models.FloatField(db_column='diagonalBD', blank=True, null=True)  # Field name made lowercase.
    difflinecross = models.FloatField(blank=True, null=True)
    difflinewidth = models.FloatField(blank=True, null=True)
    difflinelenght = models.FloatField(blank=True, null=True)
    thick1 = models.FloatField(blank=True, null=True)
    thick2 = models.FloatField(blank=True, null=True)
    thick3 = models.FloatField(blank=True, null=True)
    thick4 = models.FloatField(blank=True, null=True)
    thick5 = models.FloatField(blank=True, null=True)
    thick6 = models.FloatField(blank=True, null=True)
    thick7 = models.FloatField(blank=True, null=True)
    thick8 = models.FloatField(blank=True, null=True)
    thickaverage = models.FloatField(db_column='thickAverage', blank=True, null=True)  # Field name made lowercase.
    thickdiff = models.FloatField(db_column='thickDiff', blank=True, null=True)  # Field name made lowercase.
    edgemmab = models.FloatField(db_column='edgemmAB', blank=True, null=True)  # Field name made lowercase.
    edgemmdc = models.FloatField(db_column='edgemmDC', blank=True, null=True)  # Field name made lowercase.
    edgemmbc = models.FloatField(db_column='edgemmBC', blank=True, null=True)  # Field name made lowercase.
    edgemmad = models.FloatField(db_column='edgemmAD', blank=True, null=True)  # Field name made lowercase.
    edgeperab = models.FloatField(db_column='edgeperAB', blank=True, null=True)  # Field name made lowercase.
    edgeperdc = models.FloatField(db_column='edgeperDC', blank=True, null=True)  # Field name made lowercase.
    edgeperbc = models.FloatField(db_column='edgeperBC', blank=True, null=True)  # Field name made lowercase.
    edgeperad = models.FloatField(db_column='edgeperAD', blank=True, null=True)  # Field name made lowercase.
    beforepressab = models.FloatField(db_column='beforepressAB', blank=True, null=True)  # Field name made lowercase.
    beforepressdc = models.FloatField(db_column='beforepressDC', blank=True, null=True)  # Field name made lowercase.
    beforepressbc = models.FloatField(db_column='beforepressBC', blank=True, null=True)  # Field name made lowercase.
    beforepressad = models.FloatField(db_column='beforepressAD', blank=True, null=True)  # Field name made lowercase.
    afterpressab = models.FloatField(db_column='afterpressAB', blank=True, null=True)  # Field name made lowercase.
    afterpressdc = models.FloatField(db_column='afterpressDC', blank=True, null=True)  # Field name made lowercase.
    afterpressbc = models.FloatField(db_column='afterpressBC', blank=True, null=True)  # Field name made lowercase.
    afterpressad = models.FloatField(db_column='afterpressAD', blank=True, null=True)  # Field name made lowercase.
    roughness = models.FloatField(blank=True, null=True)
    rzavg = models.FloatField(db_column='rzAvg', blank=True, null=True)  # Field name made lowercase.
    wzavg = models.FloatField(db_column='wzAvg', blank=True, null=True)  # Field name made lowercase.
    fzavg = models.FloatField(db_column='fzAvg', blank=True, null=True)  # Field name made lowercase.
    liftupleft = models.FloatField(blank=True, null=True)
    liftupright = models.FloatField(blank=True, null=True)
    liftupaverage = models.FloatField(db_column='liftupAverage', blank=True, null=True)  # Field name made lowercase.
    denweightair = models.FloatField(blank=True, null=True)
    denweightwater = models.FloatField(blank=True, null=True)
    denweightdry = models.FloatField(blank=True, null=True)
    densitycal = models.FloatField(db_column='densityCal', blank=True, null=True)  # Field name made lowercase.
    waterabspcal = models.FloatField(db_column='waterAbspCal', blank=True, null=True)  # Field name made lowercase.
    moisturebefore = models.FloatField(blank=True, null=True)
    moistureafter = models.FloatField(blank=True, null=True)
    moisturecal = models.FloatField(db_column='moistureCal', blank=True, null=True)  # Field name made lowercase.
    dryl1 = models.FloatField(db_column='dryL1', blank=True, null=True)  # Field name made lowercase.
    dryl2 = models.FloatField(db_column='dryL2', blank=True, null=True)  # Field name made lowercase.
    drycal = models.FloatField(db_column='dryCal', blank=True, null=True)  # Field name made lowercase.
    screwamount = models.FloatField(blank=True, null=True)
    screwbreak = models.FloatField(blank=True, null=True)
    leakage = models.FloatField(blank=True, null=True)
    laminaload = models.FloatField(db_column='laminaLoad', blank=True, null=True)  # Field name made lowercase.
    laminalamina = models.FloatField(db_column='laminaLamina', blank=True, null=True)  # Field name made lowercase.
    laminatorn = models.FloatField(blank=True, null=True)
    hardpress = models.FloatField(blank=True, null=True)
    harddepth = models.FloatField(blank=True, null=True)
    hardness = models.FloatField(blank=True, null=True)
    thickness11_1 = models.FloatField(blank=True, null=True)
    thickness12_1 = models.FloatField(blank=True, null=True)
    thickness1average_1 = models.FloatField(db_column='thickness1Average_1', blank=True, null=True)  # Field name made lowercase.
    loadpar_1 = models.FloatField(db_column='loadPAR_1', blank=True, null=True)  # Field name made lowercase.
    uspar_1 = models.FloatField(db_column='usPAR_1', blank=True, null=True)  # Field name made lowercase.
    thickness21_1 = models.FloatField(blank=True, null=True)
    thickness22_1 = models.FloatField(blank=True, null=True)
    thickness2average_1 = models.FloatField(db_column='thickness2Average_1', blank=True, null=True)  # Field name made lowercase.
    loadper_1 = models.FloatField(db_column='loadPER_1', blank=True, null=True)  # Field name made lowercase.
    usper_1 = models.FloatField(db_column='usPER_1', blank=True, null=True)  # Field name made lowercase.
    usaverage_1 = models.FloatField(db_column='usAverage_1', blank=True, null=True)  # Field name made lowercase.
    ispar_1 = models.CharField(db_column='isPAR_1', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isper_1 = models.CharField(db_column='isPER_1', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    result_1 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    note_1 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    lockpallet_1 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    amountlock_1 = models.FloatField(blank=True, null=True)
    symp_1 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    thickness11_2 = models.FloatField(blank=True, null=True)
    thickness12_2 = models.FloatField(blank=True, null=True)
    thickness1average_2 = models.FloatField(db_column='thickness1Average_2', blank=True, null=True)  # Field name made lowercase.
    loadpar_2 = models.FloatField(db_column='loadPAR_2', blank=True, null=True)  # Field name made lowercase.
    uspar_2 = models.FloatField(db_column='usPAR_2', blank=True, null=True)  # Field name made lowercase.
    thickness21_2 = models.FloatField(blank=True, null=True)
    thickness22_2 = models.FloatField(blank=True, null=True)
    thickness2average_2 = models.FloatField(db_column='thickness2Average_2', blank=True, null=True)  # Field name made lowercase.
    loadper_2 = models.FloatField(db_column='loadPER_2', blank=True, null=True)  # Field name made lowercase.
    usper_2 = models.FloatField(db_column='usPER_2', blank=True, null=True)  # Field name made lowercase.
    usaverage_2 = models.FloatField(db_column='usAverage_2', blank=True, null=True)  # Field name made lowercase.
    ispar_2 = models.CharField(db_column='isPAR_2', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    isper_2 = models.CharField(db_column='isPER_2', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    result_2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    note_2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    lockpallet_2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    amountlock_2 = models.FloatField(blank=True, null=True)
    symp_2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    shift = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'LockLabHSBoardData'

class ViewCloundlocklab(models.Model):
    rowdataid = models.IntegerField(primary_key=True)
    status = models.IntegerField(db_column='Status', blank=True, null=True)  # Field name made lowercase.
    caption = models.IntegerField(db_column='Caption', blank=True, null=True)  # Field name made lowercase.
    time = models.CharField(db_column='Time', max_length=255, blank=True, null=True)  # Field name made lowercase.
    machine = models.CharField(db_column='Machine', max_length=50, blank=True, null=True)  # Field name made lowercase.
    product = models.CharField(db_column='Product', max_length=255, blank=True, null=True)  # Field name made lowercase.
    app_remark = models.CharField(db_column='App_Remark', max_length=50, blank=True, null=True)  # Field name made lowercase.
    remark = models.CharField(db_column='Remark', max_length=101)  # Field name made lowercase.
    zca = models.CharField(db_column='ZCA', max_length=50, blank=True, null=True)  # Field name made lowercase.
    lock_pallet = models.CharField(db_column='Lock_Pallet', max_length=101)  # Field name made lowercase.
    lock_amount = models.FloatField(db_column='Lock_Amount', blank=True, null=True)  # Field name made lowercase.
    lock_mode = models.CharField(db_column='Lock_Mode', max_length=50, blank=True, null=True)  # Field name made lowercase.
    lock_sample = models.CharField(db_column='Lock_Sample', max_length=100, blank=True, null=True)  # Field name made lowercase.
    audituser = models.CharField(db_column='AuditUser', max_length=11)  # Field name made lowercase.
    pallet = models.CharField(db_column='Pallet', max_length=50, blank=True, null=True)  # Field name made lowercase.
    weight = models.FloatField(db_column='Weight', blank=True, null=True)  # Field name made lowercase.
    appearance = models.CharField(db_column='Appearance', max_length=50, blank=True, null=True)  # Field name made lowercase.
    width_ad = models.FloatField(db_column='Width_AD', blank=True, null=True)  # Field name made lowercase.
    width_gh = models.FloatField(db_column='Width_GH', blank=True, null=True)  # Field name made lowercase.
    width_bc = models.FloatField(db_column='Width_BC', blank=True, null=True)  # Field name made lowercase.
    width_avg = models.FloatField(db_column='Width_AVG', blank=True, null=True)  # Field name made lowercase.
    length_ab = models.FloatField(db_column='Length_AB', blank=True, null=True)  # Field name made lowercase.
    length_ef = models.FloatField(db_column='Length_EF', blank=True, null=True)  # Field name made lowercase.
    length_dc = models.FloatField(db_column='Length_DC', blank=True, null=True)  # Field name made lowercase.
    length_avg = models.FloatField(db_column='Length_AVG', blank=True, null=True)  # Field name made lowercase.
    diagonal_ac = models.FloatField(db_column='Diagonal_AC', blank=True, null=True)  # Field name made lowercase.
    diagonal_bd = models.FloatField(db_column='Diagonal_BD', blank=True, null=True)  # Field name made lowercase.
    diff_diagonal = models.FloatField(db_column='Diff_Diagonal', blank=True, null=True)  # Field name made lowercase.
    diff_width = models.FloatField(db_column='Diff_Width', blank=True, null=True)  # Field name made lowercase.
    diff_length = models.FloatField(db_column='Diff_Length', blank=True, null=True)  # Field name made lowercase.
    thickness_1 = models.FloatField(db_column='Thickness_1', blank=True, null=True)  # Field name made lowercase.
    thickness_2 = models.FloatField(db_column='Thickness_2', blank=True, null=True)  # Field name made lowercase.
    thickness_3 = models.FloatField(db_column='Thickness_3', blank=True, null=True)  # Field name made lowercase.
    thickness_4 = models.FloatField(db_column='Thickness_4', blank=True, null=True)  # Field name made lowercase.
    thickness_5 = models.FloatField(db_column='Thickness_5', blank=True, null=True)  # Field name made lowercase.
    thickness_6 = models.FloatField(db_column='Thickness_6', blank=True, null=True)  # Field name made lowercase.
    thickness_7 = models.FloatField(db_column='Thickness_7', blank=True, null=True)  # Field name made lowercase.
    thickness_8 = models.FloatField(db_column='Thickness_8', blank=True, null=True)  # Field name made lowercase.
    thickness_avg = models.FloatField(db_column='Thickness_AVG', blank=True, null=True)  # Field name made lowercase.
    thickness_range = models.FloatField(db_column='Thickness_Range', blank=True, null=True)  # Field name made lowercase.
    straightness_ab = models.FloatField(db_column='Straightness_AB', blank=True, null=True)  # Field name made lowercase.
    straightness_dc = models.FloatField(db_column='Straightness_DC', blank=True, null=True)  # Field name made lowercase.
    straightness_bc = models.FloatField(db_column='Straightness_BC', blank=True, null=True)  # Field name made lowercase.
    straightness_ad = models.FloatField(db_column='Straightness_AD', blank=True, null=True)  # Field name made lowercase.
    perstraightness_ab = models.FloatField(db_column='PerStraightness_AB', blank=True, null=True)  # Field name made lowercase.
    perstraightness_dc = models.FloatField(db_column='PerStraightness_DC', blank=True, null=True)  # Field name made lowercase.
    perstraightness_bc = models.FloatField(db_column='PerStraightness_BC', blank=True, null=True)  # Field name made lowercase.
    perstraightness_ad = models.FloatField(db_column='PerStraightness_AD', blank=True, null=True)  # Field name made lowercase.
    waviness_ab = models.FloatField(db_column='Waviness_AB', blank=True, null=True)  # Field name made lowercase.
    waviness_dc = models.FloatField(db_column='Waviness_DC', blank=True, null=True)  # Field name made lowercase.
    waviness_bc = models.FloatField(db_column='Waviness_BC', blank=True, null=True)  # Field name made lowercase.
    waviness_ad = models.FloatField(db_column='Waviness_AD', blank=True, null=True)  # Field name made lowercase.
    flatness_ab = models.FloatField(db_column='Flatness_AB', blank=True, null=True)  # Field name made lowercase.
    flatness_dc = models.FloatField(db_column='Flatness_DC', blank=True, null=True)  # Field name made lowercase.
    flatness_bc = models.FloatField(db_column='Flatness_BC', blank=True, null=True)  # Field name made lowercase.
    flatness_ad = models.FloatField(db_column='Flatness_AD', blank=True, null=True)  # Field name made lowercase.
    den_in_air = models.FloatField(db_column='Den_in_Air', blank=True, null=True)  # Field name made lowercase.
    den_in_water = models.FloatField(db_column='Den_in_Water', blank=True, null=True)  # Field name made lowercase.
    den_dry = models.FloatField(db_column='Den_Dry', blank=True, null=True)  # Field name made lowercase.
    density = models.FloatField(db_column='Density', blank=True, null=True)  # Field name made lowercase.
    water_absorption = models.FloatField(db_column='Water_Absorption', blank=True, null=True)  # Field name made lowercase.
    moi_air = models.FloatField(db_column='Moi_Air', blank=True, null=True)  # Field name made lowercase.
    moi_dry = models.FloatField(db_column='Moi_Dry', blank=True, null=True)  # Field name made lowercase.
    moisture = models.FloatField(db_column='Moisture', blank=True, null=True)  # Field name made lowercase.
    drying_shrinkage_l1 = models.FloatField(db_column='Drying_Shrinkage_L1', blank=True, null=True)  # Field name made lowercase.
    drying_shrinkage_l2 = models.FloatField(db_column='Drying_Shrinkage_L2', blank=True, null=True)  # Field name made lowercase.
    drying_shrinkage = models.FloatField(db_column='Drying_Shrinkage', blank=True, null=True)  # Field name made lowercase.
    nail_test = models.FloatField(db_column='Nail_Test', blank=True, null=True)  # Field name made lowercase.
    nail_test_result = models.FloatField(db_column='Nail_Test_result', blank=True, null=True)  # Field name made lowercase.
    water_leakage = models.FloatField(db_column='Water_leakage', blank=True, null=True)  # Field name made lowercase.
    roughness_level = models.FloatField(db_column='Roughness_Level', blank=True, null=True)  # Field name made lowercase.
    rz = models.FloatField(db_column='Rz', blank=True, null=True)  # Field name made lowercase.
    wz = models.FloatField(db_column='Wz', blank=True, null=True)  # Field name made lowercase.
    fz = models.FloatField(db_column='Fz', blank=True, null=True)  # Field name made lowercase.
    set1_us_par_load = models.FloatField(db_column='SET1_US_PAR_Load', blank=True, null=True)  # Field name made lowercase.
    set1_us_par_thickness_1 = models.FloatField(db_column='SET1_US_PAR_Thickness_1', blank=True, null=True)  # Field name made lowercase.
    set1_us_par_thickness_2 = models.FloatField(db_column='SET1_US_PAR_Thickness_2', blank=True, null=True)  # Field name made lowercase.
    set1_us_par_thickness_avg = models.FloatField(db_column='SET1_US_PAR_Thickness_AVG', blank=True, null=True)  # Field name made lowercase.
    set1_us_par = models.FloatField(db_column='SET1_US_PAR', blank=True, null=True)  # Field name made lowercase.
    set1_us_per_load = models.FloatField(db_column='SET1_US_PER_Load', blank=True, null=True)  # Field name made lowercase.
    set1_us_per_thickness_1 = models.FloatField(db_column='SET1_US_PER_Thickness_1', blank=True, null=True)  # Field name made lowercase.
    set1_us_per_thickness_2 = models.FloatField(db_column='SET1_US_PER_Thickness_2', blank=True, null=True)  # Field name made lowercase.
    set1_us_per_thickness_avg = models.FloatField(db_column='SET1_US_PER_Thickness_AVG', blank=True, null=True)  # Field name made lowercase.
    set1_us_per = models.FloatField(db_column='SET1_US_PER', blank=True, null=True)  # Field name made lowercase.
    set1_us_avg = models.FloatField(db_column='SET1_US_AVG', blank=True, null=True)  # Field name made lowercase.
    set2_us_par_load = models.FloatField(db_column='SET2_US_PAR_Load', blank=True, null=True)  # Field name made lowercase.
    set2_us_par_thickness_1 = models.FloatField(db_column='SET2_US_PAR_Thickness_1', blank=True, null=True)  # Field name made lowercase.
    set2_us_par_thickness_2 = models.FloatField(db_column='SET2_US_PAR_Thickness_2', blank=True, null=True)  # Field name made lowercase.
    set2_us_par_thickness_avg = models.FloatField(db_column='SET2_US_PAR_Thickness_AVG', blank=True, null=True)  # Field name made lowercase.
    set2_us_par = models.FloatField(db_column='SET2_US_PAR', blank=True, null=True)  # Field name made lowercase.
    set2_us_per_load = models.FloatField(db_column='SET2_US_PER_Load', blank=True, null=True)  # Field name made lowercase.
    set2_us_per_thickness_1 = models.FloatField(db_column='SET2_US_PER_Thickness_1', blank=True, null=True)  # Field name made lowercase.
    set2_us_per_thickness_2 = models.FloatField(db_column='SET2_US_PER_Thickness_2', blank=True, null=True)  # Field name made lowercase.
    set2_us_per_thickness_avg = models.FloatField(db_column='SET2_US_PER_Thickness_AVG', blank=True, null=True)  # Field name made lowercase.
    set2_us_per = models.FloatField(db_column='SET2_US_PER', blank=True, null=True)  # Field name made lowercase.
    set2_us_avg = models.FloatField(db_column='SET2_US_AVG', blank=True, null=True)  # Field name made lowercase.
    us_avg = models.FloatField(db_column='US_AVG', blank=True, null=True)  # Field name made lowercase.
    set1_is_par = models.CharField(db_column='SET1_IS_PAR', max_length=50, blank=True, null=True)  # Field name made lowercase.
    set1_is_per = models.CharField(db_column='SET1_IS_PER', max_length=50, blank=True, null=True)  # Field name made lowercase.
    set2_is_par = models.CharField(db_column='SET2_IS_PAR', max_length=50, blank=True, null=True)  # Field name made lowercase.
    set2_is_per = models.CharField(db_column='SET2_IS_PER', max_length=50, blank=True, null=True)  # Field name made lowercase.
    is_par_avg = models.IntegerField(db_column='IS_PAR_AVG', blank=True, null=True)  # Field name made lowercase.
    is_per_avg = models.IntegerField(db_column='IS_PER_AVG', blank=True, null=True)  # Field name made lowercase.
    hanging_l = models.FloatField(db_column='HANGING_L', blank=True, null=True)  # Field name made lowercase.
    hanging_r = models.FloatField(db_column='HANGING_R', blank=True, null=True)  # Field name made lowercase.
    hanging = models.FloatField(db_column='HANGING', blank=True, null=True)  # Field name made lowercase.
    lamina_kgf = models.FloatField(db_column='LAMINA_kgf', blank=True, null=True)  # Field name made lowercase.
    lamina_kgf_per_cm2 = models.FloatField(db_column='LAMINA_kgf_per_cm2', blank=True, null=True)  # Field name made lowercase.
    lamina_mm = models.FloatField(db_column='LAMINA_mm', blank=True, null=True)  # Field name made lowercase.
    p_kgf = models.FloatField(db_column='P_kgf', blank=True, null=True)  # Field name made lowercase.
    h_mm = models.FloatField(blank=True, null=True)
    hb = models.FloatField(db_column='HB', blank=True, null=True)  # Field name made lowercase.
    test_result = models.CharField(db_column='Test_result', max_length=50, blank=True, null=True)  # Field name made lowercase.
    dimension_group = models.CharField(db_column='Dimension_Group', max_length=100, blank=True, null=True)  # Field name made lowercase.
    strength_group = models.CharField(db_column='Strength_Group', max_length=100, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'View_cloundLockLab'

class Locklabspec(models.Model):
    code = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    product_thai = models.CharField(db_column='Product_Thai', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    product = models.CharField(db_column='Product', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    category = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    brand = models.CharField(db_column='Brand', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    group = models.FloatField(db_column='Group', blank=True, null=True)  # Field name made lowercase.
    span = models.SmallIntegerField(db_column='Span', blank=True, null=True)  # Field name made lowercase.
    thickup = models.FloatField(db_column='ThickUp', blank=True, null=True)  # Field name made lowercase.
    thicklow = models.FloatField(db_column='ThickLow', blank=True, null=True)  # Field name made lowercase.
    widthup = models.SmallIntegerField(db_column='WidthUp', blank=True, null=True)  # Field name made lowercase.
    widthlow = models.SmallIntegerField(db_column='WidthLow', blank=True, null=True)  # Field name made lowercase.
    lenup = models.SmallIntegerField(db_column='LenUp', blank=True, null=True)  # Field name made lowercase.
    lenlow = models.SmallIntegerField(db_column='LenLow', blank=True, null=True)  # Field name made lowercase.
    us_avg_r1 = models.FloatField(db_column='US_AVG_R1', blank=True, null=True)  # Field name made lowercase.
    is_par = models.SmallIntegerField(db_column='IS_PAR', blank=True, null=True)  # Field name made lowercase.
    density = models.FloatField(db_column='Density', blank=True, null=True)  # Field name made lowercase.
    lenexsample = models.SmallIntegerField(db_column='LenExsample', blank=True, null=True)  # Field name made lowercase.
    machine = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)
    us_avg_r2 = models.FloatField(db_column='US_AVG_R2', blank=True, null=True)  # Field name made lowercase.
    us_avg_r1_old = models.FloatField(db_column='US_AVG_R1_Old', blank=True, null=True)  # Field name made lowercase.
    us_avg_r2_old = models.FloatField(db_column='US_AVG_R2_Old', blank=True, null=True)  # Field name made lowercase.
    code_tl = models.CharField(db_column='code_TL', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    is_par_old = models.SmallIntegerField(db_column='IS_PAR_Old', blank=True, null=True)  # Field name made lowercase.
    thickup_มอก = models.FloatField(db_column='ThickUp_มอก', blank=True, null=True)  # Field name made lowercase.
    thicklow_มอก = models.FloatField(db_column='ThickLow_มอก', blank=True, null=True)  # Field name made lowercase.
    us_มอก = models.SmallIntegerField(db_column='US_มอก', blank=True, null=True)  # Field name made lowercase.
    group_product = models.CharField(db_column='Group_Product', max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)  # Field name made lowercase.
    code2 = models.CharField(max_length=50, db_collation='Thai_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'LockLabSpec'


class ViewInfoPriceNov2024(models.Model):
    id = models.IntegerField(primary_key=True)
    material_no = models.CharField(db_column='Material_No', max_length=18, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=40, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    price_unit = models.CharField(db_column='Price_Unit', max_length=16, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    weight = models.CharField(db_column='Weight', max_length=17, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'View_Info_Price_Nov2024'


