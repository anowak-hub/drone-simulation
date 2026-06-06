import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from simulation.world import World
from simulation.obstacle import Obstacle
from simulation.drone import Drone
from simulation.mission import Mission
from simulation.telemetry import Telemetry

def test_mission_complete():
    world = World(10, 10)
    obstacles = [
        Obstacle(3, 3, label="building"),
        Obstacle(3, 4, label="building"),
        Obstacle(3, 5, label="building"),
    ]
    for obs in obstacles:
        world.add_obstacle(obs.x, obs.y)

    drone = Drone("drone-1", (0, 0))
    telemetry = Telemetry(drone)
    mission = Mission("mission-1", drone, world, goal=(9, 9))

    mission.start()

    while not mission.is_complete():
        mission.update()
        telemetry.update()

    telemetry.report()

    assert drone.position == (9, 9)
    assert mission.status == "complete"
    assert telemetry.steps_taken > 0
    assert telemetry.battery < 100.0
    print("test_mission_complete passed")

def test_mission_failed():
    world = World(5, 5)
    for y in range(5):
        world.add_obstacle(2, y)

    drone = Drone("drone-1", (0, 0))
    mission = Mission("mission-2", drone, world, goal=(4, 4))

    mission.start()

    assert mission.status == "failed"
    print("test_mission_failed passed")

if __name__ == "__main__":
    test_mission_complete()
    test_mission_failed()
    print("\nAll mission tests passed.")