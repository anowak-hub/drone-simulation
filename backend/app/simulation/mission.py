from simulation.drone import Drone
from simulation.world import World
from algorithms.astar import astar
from algorithms.dijsktra import dijkstra

ALGORITHMS = {
    "astar": astar,
    "dijkstra": dijkstra,
}

class Mission:
    def __init__(self, mission_id: str, drone: Drone, world: World, goal: tuple[int, int], algorithm: str = "astar"):
        self.mission_id = mission_id
        self.drone = drone
        self.world = world
        self.goal = goal
        self.status = "pending"
        self.algorithm = ALGORITHMS.get(algorithm, astar)
        self.algorithm_name = algorithm
        self.wait_steps = 0
        self.max_wait = 3

    def start(self):
        path = self.algorithm(self.world, self.drone.position, self.goal)
        if not path:
            self.status = "failed"
            print(f"Mission {self.mission_id} failed: no path found")
            return

        self.drone.assign_path(path)
        self.status = "active"
        print(f"Mission {self.mission_id} started via {self.algorithm_name}. Path length: {len(path)} steps")

    def update(self, occupied: set[tuple[int, int]] = set()):
        if self.status != "active":
            return

        if self.drone.path_index < len(self.drone.path) - 1:
            next_pos = self.drone.path[self.drone.path_index + 1]

            if next_pos in occupied:
                self.wait_steps += 1

                if self.wait_steps >= self.max_wait:
                    # Recalculate path treating occupied as obstacles
                    self.world.obstacles.update(occupied)
                    new_path = self.algorithm(self.world, self.drone.position, self.goal)
                    self.world.obstacles.difference_update(occupied)

                    if new_path:
                        self.drone.assign_path(new_path)
                        print(f"Mission {self.mission_id} recalculated path to avoid collision")
                    self.wait_steps = 0
                return

        self.wait_steps = 0
        self.drone.step(occupied)

        if self.drone.is_done():
            self.status = "complete"
            print(f"Mission {self.mission_id} complete. Drone arrived at {self.drone.position}.")

    def is_complete(self):
        return self.status == "complete"

    def __repr__(self):
        return f"Mission(id={self.mission_id}, status={self.status}, goal={self.goal}, algorithm={self.algorithm_name})"