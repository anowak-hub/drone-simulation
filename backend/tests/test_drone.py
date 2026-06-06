import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from simulation.drone import Drone

def test_initial_state():
    drone = Drone("drone-1", (0, 0))
    assert drone.position == (0, 0)
    assert drone.status == "idle"
    print("test_initial_state passed")

def test_assign_path():
    drone = Drone("drone-1", (0, 0))
    drone.assign_path([(0,0), (1,0), (2,0)])
    assert drone.status == "moving"
    print("test_assign_path passed")

def test_step_movement():
    drone = Drone("drone-1", (0, 0))
    drone.assign_path([(0,0), (1,0), (2,0)])
    drone.step()
    assert drone.position == (1, 0)
    print("test_step_movement passed")

def test_arrival():
    drone = Drone("drone-1", (0, 0))
    drone.assign_path([(0,0), (1,0), (2,0)])
    drone.step()
    drone.step()
    drone.step()
    assert drone.status == "arrived"
    assert drone.is_done() == True
    print("test_arrival passed")

if __name__ == "__main__":
    test_initial_state()
    test_assign_path()
    test_step_movement()
    test_arrival()
    print("\nAll drone tests passed.")