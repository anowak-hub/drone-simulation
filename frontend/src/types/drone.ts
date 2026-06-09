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
    position: [number, number];
    battery: number;
    steps: number;
    status: string;
    mission_status: string;
}