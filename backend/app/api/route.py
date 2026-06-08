from fastapi import APIRouter
from simulation.world import World
from simulation.drone import Drone
from simulation.mission import Mission
from simulation.telemetry import Telemetry

router = APIRouter()

world = World(10,10)
world.add_obstacle(3,3)
world.add_obstacle(3, 4)
world.add_obstacle(3, 5)
world.add_obstacle(3, 6)

drone = Drone("drone-1", (0,0))
telemetry = Telemetry(drone)
mission = None

@router.post("/mission/start")

def start_mission(goalX: int, goalY: int):
    global mission
    mission = Mission("mission-1", drone, world, goal=(goalX, goalY))
    mission.start()
    
    return {"status": mission.status, "goal": [goalX, goalY]}

@router.post("/mission/step")

def step_mission():
    if mission is None:
        return {"Error": "No mission started"}
    
    mission.update()
    telemetry.update()

    return {
        "position": list(drone.position),
        "battery": telemetry.battery,
        "steps": telemetry.steps_taken,
        "status": drone.status,
        "mission_status": mission.status
    }

@router.get("/telemetry")

def get_telemetry():
    return {
        "position": list(drone.position),
        "battery": telemetry.battery,
        "steps": telemetry.steps_taken,
        "status": drone.status
    }

@router.get("/world")

def get_world():
    return {
        "width": world.width,
        "height": world.height,
        "obstacles": list(world.obstacles)
    }