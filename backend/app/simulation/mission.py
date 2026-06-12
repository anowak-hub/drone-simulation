from simulation.drone import Drone
from simulation.world import World
from algorithms.astar import astar
from algorithms.dijsktra import dijkstra

ALGORITHMS = {
    "astar": astar,
    "dijkstra": dijkstra,
}

class Mission:
    def __init__(self, mission_id: str, drone: Drone, world: World, waypoints: list[tuple[int, int]], algorithm: str = "astar"):
        self.mission_id = mission_id
        self.drone = drone
        self.world = world
        self.waypoints = list(waypoints)
        self.current_waypoint_index = 0
        self.status = "pending"
        self.algorithm = ALGORITHMS.get(algorithm, astar)
        self.algorithm_name = algorithm
        self.wait_steps = 0
        self.max_wait = 3

    @property
    def goal(self):
        if self.current_waypoint_index < len(self.waypoints):
            return self.waypoints[self.current_waypoint_index]
        return None

    def start(self):
        if not self.waypoints:
            self.status = "failed"
            return

        self._navigate_to_current_waypoint()

    def _navigate_to_current_waypoint(self):
        goal = self.goal
        if goal is None:
            self.status = "complete"
            return

        path = self.algorithm(self.world, self.drone.position, goal)
        if not path:
            self.status = "failed"
            print(f"Mission {self.mission_id} failed: no path to waypoint {self.current_waypoint_index}")
            return

        self.drone.assign_path(path)
        self.status = "active"
        print(f"Mission {self.mission_id} navigating to waypoint {self.current_waypoint_index}: {goal}")

    def update(self, occupied: set[tuple[int, int]] = set()):
        if self.status != "active":
            return

        if self.drone.path_index < len(self.drone.path) - 1:
            next_pos = self.drone.path[self.drone.path_index + 1]

            if next_pos in occupied:
                self.wait_steps += 1
                if self.wait_steps >= self.max_wait:
                    self.world.obstacles.update(occupied)
                    new_path = self.algorithm(self.world, self.drone.position, self.goal)
                    self.world.obstacles.difference_update(occupied)
                    if new_path:
                        self.drone.assign_path(new_path)
                    self.wait_steps = 0
                return

        self.wait_steps = 0
        self.drone.step(occupied)

        if self.drone.is_done():
            self.current_waypoint_index += 1
            if self.current_waypoint_index >= len(self.waypoints):
                self.status = "complete"
                print(f"Mission {self.mission_id} all waypoints complete.")
            else:
                print(f"Mission {self.mission_id} reached waypoint, moving to next.")
                self._navigate_to_current_waypoint()

    def is_complete(self):
        return self.status == "complete"

    def __repr__(self):
        return f"Mission(id={self.mission_id}, status={self.status}, waypoints={self.waypoints}, algorithm={self.algorithm_name})"