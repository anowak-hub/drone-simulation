import { useEffect, useState } from 'react';
import { getWorld, getDrone } from '../services/api';
import type { World, Telemetry, MissionStatus } from '../types/drone';
import TelemetryPanel from '../components/TelemetryPanel';
import MissionControls from '../components/MissionControls';
import Map from '../components/Map';


const Dashboard = () => {
    const [world, setWorld] = useState<World | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [path, setPath] = useState<[number, number][]>([]);
    const [missionStatus, setMissionStatus] = useState<string>('');
    const [origin, setOrigin] = useState<[number, number] | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const worldData = await getWorld();
            setWorld(worldData);
            const droneData = await getDrone();
            setOrigin([droneData.position[0], droneData.position[1]]);
        };
        fetchInitialData();
    }, []);

    const handleMissionUpdate = (data: MissionStatus) => {
        setTelemetry({
            position: data.position,
            battery: data.battery,
            steps: data.steps,
            status: data.status,
        });
        setPath(prev => {
            if (prev.length === 0) setOrigin([data.position[0], data.position[1]]);
            return [...prev, data.position];
        });
        setMissionStatus(data.mission_status);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#000',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #2C2C2E',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <span style={{ fontSize: '20px' }}>🛸</span>
                <span style={{
                    fontSize: '17px',
                    fontWeight: 600,
                    letterSpacing: '-0.3px',
                    color: '#fff',
                }}>
                    Drone Mission Simulator
                </span>
                {missionStatus && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '13px',
                        fontWeight: 500,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: missionStatus === 'complete' ? '#0D3B1E' : '#0A2540',
                        color: missionStatus === 'complete' ? '#30D158' : '#0A84FF',
                    }}>
                        {missionStatus === 'complete' ? '✓ Mission Complete' : '⬤ Mission Active'}
                    </span>
                )}
            </div>

            {/* Main content */}
            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
            }}>
                {/* Sidebar */}
                <div style={{
                    width: '300px',
                    minWidth: '300px',
                    background: '#1C1C1E',
                    borderRight: '1px solid #2C2C2E',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    overflowY: 'auto',
                }}>
                    <MissionControls onMissionUpdate={handleMissionUpdate} />
                    <TelemetryPanel telemetry={telemetry} />
                </div>

                {/* Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <Map world={world} telemetry={telemetry} path={path} origin={origin} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;