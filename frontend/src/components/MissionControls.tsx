import { useState, useEffect, useRef } from 'react';
import { queueMission, stepMission } from '../services/api';
import type { MissionStatus } from '../types/drone';

interface Props {
    onMissionUpdate: (data: MissionStatus) => void;
    onWaypointsChange: (waypoints: [number, number][]) => void;
}

const isInBounds = (val: number) => val >= 0 && val <= 9;
const DRONE_IDS = ['drone-1', 'drone-2', 'drone-3'];
const ALGORITHMS = ['astar', 'dijkstra'];

const MissionControls = ({ onMissionUpdate, onWaypointsChange }: Props) => {
    const [selectedDrone, setSelectedDrone] = useState<string>('drone-1');
    const [goalX, setGoalX] = useState<number | ''>('');
    const [goalY, setGoalY] = useState<number | ''>('');
    const [algorithm, setAlgorithm] = useState<string>('astar');
    const [waypoints, setWaypoints] = useState<[number, number][]>([]);
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

    const handleAddWaypoint = () => {
        if (goalX === '' || goalY === '') return;
        if (!isInBounds(Number(goalX)) || !isInBounds(Number(goalY))) return;
        const updated: [number, number][] = [...waypoints, [Number(goalX), Number(goalY)]];
        setWaypoints(updated);
        onWaypointsChange(updated);
        setGoalX('');
        setGoalY('');
    };

    const handleRemoveWaypoint = (index: number) => {
        const updated = waypoints.filter((_, i) => i !== index);
        setWaypoints(updated);
        onWaypointsChange(updated);
    };

    const handleStart = async () => {
        if (waypoints.length === 0) return;
        const droneId = selectedDrone;
        await queueMission(droneId, waypoints, algorithm);
        setActiveDrones(prev => new Set(prev).add(droneId));

        intervalsRef.current[droneId] = setInterval(async () => {
            const data = await stepMission(droneId);
            onMissionUpdate(data);
            if (data.mission_status === 'complete' || data.status === 'stuck') {
                stopStepping(droneId);
                setWaypoints([]);
                onWaypointsChange([]);
            }
        }, 500);
    };

    const handleAbort = () => {
        stopStepping(selectedDrone);
        setWaypoints([]);
        onWaypointsChange([]);
    };

    useEffect(() => {
        return () => {
            Object.keys(intervalsRef.current).forEach(stopStepping);
        };
    }, []);

    const xValid = goalX !== '' && isInBounds(Number(goalX));
    const yValid = goalY !== '' && isInBounds(Number(goalY));
    const canAdd = xValid && yValid;
    const selectedActive = activeDrones.has(selectedDrone);

    const fieldError = (val: number | '') => {
        if (val === '') return null;
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

            {/* Algorithm selector */}
            <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Algorithm</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {ALGORITHMS.map(alg => (
                        <button
                            key={alg}
                            onClick={() => setAlgorithm(alg)}
                            style={{
                                flex: 1,
                                padding: '6px',
                                fontSize: '12px',
                                background: algorithm === alg ? '#5E5CE6' : '#2C2C2E',
                                color: '#fff',
                                borderRadius: '8px',
                                border: 'none',
                            }}
                        >
                            {alg === 'astar' ? 'A*' : 'Dijkstra'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Waypoint inputs */}
            <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Add Waypoint</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                            type="number"
                            value={goalX}
                            onChange={e => setGoalX(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={selectedActive}
                            placeholder="X"
                            min={0}
                            max={9}
                            style={{
                                width: '64px',
                                borderColor: fieldError(goalX) ? '#FF453A' : undefined,
                            }}
                        />
                        {fieldError(goalX) && (
                            <span style={{ fontSize: '10px', color: '#FF453A' }}>{fieldError(goalX)}</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                            type="number"
                            value={goalY}
                            onChange={e => setGoalY(e.target.value === '' ? '' : Number(e.target.value))}
                            disabled={selectedActive}
                            placeholder="Y"
                            min={0}
                            max={9}
                            style={{
                                width: '64px',
                                borderColor: fieldError(goalY) ? '#FF453A' : undefined,
                            }}
                        />
                        {fieldError(goalY) && (
                            <span style={{ fontSize: '10px', color: '#FF453A' }}>{fieldError(goalY)}</span>
                        )}
                    </div>
                    <button
                        onClick={handleAddWaypoint}
                        disabled={!canAdd || selectedActive}
                        style={{
                            background: '#2C2C2E',
                            color: '#0A84FF',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '13px',
                        }}
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* Waypoint list */}
            {waypoints.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>
                        Waypoints ({waypoints.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {waypoints.map(([x, y], i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#2C2C2E',
                                borderRadius: '8px',
                                padding: '6px 10px',
                            }}>
                                <span style={{ fontSize: '13px', color: '#fff' }}>
                                    {i + 1}. ({x}, {y})
                                </span>
                                {!selectedActive && (
                                    <button
                                        onClick={() => handleRemoveWaypoint(i)}
                                        style={{
                                            background: 'none',
                                            color: '#FF453A',
                                            border: 'none',
                                            fontSize: '13px',
                                            padding: '0 4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={handleStart}
                    disabled={selectedActive || waypoints.length === 0}
                    style={{
                        flex: 1,
                        background: '#0A84FF',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '10px',
                    }}
                >
                    {selectedActive ? 'Active...' : `Launch (${waypoints.length} wp)`}
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