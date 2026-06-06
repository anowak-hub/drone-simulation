import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from simulation.world import World
from algorithms.astar import astar

def test_basic_path():
    world = World(10, 10)
    path = astar(world, (0, 0), (9, 9))
    assert path[0] == (0, 0)
    assert path[-1] == (9, 9)
    print("test_basic_path passed")

def test_obstacle_avoidance():
    world = World(10, 10)
    for y in range(0, 8):
        world.add_obstacle(3, y)
    path = astar(world, (0, 0), (9, 9))
    assert (3, 0) not in path
    print("test_obstacle_avoidance passed")

def test_no_path():
    world = World(5, 5)
    for y in range(5):
        world.add_obstacle(2, y)
    path = astar(world, (0, 0), (4, 4))
    assert path == []
    print("test_no_path passed")

if __name__ == "__main__":
    test_basic_path()
    test_obstacle_avoidance()
    test_no_path()
    print("\nAll astar tests passed.")