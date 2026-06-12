import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export const getWorld = async () => {
    const res = await axios.get(`${BASE_URL}/world`);
    return res.data;
};

export const getTelemetry = async () => {
    const res = await axios.get(`${BASE_URL}/telemetry`);
    return res.data;
};

export const getDrone = async () => {
    const res = await axios.get(`${BASE_URL}/drone`);
    return res.data;
};

export const getFleet = async () => {
    const res = await axios.get(`${BASE_URL}/fleet`);
    return res.data;
};

export const startMission = async (droneId: string, goalX: number, goalY: number, algorithm: string) => {
    const res = await axios.post(`${BASE_URL}/mission/start`, null, {
        params: { drone_id: droneId, goal_x: goalX, goal_y: goalY, algorithm }
    });
    return res.data;
};

export const stepMission = async (droneId: string) => {
    const res = await axios.post(`${BASE_URL}/mission/step`, null, {
        params: { drone_id: droneId }
    });
    return res.data;
};

export const setObstacles = async (obstacles: [number, number][]) => {
    const res = await axios.post(`${BASE_URL}/world/obstacles`, obstacles);
    return res.data;
};

export const resetSimulation = async () => {
    const res = await axios.post(`${BASE_URL}/reset`);
    return res.data;
};

export const queueMission = async (droneId: string, waypoints: [number, number][], algorithm: string) => {
    const res = await axios.post(`${BASE_URL}/mission/queue`, waypoints, {
        params: { drone_id: droneId, algorithm }
    });
    return res.data;
};

export const getThreats = async () => {
    const res = await axios.get(`${BASE_URL}/world/threats`);
    return res.data;
};

export const addThreat = async (x: number, y: number) => {
    const res = await axios.post(`${BASE_URL}/world/threats/add`, null, {
        params: { x, y }
    });
    return res.data;
};

export const removeThreat = async (x: number, y: number) => {
    const res = await axios.post(`${BASE_URL}/world/threats/remove`, null, {
        params: { x, y }
    });
    return res.data;
};

export const clearThreats = async () => {
    const res = await axios.post(`${BASE_URL}/world/threats/clear`);
    return res.data;
};