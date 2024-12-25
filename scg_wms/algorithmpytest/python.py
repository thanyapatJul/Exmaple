import simpy
import pandas as pd
import numpy as np
from collections import defaultdict

# Example SCM Plan with multiple dates
plan_data = pd.DataFrame({
    'zca': ['ZCA1', 'ZCA2', 'ZCA1', 'ZCA3', 'ZCA2', 'ZCA1'],
    'machine': ['Machine_A', 'Machine_B', 'Machine_A', 'Machine_C', 'Machine_B', 'Machine_A'],
    'date': ['2024-11-01', '2024-11-01', '2024-11-02', '2024-11-02', '2024-11-03', '2024-11-03'],
    'shift': ['A', 'A', 'B', 'C', 'A', 'B'],
    'planned_quantity': [200, 150, 180, 130, 160, 140]
})

# Historical KPIs for each ZCA (example data)
zca_kpis_data = {
    'zca': ['ZCA1', 'ZCA2', 'ZCA3'],
    'rate_per_hour': [25, 20, 15],    # Production rate per hour for each ZCA
    'availability_rate': [0.9, 0.85, 0.8],  # Machine availability for each ZCA
    'quality_rate': [0.95, 0.9, 0.88],      # Quality rate (good items percentage)
    'allowed_machines': [['Machine_A', 'Machine_C'], ['Machine_B'], ['Machine_A', 'Machine_B', 'Machine_C']]
}
zca_kpis = pd.DataFrame(zca_kpis_data)

# Simulation environment
env = simpy.Environment()

# Shift duration and shift time definitions
shift_duration = 8  # Each shift lasts 8 hours
shift_times = {'A': (8, 16), 'B': (16, 24), 'C': (0, 8)}

# Delayed Production Tracking
delayed_productions = defaultdict(list)  # Tracks delayed quantities by machine and ZCA

# Machine Process Class
class Machine:
    def __init__(self, env, name, zca_info):
        self.env = env
        self.name = name
        self.zca_info = zca_info  # Dictionary of ZCA-specific availability, quality, and rate
        self.total_produced = 0
        self.total_good = 0
        self.total_rejects = 0
        self.process = env.process(self.run())  # Start machine process

    def produce(self, planned_qty, zca, production_date):
        # Retrieve ZCA-specific KPIs
        zca_data = self.zca_info[zca]
        availability_rate = zca_data['availability_rate']
        quality_rate = zca_data['quality_rate']
        rate_per_hour = zca_data['rate_per_hour']

        # Determine if the machine is available for this ZCA during the shift
        if np.random.rand() < availability_rate:
            # Machine is available
            potential_production = rate_per_hour * shift_duration
            actual_production = min(planned_qty, potential_production)
            good_qty = actual_production * quality_rate
            reject_qty = actual_production - good_qty

            # Update totals
            self.total_produced += actual_production
            self.total_good += good_qty
            self.total_rejects += reject_qty

            print(f"{self.env.now}: {self.name} produced {good_qty:.2f} good items and {reject_qty:.2f} rejects for {zca} on {production_date}.")
            return good_qty, reject_qty, 0  # No delay in this case
        else:
            # Machine is unavailable, entire quantity is delayed
            print(f"{self.env.now}: {self.name} is down for this shift for {zca} on {production_date}.")
            return 0, 0, planned_qty  # Entire quantity is delayed

    def run(self):
        while True:
            # Wait for the shift duration before starting the next shift
            yield self.env.timeout(shift_duration)

# Initialize Machines with ZCA-specific KPIs
machines = {}
for _, row in zca_kpis.iterrows():
    zca = row['zca']
    zca_kpi_data = {
        'availability_rate': row['availability_rate'],
        'quality_rate': row['quality_rate'],
        'rate_per_hour': row['rate_per_hour']
    }
    for machine_name in row['allowed_machines']:
        if machine_name not in machines:
            machines[machine_name] = Machine(env, machine_name, {})
        machines[machine_name].zca_info[zca] = zca_kpi_data

# Simulate production over multiple dates with delay management
results = []
for date, day_plan in plan_data.groupby('date'):
    print(f"\nSimulating production for date: {date}")
    for _, plan in day_plan.iterrows():
        # Get machine and ZCA details
        zca = plan['zca']
        machine_name = plan['machine']
        machine = machines.get(machine_name)

        # Get any delayed quantities for this ZCA and machine
        delayed_qty = sum(item['quantity'] for item in delayed_productions[(machine_name, zca)])
        total_quantity = plan['planned_quantity'] + delayed_qty
        
        if machine and zca in machine.zca_info:
            # Calculate actual production for this shift, prioritize delayed quantities
            good_qty, reject_qty, remaining_qty = machine.produce(total_quantity, zca, date)
            
            # Record the production result
            results.append({
                'planned_date': date,
                'actual_date': date if remaining_qty == 0 else "delayed",
                'machine': machine_name,
                'shift': plan['shift'],
                'zca': zca,
                'planned_quantity': plan['planned_quantity'],
                'good_quantity': good_qty,
                'reject_quantity': reject_qty,
                'delayed_quantity': remaining_qty
            })
            
            # Track remaining delayed quantity for the next available shift
            if remaining_qty > 0:
                delayed_productions[(machine_name, zca)].append({'quantity': remaining_qty, 'date': date})

# Convert results to DataFrame for further analysis
simulation_results = pd.DataFrame(results)
print("\nSimulation Results:")
print(simulation_results)
