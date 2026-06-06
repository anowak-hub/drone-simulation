import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from simulation.world import World
from simulation.obstacle import Obstacle
from simulation.drone import Drone
from algorithms.astar import astar

# Create a 10x10 grid
world = World(10, 10)

# Place obstacles
obstacles = [
    Obstacle(3, 3, label="building"),
    Obstacle(3, 4, label="building"),
    Obstacle(3, 5, label="building"),
    Obstacle(3, 6, label="building"),
]

for obs in obstacles:
    world.add_obstacle(obs.x, obs.y)

# Define start and goal
start = (0, 0)
goal = (9, 9)

# Find path
path = astar(world, start, goal)

if not path:
    print("No path found.")
else:
    print(f"Path found ({len(path)} steps):")
    print(path)

    # Assign path to drone and simulate movement
    drone = Drone("drone-1", start)
    drone.assign_path(path)

    print(f"\nSimulating drone movement:")
    while not drone.is_done():
        drone.step()
        print(drone)