import { useState, useEffect, useRef } from 'react';
import { startMission, stepMission } from '../services/api';
import type { MissionStatus } from '../types/drone';

interface Props {
    onMissionUpdate: (data: MissionStatus) => void;
}

const isInBounds = (val: number) => val >= 0 && val <= 9;

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

    const xValid = goalX !== '' && isInBounds(Number(goalX));
    const yValid = goalY !== '' && isInBounds(Number(goalY));
    const isValid = xValid && yValid;

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
                                    disabled={missionActive}
                                    placeholder="0–9"
                                    min={0}
                                    max={9}
                                    style={{
                                        borderColor: error ? '#FF453A' : undefined,
                                    }}
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