from simulation.drone import Drone
from simulation.world import World
from algorithms.astar import astar

class Mission:
    def __init__(self, mission_id: str, drone: Drone, world: World, goal: tuple[int, int]):
        self.mission_id = mission_id
        self.drone = drone
        self.world = world
        self.goal = goal
        self.status = "pending" # pending, active, complete, failed

    def start(self):
        path = astar(self.world, self.drone.position, self.goal)
        if not path:
            self.status = "failed"
            print(f"Mission {self.mission_id} failed: no path found")
            return 
        
        self.drone.assign_path(path)
        self.status = "active"
        print(f"Mission {self.mission_id} started. Path length: {len(path)} steps")

    def update(self):
        if self.status != "active":
            return
        
        self.drone.step()

        if self.drone.is_done():
            self.status = "complete"
            print (f"Mission {self.mission_id} complete. Drone arrived at {self.drone.position}.")

    def is_complete(self):
        return self.status == "complete"
    
    def __repr__(self):
        return f"Mission(id={self.mission_id}, status={self.status}, goal={self.goal})"
    