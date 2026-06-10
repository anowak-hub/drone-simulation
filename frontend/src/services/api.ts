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

export const startMission = async (goalX: number, goalY: number) => {
    const res = await axios.post(`${BASE_URL}/mission/start`, null, {
        params: { goal_x: goalX, goal_y: goalY }
    });
    return res.data;
};

export const stepMission = async () => {
    const res = await axios.post(`${BASE_URL}/mission/step`);
    return res.data;
};

export const getDrone = async () => {
    const res = await axios.get(`${BASE_URL}/drone`);
    return res.data;
};