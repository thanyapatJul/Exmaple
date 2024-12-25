import requests
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta, time , date
from collections import defaultdict
from .models import *
from apscheduler.triggers.cron import CronTrigger
import os
import calendar
from django.db.models import Max, Q, F, Sum, FloatField,When,Value
from django.db import transaction
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
import math

scheduler = BackgroundScheduler()


class Material:
    def __init__(self, code, field_name, initial_stock, lead_time, is_finished_good=False):
        self.code = code
        self.field_name = field_name
        self.frozen = []
        self.actual = []
        self.dates = []
        self.initial_stock = int(initial_stock)
        self.current_stock = []  # List to store stock changes over time
        self.lead_time = int(lead_time)
        self.children = []
        self.is_finished_good = is_finished_good
        self.level = 0
        self.parent = None  # Initialize parent attribute

    def __str__(self):
        return (f"Material(code={self.code}, frozen={self.frozen}, actual={self.actual}, dates={self.dates}, "
                f"initial_stock={self.initial_stock}, current_stock={self.current_stock[-1]['stock'] if self.current_stock else 'N/A'}, "
                f"lead_time={self.lead_time}, is_finished_good={self.is_finished_good}, children={len(self.children)}, level={self.level})")

    def add_child(self, child):
        child.parent = self  # Set parent attribute for the child
        self.children.append(child)

    def add_frozen_value(self, date, value):
        if date in self.dates:
            index = self.dates.index(date)
            self.actual[index] = value
        else:
            self.dates.append(date)
            self.frozen.append(value)
            self.actual.append(0)  # Initialize corresponding actual value to 0

    def add_actual_value(self, date, value):
        if date in self.dates:
            index = self.dates.index(date)
            self.actual[index] = value
        else:
            self.dates.append(date)
            self.actual.append(value)
            self.frozen.append(0)  # Initialize corresponding frozen value to 0

    def set_hierarchy_level(self, level=0):
        self.level = level
        for child in self.children:
            child.set_hierarchy_level(level + 1)

    def to_hierarchy(self):
        return {
            'code': self.code,
            'field_name': self.field_name,
            'level': self.level,
            'parent': self.parent.code if self.parent else None,
            'stock': self.current_stock,
            'dates': self.dates,
            'actual': self.actual,
            'frozen': self.frozen,
            'children': [child.to_hierarchy() for child in self.children]
        }

    def get_all_event(self):
        all_dates = self.dates[:]
        all_frozen = self.frozen[:]
        all_actual = self.actual[:]

        event_dict = {}
        for date, frozen, actual in zip(all_dates, all_frozen, all_actual):
            if date not in event_dict:
                event_dict[date] = {'frozen': 0, 'actual': 0}
            frozen_value = frozen if frozen is not None else 0
            actual_value = actual if actual is not None else 0
            event_dict[date]['frozen'] += frozen_value
            event_dict[date]['actual'] += actual_value

        sorted_events = sorted(event_dict.items())

        all_dates = [event[0] for event in sorted_events]
        all_frozen = [event[1]['frozen'] for event in sorted_events]
        all_actual = [event[1]['actual'] for event in sorted_events]

        return all_dates, all_frozen, all_actual

    def estimate_stock(self, current_date, start_date, end_date):
        begin = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()

        stock_changes = []
        previous_stock = self.initial_stock

        all_dates, all_frozen, all_actual = self.get_all_event()

        if self.lead_time:
            all_dates_shift = [date + timedelta(days=self.lead_time) for date in all_dates]
        else:
            all_dates_shift = all_dates

        passing_date = begin
        while passing_date <= end:
            date_str = passing_date.strftime("%Y-%m-%d")

            # Get the parent material's event values
            material_value = 0
            frozen_value = 0
            actual_value = 0
            if passing_date in all_dates_shift:
                index = all_dates_shift.index(passing_date)
                material_value = all_actual[index] if current_date >= all_dates[index] else all_frozen[index]
                frozen_value = all_frozen[index]
                actual_value = all_actual[index]


            # total_child_value = 0
            # for child in self.children:
            #     child_dates, child_frozen, child_actual = child.get_all_event()
            #     if passing_date in child_dates:
            #         child_index = child_dates.index(passing_date)
            #         # print('child_actual',child_actual,'child_frozen',child_frozen,'child_index',child_index)
            #         total_child_value += child_actual[child_index] if current_date >= child_dates[child_index] else child_frozen[child_index]

            total_child_value = 0
            child_records = []

            for child in self.children:
                # print(str(child))
                child_dates, child_frozen, child_actual = child.get_all_event()

                # print(child.code,child_dates, child_frozen, child_actual,'\n')
                if passing_date in child_dates:
                    child_index = child_dates.index(passing_date)
                    # print(child.code,passing_date,child_index,'\n')
                    child_material_value = (
                        child_actual[child_index] if child_actual[child_index] !=0 or current_date >= passing_date else child_frozen[child_index]
                    )
                    total_child_value += child_material_value
                    # print(self.code,total_child_value ,'date',current_date,'>=',child_dates[child_index])
                    child_records.append({
                        'child_code': child.code,
                        'child_name': child.field_name,
                        'frozen': child_frozen[child_index],
                        'actual': child_actual[child_index]
                    })

            # Calculate new stock, factoring in both parent and child events
            new_stock = previous_stock + material_value - total_child_value
            # print(f'{self.code}\n{new_stock}= {previous_stock}+{material_value}-{total_child_value}')
            # Only store the stock when it changes
            if new_stock != previous_stock:
                if stock_changes:
                    stock_changes[-1]['date_end'] = (passing_date - timedelta(days=1)).strftime("%Y-%m-%d")

                stock_changes.append({
                    'date_start': date_str,
                    'date_end': date_str,
                    'previous_stock': previous_stock,
                    'stock': new_stock,
                    'code': self.code,
                    'name': self.field_name,
                    'frozen': frozen_value,
                    'actual': actual_value,
                    'child': child_records  # Include child event data
                })
                # print(stock_changes)
                # Append the change to current_stock only when stock changes
                self.current_stock.append({
                    'date': date_str,
                    'stock': new_stock
                })

                previous_stock = new_stock

            passing_date += timedelta(days=1)

        if stock_changes:
            stock_changes[-1]['date_end'] = end.strftime("%Y-%m-%d")
        return stock_changes




    def calculate_stock(self, current_date, start_date, end_date):
        begin = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()

        stock_changes = []
        previous_stock = self.initial_stock
        last_recorded_date = begin

        # เอา Event F/S ทั้งหมดมา
        all_dates, all_frozen, all_actual = self.get_all_event() 

        # all_dates_shift คือ date event shift date ทั้งหมด
        if self.lead_time:
            all_dates_shift = [date + timedelta(days=self.lead_time) for date in all_dates]

        else:
            all_dates_shift = all_dates

        for date, frozen_value, actual_value in zip(all_dates, all_frozen, all_actual):
            # เพิ่ม Event F/S เข้า Calendar
            stock_changes.append({
                'date_start': date.strftime('%Y-%m-%d'),
                'date_end': date.strftime('%Y-%m-%d'),  
                'stock': 0,  
                'code': self.code,
                'frozen': frozen_value,
                'actual': actual_value,
                'child': len(self.children)
            })


        passing_date = begin
        while passing_date <= end:
            date_str = passing_date.strftime("%Y-%m-%d")

            # เลิอก F/S เทียบ current_date เทียบ วันของ Event ที่ shift
            material_value = 0
            if passing_date in all_dates_shift:
                index = all_dates_shift.index(passing_date)
                material_value = all_actual[index] if current_date >= all_dates[index] else all_frozen[index]

            # คิด Value event ของลูก
            total_child_value = 0
            for child in self.children:
                child_dates, child_frozen, child_actual = child.get_all_event()
                if passing_date in child_dates:
                    child_index = child_dates.index(passing_date)
                    # print('child_actual',child_actual,'child_frozen',child_frozen,'child_index',child_index)
                    total_child_value += child_actual[child_index] if current_date >= child_dates[child_index] else child_frozen[child_index]

            # เข้าสูตร
            new_stock = previous_stock + material_value - total_child_value

            # Record stock changes  
            if new_stock != self.current_stock:
                if stock_changes:
                    stock_changes[-1]['date_end'] = (passing_date - timedelta(days=1)).strftime("%Y-%m-%d")
                stock_changes.append({
                    'date_start': date_str,
                    'date_end': date_str,  
                    'stock': new_stock,
                    'code': self.code,
                    'frozen': 0,
                    'actual':0,
                    'child': len(self.children)
                })
                # print(stock_changes)
                self.current_stock = new_stock
                last_recorded_date = passing_date

            previous_stock = new_stock

            # Move to the next day
            passing_date += timedelta(days=1)

        #สุด Range 
        if stock_changes:
            stock_changes[-1]['date_end'] = end.strftime("%Y-%m-%d")

        return stock_changes

def GetDistinctPlanID():
    # Get distinct planid values from the ProcessLock model, ordered by planid
    distinct_plan_ids = ProcessLock.objects.values_list('planid', flat=True).distinct().order_by('planid')
    
    # Convert the queryset to a list
    planid_list = list(distinct_plan_ids)
    
    return planid_list

def GetFirstZca(planid):
    first_zca = ProcessLock.objects.filter(planid=planid).values('field_zca').first()
    return first_zca['field_zca']

def PipeLineGetter(code, planid):
    # Step 1: Get the initial process entry for the provided ZCA and planid
    search_first = ProcessLock.objects.filter(field_zca=code, planid=planid).values(
        'field_id', 'field_zca', 'field_name', 'field_source', 'field_destination', 'field_mc', 'planid', 'order'
    ).first()


    if not search_first:
        return []  # Return an empty list if no matching records are found

    planid = search_first['planid']
    pipeline_entries = []

    # Step 2: Check if there are other ZCAs in the same planid with field_source as '1*'
    other_zcas_with_1star = ProcessLock.objects.filter(
        planid=planid, field_source='1*', disable=False
    ).values_list('field_zca', flat=True).distinct()
    

    # If there are such ZCAs, we need to search their related plan IDs
    if other_zcas_with_1star.exists():
        related_planids = ProcessLock.objects.filter(
            field_zca__in=other_zcas_with_1star, disable=False
        ).values_list('planid', flat=True).distinct()

        pipeline_entries = ProcessLock.objects.filter(
            planid__in=related_planids, disable=False
        ).values(
            'field_id', 'field_zca', 'field_name', 'field_source', 'field_destination', 'field_mc', 'planid','order'
        ).order_by('order')

    else:
        # If no such ZCAs exist, proceed with the regular pipeline search
        pipeline_entries = ProcessLock.objects.filter(
            planid=planid, disable=False
        ).values(
            'field_id', 'field_zca', 'field_name', 'field_source', 'field_destination', 'field_mc', 'planid','order'
        ).order_by('order')

    # Step 3: Use a dictionary to track unique combinations of field_zca and order to remove duplicates
    unique_entries = {}
    for entry in pipeline_entries:
        key = (entry['field_zca'], entry['order'])
        if key not in unique_entries:
            unique_entries[key] = entry

    # Convert the unique entries dictionary back into a list
    unique_pipeline = list(unique_entries.values())



    return unique_pipeline

def GetWipProcess(process):
    Wip_list = []
    for mat in process:
        if mat['field_destination'] != '*':
            Wip_list.append(mat['field_zca'])
    return Wip_list

def get_unique_lookup(data):
    lookup = {}
    unique_data = {}

    for item in data:
        key = f"{item['mapid']}-{item['level']}-{item['sub_column']}"
        # print("Unique Key Generated:", key)  # Debugging log

        # Check if the key doesn't exist in the unique_data dictionary
        if key not in unique_data:
            # Set the key in the unique_data dictionary and add the item to the lookup
            unique_data[key] = True
            lookup[key] = item

    return lookup

def get_today_stock(zca_on_list, PlanId):
    total_qty_sum = 0  
    queryset = Map_management.objects.filter(zca_on__in=zca_on_list) \
        .exclude(map_approve__in=[0, 2, 3]) \
        .values() \
        .order_by('-created_at')
    queryset_list = list(queryset)
    unique_lookup = get_unique_lookup(queryset_list)
    
    zca_on_data = defaultdict(lambda: defaultdict(lambda: {'total_qty': 0, 'levels': defaultdict(int)})) 

    for item in unique_lookup.values():

        zca_on = item['zca_on'] 
        key = (item['warehouse_id'],item['zone'], item['row'], item['column'],item['sub_column'])

        qty_value = item.get('qty', 0)
        if qty_value is None:
            qty_value = 0
        else:
            qty_value = int(qty_value)

        zca_on_data[zca_on][key]['total_qty'] += qty_value
        zca_on_data[zca_on][key]['levels'][item['level']] += qty_value
        
        total_qty_sum += qty_value

    response_data = []

    for zca_on, zone_row_column_data in zca_on_data.items():
        # Handle None values by using a placeholder for sorting
        sorted_keys = sorted(
            zone_row_column_data.keys(),
            key=lambda k: (
                str(k[0]) if k[0] is not None else '',  
                int(k[1]) if k[1] is not None and isinstance(k[1], int) else -1,  
                int(k[2]) if k[2] is not None and isinstance(k[2], int) else -1   ,
                int(k[3]) if k[3] is not None and isinstance(k[3], int) else -1   
            )
        )

        zca_response = {
            'zca_on': zca_on,
            'PlanId': PlanId,
            'data_by_zone_row_column': [
                {
                    'warehouse': key[0],
                    'zone': key[1],
                    'row': key[2],
                    'column': key[3],
                    'total_qty': zone_row_column_data[key]['total_qty'],
                    'levels': dict(zone_row_column_data[key]['levels'])  
                }
                for key in sorted_keys  
            ],
            'total_qty': sum([zone_row_column_data[key]['total_qty'] for key in sorted_keys])  
        }

        response_data.append(zca_response)
    
    return response_data

# เอา List ไปเพิ่ม Class Material
def process_pipelines(pipelines, initial_stock_map, current_date, start_date, end_date):
    initial_stock_map = initial_stock_map or {}
    zca_list = [mat['field_zca'] for mat in pipelines]  # Get list of all ZCA codes

    # Batch fetch frozen and actual records
    all_frozen_records = get_frozen_records_bulk(zca_list, start_date, end_date)
    all_actual_records = get_actual_records_bulk(zca_list, start_date, end_date)

    # Group frozen and actual records by ZCA
    frozen_map = defaultdict(list)
    actual_map = defaultdict(list)

    for rec in all_frozen_records:
        frozen_map[rec['materialcode']].append(rec)

    for rec in all_actual_records:
        actual_map[rec['materialcode']].append(rec)

    materials = {}
    # print(frozen_map,'frozen_map')
    for mat in pipelines:
        zca = mat['field_zca']
        field_name = mat['field_name']

        init_stock = initial_stock_map.get(zca, 0)

        # Initialize Material instance with the correct stock
        if zca not in materials:
            materials[zca] = [Material(
                code=zca,
                field_name=field_name,
                initial_stock=init_stock,
                lead_time=4 if mat['field_source'] == '1' else 0
            )]

        # Process frozen records
        for frozen_record in frozen_map[zca]:
            # print(zca,frozen_record)
            starttime = frozen_record['starttime'].date() if isinstance(frozen_record['starttime'], datetime) else frozen_record['starttime']
            frozen_value = int(frozen_record['plancount'])

            # If the date already exists, sum the value
            if starttime in materials[zca][0].dates:
                index = materials[zca][0].dates.index(starttime)
                materials[zca][0].frozen[index] += frozen_value
            else:
                materials[zca][0].add_frozen_value(starttime, frozen_value)

        # Process actual records
        for actual_record in actual_map[zca]:
            if actual_record['goodcount'] is None:
                continue  # Skip this record if 'goodcount' is None

            starttime = actual_record['starttime'].date() if isinstance(actual_record['starttime'], datetime) else actual_record['starttime']
            actual_value = int(actual_record['goodcount'])

            # If the date already exists, sum the value
            if starttime in materials[zca][0].dates:
                index = materials[zca][0].dates.index(starttime)
                materials[zca][0].actual[index] += actual_value
            else:
                materials[zca][0].add_actual_value(starttime, actual_value)

    # Build material hierarchy
    build_material_hierarchy(materials, pipelines)

    return materials


# เอา zca ไปหา [frozen , date]
def get_frozen_records_bulk(zca_list, start_date, end_date):
    return ViewActiveplan.objects.filter(
        materialcode__in=zca_list,
        starttime__gte=start_date,
        starttime__lte=end_date
    ).values('planname', 'materialcode', 'plancount', 'starttime', 'shift')

def get_actual_records_bulk(zca_list, start_date, end_date):
    return ViewPisMergereportProduction.objects.filter(
        materialcode__in=zca_list,
        starttime__gte=start_date,
        starttime__lte=end_date
    ).exclude(goodcount__isnull=True).values(
        'ordernumber', 'materialcode', 'goodcount', 'starttime'
    )

# ปั้น Tree
def build_material_hierarchy(materials, pipelines):
    # {zca : Mat instance}
    material_map = {pipeline['field_zca']: materials[pipeline['field_zca']] for pipeline in pipelines if pipeline['field_zca'] in materials}
    
    # Find the first duplicate order, which indicates where branching should occur
    branching = find_first_duplicate_order(pipelines)

    parent_material = None

    remaining_pipelines = pipelines.copy()  

    prev_planid = None 
    node_branch = None  
    leaf_branch = None  

    for pipeline in pipelines:
        current_material_code = pipeline['field_zca']
        current_material_list = material_map.get(current_material_code, [])
        
        if not current_material_list:
            print(f"No materials found for {current_material_code}")
            continue
        
        current_material = current_material_list[0]

        if pipeline['order'] + 1 == branching:
            node_branch = current_material

        if pipeline['order'] >= branching:  # Branching point
            curr_pid = pipeline['planid']
            
            # Check if planid has changed
            if prev_planid is not None and curr_pid != prev_planid:
                leaf_branch = node_branch  # Update leaf_branch to node_branch on planid change

            prev_planid = curr_pid  
            
            # Process pipelines with the same planid
            for bline in remaining_pipelines[:]:  # Iterate over a copy of the list to avoid modifying the list while iterating
                if bline['planid'] == curr_pid and bline['order'] >= branching:
                    bline_material_code = bline['field_zca']
                    bline_material_list = material_map.get(bline_material_code, [])

                    
                    if not bline_material_list:
                        print(f"No materials found for {bline_material_code}")
                        continue
                    
                    bline_material = bline_material_list[0]
                    if bline['field_destination'] == 'NULL' or bline['field_destination'] == '':
                        if leaf_branch is not None:
                            # print(leaf_branch.code,'add',bline_material.code)
                            leaf_branch.add_child(bline_material)

                        leaf_branch = bline_material
                    elif bline['field_destination'] == "*":
                        if leaf_branch is not None:
                            # print(leaf_branch.code,'add',bline_material.code)
                            leaf_branch.add_child(bline_material)

                    else:
                        leaf_branch = bline_material

                    # Remove processed bline from remaining_pipelines
                    remaining_pipelines.remove(bline)

        else:  # Normal processing before branching
            if pipeline['field_destination'] == 'NULL' or pipeline['field_destination'] == '':
                if parent_material is not None:
                    # print(parent_material.code,'add',current_material.code)
                    parent_material.add_child(current_material)
                parent_material = current_material
                leaf_branch = current_material  # Update leaf_branch
            elif pipeline['field_destination'] == "*":
                if parent_material is not None:
                    # print(parent_material.code,'add',current_material.code)
                    parent_material.add_child(current_material)
            else:
                parent_material = current_material
                leaf_branch = current_material  # Update leaf_branch
    
    return parent_material

# กรณี Branching 
def find_first_duplicate_order(pipelines):
    order_set = set()
    for pipeline in pipelines:
        order = pipeline.get("order")
        if order in order_set:
            return order
        order_set.add(order)
    return 9999


def get_stock_change(materials, pipelines, current_date, start_date, end_date):
    all_stock_changes = []
    
    if pipelines:
        root_zca = pipelines[0]['field_zca']
        root_material = materials[root_zca][0]  # first node

        root_material.set_hierarchy_level()


        if root_zca in materials and materials[root_zca]:
            for mat in pipelines:
                zca = mat['field_zca']

                zca_material = materials[zca][0]
                stock_changes = zca_material.estimate_stock(
                    current_date,
                    start_date.strftime('%Y-%m-%d'),
                    end_date.strftime('%Y-%m-%d')
                )
                all_stock_changes.extend(stock_changes)
                # print(str(zca_material))
                # print(stock_changes)
    # Sort all stock changes by 'date_start'
    all_stock_changes.sort(key=lambda x: x['date_start'])

    # Group stock changes by 'code'
    grouped_stock_changes = defaultdict(list)

    for change in all_stock_changes:
        zca_code = change['code']
        grouped_stock_changes[zca_code].append(change)
    



    return dict(grouped_stock_changes)



def get_stock():
    # Step 1: Get PlanId and process list
    forcast = []
    planid_list = GetDistinctPlanID()
    # Simulate the current date
    current_date = datetime.now().date()
    # Iterate over each PlanId
    for PlanId in planid_list:

        # Step 2: Get the first ZCA for the PlanId
        first_zca = GetFirstZca(PlanId)

        # Step 3: Get ZCA on list through the pipeline getter
        zca_on_list = PipeLineGetter(first_zca, PlanId)


        # Step 4: Get WIP process information
        zca_on_wip = GetWipProcess(zca_on_list)


        # Step 5: Get the initial stock data for the ZCAs
        initial_stock_data = get_today_stock(zca_on_wip, PlanId)


        # Map stock data
        initial_stock_map = {item['zca_on']: item['total_qty'] for item in initial_stock_data}


        # Step 6: Process the pipelines
        shift_week = current_date + timedelta(weeks=1)
        materials = process_pipelines(zca_on_list, initial_stock_map, current_date, current_date, shift_week)


        # Step 7: Get stock change estimates
        stock_estimate = get_stock_change(materials, zca_on_list, current_date, current_date, shift_week)


        # Store forecast data
        if stock_estimate:
            final_response = {
                'PlanId': PlanId,
                'data': stock_estimate,

            }
            forcast.append(final_response)
    return forcast


def filter_and_generate_negative_stock_text(data):
    text_list = []
    if len(data)==0:
        text_list.append('ไม่มี Stock ติดลบ ใน 7 วันข้างหน้า')
    else:
        for plan in data:
            plan_id = plan["PlanId"]
            plan_text = f"PlanID {plan_id}\n"
            plan_records = []
            
            for code, records in plan["data"].items():
                for record in records:
                    if record["stock"] < 0:
                        # Fetch the first child name if available
                        child_name = record["child"][0]["child_name"] if record["child"] else "No Child"
                        record_text = f"-{record['name']}, ของขาด {record['stock']} แผ่น \n ในวันที่ {record['date_start']} Material ที่ใช้ {child_name}\n \n "
                        plan_records.append(record_text)
            
            if plan_records:
                text_list.append(plan_text + ''.join(plan_records))
            else:
                text_list.append('ไม่มี Stock ติดลบ ใน 7 วันข้างหน้า')
        
    return text_list


def post():
    # Extract message from request body
    stock = get_stock()
    # stock=[]
    # print(stock,'stock')
    text = filter_and_generate_negative_stock_text(stock)
    # text=['a1','a2','a3']
    token = os.getenv('LINE_NOTIFY_TOKEN')


    if not token:
        print("LINE Notify token not found in environment variables")
        return
    url = 'https://notify-api.line.me/api/notify'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    errors = []
    for message in text:
        # print(message)
        payload = {'message': message}
        response = requests.post(url, headers=headers, data=payload)
    

def get_week_number(input_date):
    week_count = 0

    otherweeks = (input_date.month -1)*4
    week_count+=otherweeks
    if input_date.day < 8:
        week_count += 1

    elif input_date.day < 15:
        week_count += 2

    elif input_date.day < 22:
        week_count += 3

    elif input_date.day >= 22:
        week_count += 4

    return week_count


def get_week_range(week,year):

    quart = int(week) / 4
    month = math.ceil(quart) 

    current_year = year

    if quart % 1 == 0.25:  
        week_start_date = datetime(current_year, month, 1)
        week_end_date = datetime(current_year, month, 7)

    elif quart % 1 == 0.5:  
        week_start_date = datetime(current_year, month, 8)
        week_end_date = datetime(current_year, month, 14)

    elif quart % 1 == 0.75:  
        week_start_date = datetime(current_year, month, 15)
        week_end_date = datetime(current_year, month, 21)

    elif quart % 1 == 0: 
        week_start_date = datetime(current_year, month, 22)
        last_day_of_month = calendar.monthrange(current_year, month)[1]
        week_end_date = datetime(current_year, month, last_day_of_month)

    return (week_start_date, week_end_date)


def insert_result_data_into_remain_plan(result_data):
    for entry in result_data:
        planname = entry.get('plan_name')
        planweek = entry.get('planweek')
        machine = entry.get('machine')
        zca = entry.get('materialcode')
        planamount = str(entry.get('plan', 0))
        pcsperpallet = entry.get('pcsperpallet', 1)

        field_ids = entry.get('field_ids', [])
        done_list = entry.get('done', [])
        remain_list = entry.get('remain', [])

        max_length = max(len(done_list), len(remain_list), len(field_ids))

        for i in range(max_length):
            total_submit = str(done_list[i]) if i < len(done_list) else '0'
            remain_qty = str(remain_list[i]) if i < len(remain_list) else '0'
            list_fillplan_id = field_ids[i] if i < len(field_ids) else None

            if pcsperpallet and float(pcsperpallet) != 0:
                remain_qty_float = float(remain_qty)
                pcsperpallet_float = float(pcsperpallet)
                remain_pallet = remain_qty_float/pcsperpallet_float
                # whole_pallets = int(remain_qty_float // pcsperpallet_float)
                # remainder_qty = int(remain_qty_float % pcsperpallet_float)
                # remain_pallet = f"{whole_pallets}({remainder_qty})"
            else:
                remain_pallet = 0

            obj, created = RemainPlan.objects.update_or_create(
                planname=planname,
                planweek=planweek,
                machine=machine,
                zca=zca,
                list_fillplan_link=list_fillplan_id,
                defaults={
                    'planname': planname,
                    'planweek': planweek,
                    'machine': machine,
                    'zca': zca,
                    'planamount': planamount,
                    'total_submit': total_submit,
                    'remain_pallet': remain_pallet,
                    'remain_qty': remain_qty,
                    'list_fillplan_link': list_fillplan_id,
                    'created': datetime.now(),
                }
            )



def store_remain():
    # today = date(2024, 10, 22)
    today = date.today()
    year = today.year
    week = get_week_number(today)
    date_range = get_week_range(week, today.year)
    
    plan_data = Tempactiveplan.objects.filter(
        starttime__gte=date_range[0],
        starttime__lte=date_range[1]
    ).values('materialcode', 'machine', 'planweek' ,'versionno').annotate(total_plancount=Sum('plancount'))

    plan_data_wk = Tempactiveplan.objects.filter(
        starttime__gte=date_range[0],
        starttime__lte=date_range[1]
    ).values('planweek').annotate(latest_version=Max('versionno'))

    latest_versions_map = {wk['planweek']: wk['latest_version'] for wk in plan_data_wk}


    done_data = ViewWmsListfillplanproduction.objects.filter(
        product_date__gte=date_range[0],
        product_date__lte=date_range[1],
        approve_fill='success'
    ).values(
        'id', 'zca_on', 'machine', 'pcsperpallet', 'name_th', 'kgpcs', 'product_date', 'qty_good', 'qty_loss', 'qty_lab'
    )

    grouped_done_data = defaultdict(lambda: {
        'total_goodcount': [],  # Store good counts as a list
        'total_loss': 0,
        'total_lab': 0,
        'field_ids': [],
    })
    for item in done_data:
        field_id = item['id']
        product_year=item['product_date'].year
        zca = item['zca_on']
        machine = item['machine']
        week_num = get_week_number(item['product_date'])
        week_number=f"{product_year}_{week_num}"
        key = (zca, machine, week_number)

        grouped_done_data[key]['total_goodcount'].append(item['qty_good'] or 0)
        grouped_done_data[key]['total_loss'] += item['qty_loss'] or 0
        grouped_done_data[key]['total_lab'] += item['qty_lab'] or 0
        grouped_done_data[key]['pcsperpallet'] = item['pcsperpallet']
        grouped_done_data[key]['name_th'] = item['name_th']
        grouped_done_data[key]['kgpcs'] = item['kgpcs']
        grouped_done_data[key]['field_ids'].append(field_id)

    done_dict = {
        (key[0], key[1], key[2]): {
            'total_goodcount': value['total_goodcount'],
            'pcsperpallet': value['pcsperpallet'],
            'name_th': value['name_th'],
            'kgpcs': value['kgpcs'],
            'field_ids': value['field_ids']
        }
        for key, value in grouped_done_data.items()
    }


    result_data = []

    for plan in plan_data:
        planweek = plan['planweek']
        versionno = plan['versionno']

        if planweek in latest_versions_map and versionno == latest_versions_map[planweek]:
            listmc_done=[]
            zca = plan['materialcode']
            plancount = plan['total_plancount'] or 0  
            machine_plan = plan['machine']
            listmc_done.append(machine_plan)
            planweek = plan['planweek']
            

            done_entry = done_dict.pop((zca, machine_plan, planweek), {}) 
            
            field_ids = done_entry.get('field_ids', [])
            goodcount_list = done_entry.get('total_goodcount', [])
            pcsperpallet = done_entry.get('pcsperpallet')
            name_th = done_entry.get('name_th')
            kgpcs = done_entry.get('kgpcs', 0)

            if not pcsperpallet or not name_th:
                if "ZCAW" in zca:
                    product = ViewItemmasterproductwip.objects.filter(field_zca=zca).first()
                    if product:
                        pcsperpallet = product.pcsperpallet if pcsperpallet is None or pcsperpallet == 1 else pcsperpallet
                        kgpcs = product.field_kgpcs if kgpcs is None or kgpcs == 1 else kgpcs
                        name_th = product.field_name
                elif "ZCA" in zca and "ZCAW" not in zca:
                    product = ViewItemmasterproductfg.objects.filter(zca=zca).first()
                    if product:
                        pcsperpallet = product.pcpallet if pcsperpallet is None or pcsperpallet == 1 else pcsperpallet
                        kgpcs = product.kg if kgpcs is None or kgpcs == 1 else kgpcs
                        name_th = product.name

            kgpcs = float(kgpcs) if kgpcs else 0
            pcsperpallet = float(pcsperpallet) if isinstance(pcsperpallet, str) else pcsperpallet

            # Calculate cumulative remains for each goodcount value
            remain_list = []
            remaining = plancount  # Start with the total plan count
            for goodcount in goodcount_list:
                remaining -= goodcount  # Subtract each done value from the remaining
                remain_list.append(remaining)  # Append the updated remaining value

            # Ensure that if there are no done counts, remain is set to the original plan count
            if not goodcount_list:
                remain_list = [plancount]

            result_data.append({
                'field_ids': field_ids,
                'materialcode': zca,
                'machine': machine_plan,
                'planweek': planweek,
                'listmc_done':listmc_done,
                'pcsperpallet': pcsperpallet,
                'plan': plancount,
                'done': goodcount_list, 
                'remain': remain_list, 
                'kgpcs': kgpcs,
                'plan_name': f"{year}_{planweek}_{machine_plan}_{zca}",
                'change':0
            })

    #เก็บเครื่องอื่น
    for item in result_data:
        zca = item['materialcode']
        week = item['planweek']
        matching_entries = {
            k: v for k, v in done_dict.items() if k[0] == zca and k[2] == week
        }

        # Process each matching entry if found
        if matching_entries:
            
            for key, done_entry in matching_entries.items():

                if len(item['done'])==0:
                    item['listmc_done'].pop()
                    item['listmc_done'].append(key[1])
                    item['change']=1
                elif len(item['done'])!=0:
                    item['listmc_done'].append(key[1])
                    item['change']=1
                done_data_out=done_entry.get('total_goodcount',[])

                done_data_list_out=done_entry.get('field_ids',[])
                total_plan=item['plan']
                for remain_summit in done_data_out:
                    item['done'].append(remain_summit)
                    if item['remain'][-1]:
                        last_re=item['remain'][-1]   
                        tem_remain=last_re-remain_summit    
                        if len(item['remain'])==1 and len(item['done'])==1:
                            item['remain'][-1]=tem_remain    
                        else:
                            item['remain'].append(tem_remain)    
                    
                    print(item)



                item['field_ids']+=done_data_list_out



    # print(result_data ,'\n')
    # print('insertdata')
    insert_result_data_into_remain_plan(result_data)


def insert_today_stock(result_data):
    today = date.today()


    with transaction.atomic():
        for entry in result_data:
            stock, created = StockHistory.objects.update_or_create(
                stock_date=today,
                zca=entry['zca_on'],
                defaults={
                    'name_th': entry['name'],
                    'cur_stock': entry['total_qty'],
                }
            )
            # if created:
            #     print(f"Created new entry for ZCA {entry['zca_on']} on {today}")
            # else:
            #     print(f"Updated entry for ZCA {entry['zca_on']} on {today}")



def get_all_today_stock():
    total_qty_sum = 0
    queryset = ViewWmsMapManagement.objects.values().order_by('-created_at')
    unique_lookup = get_unique_lookup(queryset)


    zca_on_data = defaultdict(lambda: defaultdict(lambda: {'total_qty': 0, 'levels': defaultdict(int)}))
    zca_on_names = {}  
    
    for item in unique_lookup.values():
        zca_on = item['zca_on']
        name_th = item['name_th']
        

        if zca_on not in zca_on_names:
            zca_on_names[zca_on] = name_th
        
        key = (item['warehouse_id'], item['zone'], item['row'], item['column'], item['sub_column'])
        
        qty_value = item.get('qty', 0)
        qty_value = int(qty_value) if qty_value is not None else 0


        pcsperpallet = item.get('pcsperpallet', 1)
        pcsperpallet = int(pcsperpallet) if pcsperpallet is not None else 1

        if item['level'] is None:
            pass
            # print(f"Found item with level None: {item}")

        zca_on_data[zca_on][key]['total_qty'] += qty_value
        zca_on_data[zca_on][key]['levels'][item['level']] += qty_value
        
        total_qty_sum += qty_value

    response_data = []

    for zca_on, zone_row_column_data in zca_on_data.items():

        sorted_keys = sorted(
            zone_row_column_data.keys(),
            key=lambda k: (
                str(k[0]) if k[0] is not None else '',
                int(k[1]) if k[1] is not None and isinstance(k[1], int) else -1,
                int(k[2]) if k[2] is not None and isinstance(k[2], int) else -1,
                int(k[3]) if k[3] is not None and isinstance(k[3], int) else -1
            )
        )

        # Get the stored name_th for this zca_on
        name_th = zca_on_names.get(zca_on, 'N/A')  # Fallback in case name_th is missing

        # Calculate total_qty for each zca_on
        total_qty = sum([zone_row_column_data[key]['total_qty'] for key in sorted_keys])

        # Find zca_on child


        zca_response = {
            'zca_on': zca_on,
            'name': name_th, 
            'total_qty': total_qty,

        }

        response_data.append(zca_response)
    insert_today_stock(response_data)





def start_scheduler():
    if not scheduler.running:
        scheduler.start()

    def job_function():
        try:
            store_remain()
            # print('Job executed remain')
        except Exception as e:
            print(e)

    def job_function_line():
        try:
            post()
            print('Job executed line')
        except Exception as e:
            print(e)

    def job_function_stock():
        try:
            get_all_today_stock()
            # print('Job executed remain')
        except Exception as e:
            print(e)


    if scheduler.get_job('Line_001') is None:

        trigger = CronTrigger(
        year="*", month="*", day="*", hour="18", minute="0", second="0"
    )
 
        # scheduler.add_job(job_function_line,trigger, id='Line_001', replace_existing=True)

        scheduler.add_job(job_function, 'interval', minutes=1, id='Remain_001', replace_existing=True)
        scheduler.add_job(job_function_stock, 'interval', minutes=3, id='Stock_001', replace_existing=True)
        # scheduler.add_job(job_function_stock,trigger, id='Stock_001', replace_existing=True)

        print('add job',scheduler.get_job('Remain_001'))  
        print('add job',scheduler.get_job('Stock_001'))  

    else:
        print('Job already exists, skipping job addition')

if __name__ == "__main__":
    start_scheduler()
