import { useEffect, useState } from 'react';
import { getDrone, setObstacles } from '../services/api';
import type { Telemetry, MissionStatus } from '../types/drone';
import TelemetryPanel from '../components/TelemetryPanel';
import MissionControls from '../components/MissionControls';
import Map from '../components/Map';


const Dashboard = () => {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [path, setPath] = useState<[number, number][]>([]);
    const [missionStatus, setMissionStatus] = useState<string>('');
    const [origin, setOrigin] = useState<[number, number] | null>(null);
    const [obstacleList, setObstacleList] = useState<[number, number][]>([
        [3, 3], [3, 4], [3, 5], [3, 6]
    ]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            const droneData = await getDrone();
            setOrigin([droneData.position[0], droneData.position[1]])
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

    const handleObstaclesChange = async (updated: [number, number][]) => {
        setObstacleList(updated);
        await setObstacles(updated);
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
                <span style={{ fontSize: '20px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                        <path d="M6.5 8.5 4 6M17.5 8.5 20 6M6.5 15.5 4 18M17.5 15.5 20 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="4" cy="5.5" r="2" fill="white"/>
                        <circle cx="20" cy="5.5" r="2" fill="white"/>
                        <circle cx="4" cy="18.5" r="2" fill="white"/>
                        <circle cx="20" cy="18.5" r="2" fill="white"/>
                        <rect x="7" y="9" width="10" height="6" rx="2" fill="white"/>
                    </svg>
                </span>
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
                    <Map telemetry={telemetry} path={path} origin={origin} obstacleList={obstacleList} onObstaclesChange={handleObstaclesChange}/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;