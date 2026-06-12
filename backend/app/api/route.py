from fastapi import APIRouter
from simulation.world import World
from simulation.drone import Drone
from simulation.mission import Mission
from simulation.telemetry import Telemetry

router = APIRouter()

world = World(10, 10)
world.add_obstacle(3, 3)
world.add_obstacle(3, 4)
world.add_obstacle(3, 5)
world.add_obstacle(3, 6)

drones = {
    "drone-1": Drone("drone-1", (0, 0)),
    "drone-2": Drone("drone-2", (0, 9)),
    "drone-3": Drone("drone-3", (9, 0)),
}

telemetry = {
    drone_id: Telemetry(drone)
    for drone_id, drone in drones.items()
}

missions: dict[str, Mission] = {}

@router.post("/mission/start")
def start_mission(drone_id: str, goal_x: int, goal_y: int, algorithm: str = "astar"):
    if drone_id not in drones:
        return {"error": f"Drone {drone_id} not found"}
    drone = drones[drone_id]
    mission = Mission(
        f"mission-{drone_id}",
        drone,
        world,
        waypoints=[(goal_x, goal_y)],
        algorithm=algorithm
    )
    mission.start()
    missions[drone_id] = mission
    return {
        "drone_id": drone_id,
        "status": mission.status,
        "goal": [goal_x, goal_y],
        "algorithm": algorithm,
    }

@router.post("/mission/queue")
def queue_mission(drone_id: str, algorithm: str = "astar", waypoints: list[list[int]] = []):
    if drone_id not in drones:
        return {"error": f"Drone {drone_id} not found"}
    if not waypoints:
        return {"error": "No waypoints provided"}

    drone = drones[drone_id]
    mission = Mission(
        f"mission-{drone_id}",
        drone,
        world,
        waypoints=[tuple(w) for w in waypoints],
        algorithm=algorithm
    )
    mission.start()
    missions[drone_id] = mission
    return {
        "drone_id": drone_id,
        "status": mission.status,
        "waypoints": waypoints,
        "algorithm": algorithm,
    }

@router.post("/mission/step")
def step_mission(drone_id: str):
    if drone_id not in missions:
        return {"error": f"No mission for {drone_id}"}

    occupied = {
        tuple(drone.position)
        for did, drone in drones.items()
        if did != drone_id and drone.status == "moving"
    }

    mission = missions[drone_id]
    mission.update(occupied)
    telemetry[drone_id].update()
    drone = drones[drone_id]

    return {
        "drone_id": drone_id,
        "position": list(drone.position),
        "battery": telemetry[drone_id].battery,
        "steps": telemetry[drone_id].steps_taken,
        "status": drone.status,
        "mission_status": mission.status,
        "current_waypoint": mission.current_waypoint_index,
        "total_waypoints": len(mission.waypoints),
    }

@router.get("/fleet")
def get_fleet():
    return {
        drone_id: {
            "position": list(drone.position),
            "battery": telemetry[drone_id].battery,
            "steps": telemetry[drone_id].steps_taken,
            "status": drone.status,
            "mission_status": missions[drone_id].status if drone_id in missions else "none",
            "current_waypoint": missions[drone_id].current_waypoint_index if drone_id in missions else 0,
            "total_waypoints": len(missions[drone_id].waypoints) if drone_id in missions else 0,
        }
        for drone_id, drone in drones.items()
    }

@router.get("/telemetry")
def get_telemetry():
    return {
        drone_id: {
            "position": list(drone.position),
            "battery": telemetry[drone_id].battery,
            "steps": telemetry[drone_id].steps_taken,
            "status": drone.status,
        }
        for drone_id, drone in drones.items()
    }

@router.get("/world")
def get_world():
    return {
        "width": world.width,
        "height": world.height,
        "obstacles": list(world.obstacles),
    }

@router.get("/drone")
def get_drone():
    return {
        drone_id: {
            "position": list(drone.position),
            "status": drone.status,
        }
        for drone_id, drone in drones.items()
    }

@router.post("/world/obstacles")
def set_obstacles(obstacle_list: list[list[int]]):
    world.obstacles = set(tuple(o) for o in obstacle_list)
    return {"obstacles": list(world.obstacles)}

@router.post("/threat/add")
def add_threat(x: int, y: int):
    world.add_obstacle(x, y)
    return {"threats": list(world.obstacles)}

@router.post("/reset")
def reset():
    drones["drone-1"].position = (0, 0)
    drones["drone-2"].position = (0, 9)
    drones["drone-3"].position = (9, 0)

    for drone in drones.values():
        drone.status = "idle"
        drone.path = []
        drone.path_index = 0

    for t in telemetry.values():
        t.battery = 100.0
        t.steps_taken = 0
        t.log = []

    missions.clear()
    world.threat_zones.clear()

    return {"status": "reset"}

@router.get("/world/threats")
def get_threats():
    return {
        "threats": [list(t) for t in world.threat_zones]
    }

@router.post("/world/threats/add")
def add_threat(x: int, y: int):
    world.add_threat(x, y)
    return {"threats": [list(t) for t in world.threat_zones]}

@router.post("/world/threats/remove")
def remove_threat(x: int, y: int):
    world.remove_threat(x, y)
    return {"threats": [list(t) for t in world.threat_zones]}

@router.post("/world/threats/clear")
def clear_threats():
    world.threat_zones.clear()
    return {"threats": []}