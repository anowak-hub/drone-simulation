from simulation.drone import Drone

class Telemetry:
    def __init__(self, drone: Drone, battery_drain_per_step: float = 1.0):
        self.drone = drone
        self.battery = 100.0
        self.battery_drain_per_step = battery_drain_per_step
        self.steps_taken = 0
        self.log: list[dict] = []

    def update(self):
        if self.drone.status != "moving":
            return
        
        self.battery -= self.battery_drain_per_step
        self.steps_taken += 1

        entry = {
            "step": self.steps_taken,
            "position": self.drone.position,
            "battery": round(self.battery, 2),
            "status": self.drone.status
        }

        self.log.append(entry)

        if self.battery <= 0:
            self.drone.status = "stuck"
            print (f"Drone {self.drone.drone_id} battery depleted.")
        
    def report(self):
        print(f"\nTelemetry Report - Drone {self.drone.drone_id}")
        print(f"    Steps Taken:    {self.steps_taken}")
        print(f"    Battery Remaining:    {round(self.battery, 2)}%")
        print(f"    Final Position:    {self.drone.position}")
        print(f"    Status:    {self.drone.status}")

    def __repr__(self):
        return f"Telemetry(drone={self.drone.drone_id}, battery={self.battery}, steps={self.steps_taken})"
        