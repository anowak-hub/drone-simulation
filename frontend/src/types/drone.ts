export interface World {
    width: number;
    height: number;
    obstacles: [number, number][];
}

export interface Telemetry {
    position: [number, number];
    battery: number;
    steps: number;
    status: string;
}

export interface MissionStatus {
    drone_id: string;
    position: [number, number];
    battery: number;
    steps: number;
    status: string;
    mission_status: string;
}

export interface DroneState {
    position: [number, number];
    battery: number;
    steps: number;
    status: string;
    mission_status: string;
}

export interface FleetState {
    [drone_id: string]: DroneState;
}