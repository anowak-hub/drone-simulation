import { useState, useEffect, useRef } from 'react';
import { startMission, stepMission } from '../services/api';
import type { MissionStatus } from '../types/drone';

interface Props {
    onMissionUpdate: (data: MissionStatus) => void;
}

const isInBounds = (val: number) => val >= 0 && val <= 9;

const DRONE_IDS = ['drone-1', 'drone-2', 'drone-3'];

const MissionControls = ({ onMissionUpdate }: Props) => {
    const [selectedDrone, setSelectedDrone] = useState<string>('drone-1');
    const [goalX, setGoalX] = useState<number | ''>('');
    const [goalY, setGoalY] = useState<number | ''>('');
    const [activeDrones, setActiveDrones] = useState<Set<string>>(new Set());
    const intervalsRef = useRef<Record<string, number>>({});

    const stopStepping = (droneId: string) => {
        if (intervalsRef.current[droneId]) {
            clearInterval(intervalsRef.current[droneId]);
            delete intervalsRef.current[droneId];
        }
        setActiveDrones(prev => {
            const next = new Set(prev);
            next.delete(droneId);
            return next;
        });
    };

    const handleStart = async () => {
        const droneId = selectedDrone;
        await startMission(droneId, Number(goalX), Number(goalY));
        setActiveDrones(prev => new Set(prev).add(droneId));

        intervalsRef.current[droneId] = setInterval(async () => {
            const data = await stepMission(droneId);
            onMissionUpdate(data);
            if (data.mission_status === 'complete' || data.status === 'stuck') {
                stopStepping(droneId);
            }
        }, 500);
    };

    const handleAbort = () => stopStepping(selectedDrone);

    useEffect(() => {
        return () => {
            Object.keys(intervalsRef.current).forEach(stopStepping);
        };
    }, []);

    const xValid = goalX !== '' && isInBounds(Number(goalX));
    const yValid = goalY !== '' && isInBounds(Number(goalY));
    const isValid = xValid && yValid;
    const selectedActive = activeDrones.has(selectedDrone);

    const fieldError = (val: number | '') => {
        if (val === '') return 'Enter a valid value';
        if (!isInBounds(Number(val))) return 'Must be between 0–9';
        return null;
    };

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

            {/* Drone selector */}
            <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Select Drone</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {DRONE_IDS.map(id => (
                        <button
                            key={id}
                            onClick={() => setSelectedDrone(id)}
                            style={{
                                flex: 1,
                                padding: '6px',
                                fontSize: '12px',
                                background: selectedDrone === id ? '#0A84FF' : '#2C2C2E',
                                color: '#fff',
                                borderRadius: '8px',
                                border: activeDrones.has(id) ? '1px solid #30D158' : 'none',
                            }}
                        >
                            {id.replace('drone-', 'D')}
                            {activeDrones.has(id) && (
                                <span style={{ marginLeft: '4px', color: '#30D158' }}>⬤</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goal inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {(['X', 'Y'] as const).map((axis) => {
                    const val = axis === 'X' ? goalX : goalY;
                    const setVal = axis === 'X' ? setGoalX : setGoalY;
                    const error = fieldError(val);
                    return (
                        <div key={axis} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '15px', color: '#fff' }}>Goal {axis}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <input
                                    type="number"
                                    value={val}
                                    onChange={e => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={selectedActive}
                                    placeholder="0–9"
                                    min={0}
                                    max={9}
                                    style={{ borderColor: error ? '#FF453A' : undefined }}
                                />
                                {error && (
                                    <span style={{ fontSize: '11px', color: '#FF453A' }}>{error}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleStart}
                    disabled={selectedActive || !isValid}
                    style={{
                        flex: 1,
                        background: '#0A84FF',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '10px',
                    }}
                >
                    {selectedActive ? 'Active...' : 'Start Mission'}
                </button>
                <button
                    onClick={handleAbort}
                    disabled={!selectedActive}
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