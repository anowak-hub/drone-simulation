import { useState, useEffect, useRef } from 'react';
import { startMission, stepMission } from '../services/api';
import type { MissionStatus } from '../types/drone';

interface Props {
    onMissionUpdate: (data: MissionStatus) => void;
}

const MissionControls = ({ onMissionUpdate }: Props) => {
    const [goalX, setGoalX] = useState<number | ''>('');
    const [goalY, setGoalY] = useState<number | ''>('');
    const [missionActive, setMissionActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const stopStepping = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setMissionActive(false);
    };

    const handleStart = async () => {
        await startMission(Number(goalX), Number(goalY));
        setMissionActive(true);

        intervalRef.current = setInterval(async () => {
            const data = await stepMission();
            onMissionUpdate(data);
            if (data.mission_status === 'complete' || data.status === 'stuck') {
                stopStepping();
            }
        }, 500);
    };

    useEffect(() => {
        return () => stopStepping();
    }, []);

    const isValid = goalX !== '' && goalY !== '';

    return (
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2C2C2E' }}>
            <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.8px',
                color: '#8E8E93',
                textTransform: 'uppercase',
                marginBottom: '16px',
            }}>
                Mission Controls
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '15px', color: '#fff' }}>Goal X</label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <input
                            type="number"
                            value={goalX}
                            onChange={e => setGoalX(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={missionActive}
                            placeholder="0–9"
                        />
                        {goalX === '' && (
                            <span style={{ fontSize: '11px', color: '#FF453A' }}>Enter a valid value</span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '15px', color: '#fff' }}>Goal Y</label>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <input
                            type="number"
                            value={goalY}
                            onChange={e => setGoalY(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={missionActive}
                            placeholder="0–9"
                        />
                        {goalY === '' && (
                            <span style={{ fontSize: '11px', color: '#FF453A' }}>Enter a valid value</span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleStart}
                    disabled={missionActive || !isValid}
                    style={{
                        flex: 1,
                        background: '#0A84FF',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '10px',
                    }}
                >
                    {missionActive ? 'Active...' : 'Start Mission'}
                </button>
                <button
                    onClick={stopStepping}
                    disabled={!missionActive}
                    style={{
                        background: '#2C2C2E',
                        color: '#FF453A',
                        borderRadius: '10px',
                        padding: '10px 16px',
                    }}
                >
                    Abort
                </button>
            </div>
        </div>
    );
};

export default MissionControls;