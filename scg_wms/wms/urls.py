from django.urls import path, include, re_path
from . import views
from . import MapViews
from . import ProductionViews
from . import PlannerViews
from . import LockLabViews


from rest_framework import permissions
from .MapViews import router
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from .views import *
from .MapViews import *

from .ProductionViews import *
from .PlannerViews import *



schema_view = get_schema_view(
   openapi.Info(
      title="WMS API",
      default_version='v1',
      description="Dashboard & Suggestion for WIP Warehouse SFCG TL",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('', views.index, name="index"),

    path('edit/addMap', views.addMap, name="addMap"),
    path('edit/addProduct', views.addProduct, name="addProduct"),

    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    

    path('api/get_Wdashboard/', MapViews.WarehouseInfoAPI.as_view(), name='get_Wdashboard'),
    path('api/get_zcacount/', MapViews.SearchMap.as_view(), name='SearchMap'),
    path('api/get_zcalocations/', MapViews.SearchMapFromOptions.as_view(), name='get_zcalocations'),
    path('api/get_fillplan/', MapViews.get_fillplan.as_view(), name='get_fillplan'),
    path('api/get_mapmanagement_info/', MapViews.get_mapmanagement_info.as_view(), name='get_mapmanagement_info'),
    path('api/FindNextBinLocation/', MapViews.FindNextBinLocation.as_view(), name='FindNextBinLocation'),
    path('api/get_map_location_info/', MapViews.get_map_location_info.as_view(), name='get_map_location_info'),
    path('api/get_dashboard_info/', MapViews.get_dashboard_info.as_view(), name='get_dashboard_info'),
    path('api/get_fullfillplan/', MapViews.get_fullfillplan.as_view(), name='get_fullfillplan'),
    path('api/get_fillplan/', MapViews.get_fillplan.as_view(), name='get_fillplan'),
    path('api/patch_MapFillList/', MapViews.patch_MapFillList.as_view(), name='patch_MapFillList'),
    path('api/get_TopZca/', MapViews.get_TopZca.as_view(), name='get_TopZca'),
    path('api/get_lineChart/', MapViews.get_lineChart.as_view(), name='get_lineChart'),
    path('api/get_lineChartTest/', MapViews.get_lineChartTest.as_view(), name='get_lineChartTest'),
    path('api/get_lineChart1Day/', MapViews.get_lineChart1Day.as_view(), name='get_lineChart1Day'),
    path('api/map_info/', MapViews.get_map_info.as_view() ,name='map_info'),
    path('api/map_management/', MapViews.get_mapmanagement.as_view() ,name='map_management'),
    path('api/get_products/', MapViews.get_products.as_view() ,name='get_products'),
    path('api/post_map_info/',MapViews.post_map_info.as_view() ,name='post_map_info'),
    path('api/updateWithdraw/', MapViews.Update_WithdrawPlan.as_view(), name='updateWithdraw'),
    path('api/UpdateNoteWithdraw/', MapViews.Update_NoteWithdrawPlan.as_view(), name='updateWithdraw'),
    path('api/get_roleuser', MapViews.get_RoleUser.as_view(), name='updateWithdraw'),
    path('api/updateTransfer/', MapViews.Update_TransferPlan.as_view(), name='updateTransfer'),
    path('api/get_withdrawpallet/', MapViews.get_withdrawpallet.as_view(), name='get_withdrawpallet'),
    path('api/post_addmap/', MapViews.post_addmap.as_view(),name='post_addmap'),
    path('api/post_deletemap/', MapViews.post_deletemap.as_view(),name='post_deletemap'),
    path('api/post_editmap/', MapViews.post_editmap.as_view(),name='post_editmap'),
    path('api/get_withdrawplan/', MapViews.get_withdrawplan.as_view(), name='get_withdrawplan'),
    path('',include(router.urls)),
    path('api/post_emergency/', MapViews.product_emergency.as_view()),
    path('api/post_mapmanagement/', MapViews.PostMapManagementInfo.as_view(),name='post_mapmanagement'),
    path('api/update_map_location_info/', MapViews.update_map_location_info.as_view(), name='update-max-level-or-size'),
   
   path('api/get_productDetail/', MapViews.get_productDetail.as_view(), name='get_productDetail'),

   #  path('api/post_withdrawplanjoblist/', MapViews.post_withdrawplanjoblist.as_view(), name='post_withdrawplanjoblist'),
   
   #  path('api/post_withdrawplanjoblist/', MapViews.post_withdrawplanjoblist.as_view(), name='post_withdrawplanjoblist'),

    path('api/iBeamKung', views.doManualUser.as_view()),
    path('api/login', views.doLogin.as_view(), name='doLogin'),
    path('api/logout', views.doLogout.as_view(), name='doLogout'),
    path('api/check_session', views.checkSession.as_view()),

    path('api/register', views.doRegister.as_view()),
    path('api/setpassword', views.doSetPassword.as_view()),
    path('api/getalluser', views.getUser.as_view(),),
    path('api/deleteuser', views.doDeleteUser.as_view()),

    path('api/getzcawip', ProductionViews.get_zcawipproduction.as_view()),
    path('api/getzcawithdrawwip', ProductionViews.get_zcawipwithdrawproduction.as_view()),
    path('api/getzcafg', ProductionViews.get_zcafgproduction.as_view()),
    path('api/getzcaall', ProductionViews.get_zcaallproduction.as_view()),
    path('api/getpiszca', ProductionViews.get_pisproduction.as_view()),
    #  path('api/postzca', ProductionViews.post_zcaproduction.as_view(), name='user-post_zcaproduction'),
    path('api/getplan', ProductionViews.get_planproduction.as_view()),
    path('api/geteditplan', ProductionViews.get_editplanproduction.as_view()),
    
    path('api/post_plan', ProductionViews.post_planproduct.as_view()),

    path('api/post_fillplan', ProductionViews.post_fillplanproduct.as_view()),
    path('api/delete_fillplan', ProductionViews.post_deleteFillplanProduct.as_view()),
    path('api/post_edittimefillplanproduct', ProductionViews.post_edittimefillplanproduct.as_view()),
    path('api/post_editfillplan', ProductionViews.post_editfillplanproduct.as_view()),
    path('api/post_Admineditfillplan', ProductionViews.post_Admineditfillplanproduct.as_view()),
    path('api/post_AdminNewPlan', ProductionViews.post_AdminNewPlan.as_view()),
    path('api/get_allInfozca', ProductionViews.get_allInfozca.as_view()),



    path('api/remove_plan',ProductionViews.remove_planproduct.as_view()),
    path('api/additem_plan',ProductionViews.additem_planproduct.as_view()),
    path('api/get_statmachine',ProductionViews.get_statmachine.as_view()),

    path('api/get_mc_timeserie', PlannerViews.get_mc_timeserie.as_view()),


    path('api/get_labunlockbadproduction', ProductionViews.get_labunlockbadplanproduction.as_view()),
    path('api/post_labunlockbadproduction', ProductionViews.post_labunlockbadplanproduction.as_view()),
    path('api/post_deletelabunlockbadproduction', ProductionViews.post_deletelabunlockbadplanproduction.as_view()),
    path('api/get_DashboardPerformance', ProductionViews.get_DashboardPerformance.as_view()),
    path('api/get_progroup', ProductionViews.get_Progroup.as_view()),
   
    path('api/get_monitorfillplan', ProductionViews.get_monitorfillplan.as_view()),
    path('api/get_monitorwithdrawplan', ProductionViews.get_monitorwithdrawplan.as_view()),
    

    path('api/get_dontsendfill', ProductionViews.get_dontsendfill.as_view()),
    path('api/post_dontsendfill', ProductionViews.post_dontsendfill.as_view()),
    path('api/post_deleteAdmin_pallet', ProductionViews.post_deleteAdmin_pallet.as_view()),
   #  path('api/post_dontsendwithdraw', ProductionViews.get_FGPlanning.as_view()),





    path('api/getfgplanning', PlannerViews.get_FGPlanning.as_view()),
    path('api/postfgplanning', PlannerViews.post_FGPlanning.as_view()),
    path('api/getfgplanning_pdf', PlannerViews.get_FGPlanning.as_view()),
    path('api/getfgplanningticket', PlannerViews.get_FGPlanningTicket.as_view()),
    path('api/postfgplanningticket', PlannerViews.post_FGPlanningTicket.as_view()),
    path('api/getfgplanningticket_pdf', PlannerViews.get_FGPlanningTicket.as_view()),
    path('api/getwithdraw_pdf', PlannerViews.get_WithdrawPDF.as_view()),
    path('api/getreturngood_pdf', PlannerViews.get_ReturnGoodPDF.as_view()),
    path('api/getreturnbad_pdf', PlannerViews.get_ReturnBadPDF.as_view()),
    path('api/export_csv', PlannerViews.export_csv.as_view()),

    path('api/getapprovereturn', PlannerViews.get_approvereturn.as_view()),
    path('api/postapprovereturn', PlannerViews.post_approvereturn.as_view()),
    path('api/getapproveticket', PlannerViews.get_approveticket.as_view()),
    path('api/postapproveticket', PlannerViews.post_approveticket.as_view()),

    path('api/getapprovelabreturn', PlannerViews.get_approvelabreturn.as_view()),
    path('api/postapprovelabreturn', PlannerViews.post_approvelabreturn.as_view()),
    path('api/getapprovelabunlockbad', PlannerViews.get_approvelabunlockbad.as_view()),
    path('api/postapprovelabunlockbad', PlannerViews.post_approvelabunlockbad.as_view()),

    path('api/get_labmanage', PlannerViews.get_LabManage.as_view()),
    path('api/get_dashboard', PlannerViews.get_Dashboard.as_view()),

    path('api/get_statusfill', PlannerViews.get_StatusFill.as_view()),
    path('api/get_statuswithdraw', PlannerViews.get_StatusWithdraw.as_view()),
    path('api/get_statusreturn', PlannerViews.get_StatusReturn.as_view()),
    path('api/get_statusticket', PlannerViews.get_StatusTicket.as_view()),

    path('api/get_statusfilltiger', PlannerViews.get_StatusFillTiger.as_view()),

    path('api/get_worklist_forklift', PlannerViews.get_worklist_forklift.as_view()),
    path('api/get_DailyWorklist_forklift', PlannerViews.get_DailyWorklist_forklift.as_view()),
    path('api/post_worklist_forklift', PlannerViews.post_worklist_forklift.as_view()),
    path('api/get_workplan_forklift', PlannerViews.get_workplan_forklift.as_view()),
    path('api/post_workplan_forklift', PlannerViews.post_workplan_forklift.as_view()),

    path('api/get_paperforklift', PlannerViews.get_PaperPlanPDF.as_view()),
    
    path('api/get_material', PlannerViews.get_material.as_view()),
    
    path('api/edit_material', PlannerViews.edit_material.as_view()),


    path('api/post_material', PlannerViews.post_material.as_view()),
    # path('api/post_editzcawip', PlannerViews.post_editzcawip.as_view()),
    path('api/delete_material', PlannerViews.delete_material.as_view()),


    path('api/check_zca', PlannerViews.check_zca.as_view()),


    path('api/get_editzcawip', PlannerViews.get_editzcawip.as_view()),
    path('api/post_editzcawip', PlannerViews.post_editzcawip.as_view()),
    path('api/post_editzcawip_2', PlannerViews.post_editzcawip_2.as_view()),
    path('api/post_deletezcawip', PlannerViews.post_deletezcawip.as_view()),

    path('api/get_editzcafg', PlannerViews.get_editzcafg.as_view()),
    path('api/post_editzcafg', PlannerViews.post_editzcafg.as_view()),
    path('api/post_editzcafg_2', PlannerViews.post_editzcafg_2.as_view()),
    path('api/post_deletezcafg', PlannerViews.post_deletezcafg.as_view()),

    path('api/post_deleteplan', PlannerViews.post_deleteplan.as_view()),




    path('api/get_editprocesslock', PlannerViews.get_editprocesslock.as_view()),
    path('api/post_editprocesslock', PlannerViews.post_editprocesslock.as_view()),
    path('api/post_deleteprocesslock', PlannerViews.post_deleteprocesslock.as_view()),
    path('api/get_edittedplan_production', PlannerViews.get_edittedplan_production.as_view()),
   path('api/check_zca_existence', PlannerViews.get_dupe_zca_processlock.as_view()),




    path('api/get_userForklift', PlannerViews.get_userForklift.as_view()),
    path('api/get_zca_data', get_zca_data.as_view(), name='get_zca_data'),
    


    path('api/getapprovelabwithdraw', PlannerViews.get_approvelabwithdraw.as_view()),
    path('api/postapprovelabwithdraw', PlannerViews.post_approvelabwithdraw.as_view()),

    path('api/get_stockbalance', PlannerViews.get_StockBalance.as_view()),
    path('api/get_nonmoving', PlannerViews.get_nonmoving.as_view()),


   
   path('api/post_parametersave', PlannerViews.post_ParameterSave.as_view()),






    path('api/get_options', PlannerViews.GetOptions.as_view()),

    path('api/get_Sche', PlannerViews.get_Sche.as_view()),
    path('api/get_machine', PlannerViews.get_machine.as_view()),

    path('api/get_ProcessLock', PlannerViews.get_Sche.as_view()),
    path('api/post_machplan', post_machplan.as_view(), name='post_machplan'),
    path('api/get_appointments', GetAppointments.as_view(), name='get_appointments'),
    path('api/delete_appointment', DeleteAppointment.as_view()),
    path('api/edit_appointment', PlannerViews.EditAppointment.as_view()),
    path('api/toggle_disable', ToggleDisableView.as_view(), name='toggle_disable'),
    path('api/update_rows', update_processlock.as_view(), name='update_processlock'),  

    path('api/demand', PlannerViews.GetDemand.as_view()),

    path('api/post_actual', ProductionViews.PostActualView.as_view()),
    path('api/get_actual', GetActualView.as_view(), name='get_actual'),
    # path('api/get_processlock', PlannerViews.GetProcessLock.as_view()),
    # path('api/post_processlock', PostProcessLock.as_view(), name='PostProcessLock'),
    # path('api/delete_processlock/<int:id>', DeleteProcessLock.as_view(), name='delete_processlock'),


    path('api/get_workload', GetWorkload.as_view(), name='GetWorkload'),



    path('api/materials/', MaterialCreateView.as_view(), name='material-create'),
    path('api/get_zcas/', GetZcasView.as_view(), name='get_zcas'),

    path('api/post_zcas/', MaterialCreateView.as_view(), name='post_zcas'),
    path('api/get_zca_by_name/', GetZCAByName.as_view(), name='get_zca_by_name'),


   path('api/get_pis_csv', PlannerViews.get_pis_csv.as_view()),

   path('api/get_stockestimate', PlannerViews.get_stockestimate.as_view()),
   path('api/get_stock_location', PlannerViews.get_stock_location.as_view()),


   path('api/upload_plan', PlannerViews.upload_plan.as_view()),
   path('api/get_plans', PlannerViews.get_plans.as_view()),

   path('api/GetWeeks', PlannerViews.GetWeeks.as_view()),

   path('api/get_remain_plan', PlannerViews.get_remain_plan.as_view()),
   path('api/get_remain_plan_old', PlannerViews.get_remain_plan_old.as_view()),


   path('api/get_sent_approve', PlannerViews.get_sent_approve.as_view()),
   path('api/export_to_excel', PlannerViews.export_to_excel.as_view()),



   path('api/getweek', PlannerViews.GetWeeks.as_view()),
   path('api/GetWeeksRange', PlannerViews.GetWeeksRange.as_view()),


   path('api/get_version', PlannerViews.get_version.as_view()),


   path('api/get_reject', PlannerViews.get_reject.as_view()),

   path('api/get_plan_pef', PlannerViews.get_plan_pef.as_view()),

   path('api/get_prod_timeserie', PlannerViews.get_prod_timeserie.as_view()),
   path('api/get_zca_option', PlannerViews.get_zca_option.as_view()),
   
   path('api/get_operator_pef', PlannerViews.get_operator_pef.as_view()),


   path('api/get_zca_machinerate', PlannerViews.get_zca_machinerate.as_view()),

   path('api/post_initilize_schedual', PlannerViews.Initilize_schedual.as_view()),

   path('api/get_simulate', PlannerViews.get_simulate.as_view()),




   path('api/post_locklab_boardhs', LockLabViews.post_datalocklab_boardhs.as_view()),
   path('api/get_editdatelocklab_boardhs', LockLabViews.get_editdatelocklab_boardhs.as_view()),
   path('api/get_editdatalocklab_boardhs', LockLabViews.get_editdatalocklab_boardhs.as_view()),
   path('api/update_locklab_boardhs', LockLabViews.update_editdataHS_boardhs.as_view()),

   path('api/get_spanlenexample', LockLabViews.get_spanLenexample.as_view()),

   path('api/get_clounddate', LockLabViews.get_cloundDate.as_view()),
   path('api/get_clounddata', LockLabViews.get_cloundData.as_view()),
   path('api/update_statusboard', LockLabViews.update_statusBoardData.as_view()),

   path('api/get_selectdate', LockLabViews.get_cloundSelectDate.as_view()),


   path('api/get_operator_past', PlannerViews.get_operator_past.as_view()),
]