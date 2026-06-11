import type { FleetState } from '../types/drone';

interface Props {
    fleet: FleetState;
}

const batteryColor = (battery: number) => {
    if (battery > 50) return '#30D158';
    if (battery > 20) return '#FFD60A';
    return '#FF453A';
};

const statusColor = (status: string) => {
    if (status === 'arrived') return '#30D158';
    if (status === 'moving') return '#0A84FF';
    if (status === 'stuck') return '#FF453A';
    return '#8E8E93';
};

const FleetPanel = ({ fleet }: Props) => {
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
                Fleet Status
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(fleet).map(([droneId, state]) => (
                    <div key={droneId} style={{
                        background: '#2C2C2E',
                        borderRadius: '10px',
                        padding: '12px 14px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                {droneId}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: statusColor(state.status),
                            }}>
                                ⬤ {state.status}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#8E8E93' }}>Position</span>
                            <span style={{ fontSize: '12px', color: '#fff' }}>
                                ({state.position[0]}, {state.position[1]})
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#8E8E93' }}>Mission</span>
                            <span style={{ fontSize: '12px', color: statusColor(state.mission_status) }}>
                                {state.mission_status}
                            </span>
                        </div>

                        {/* Battery bar */}
                        <div style={{
                            height: '3px',
                            background: '#3A3A3C',
                            borderRadius: '2px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${state.battery}%`,
                                background: batteryColor(state.battery),
                                borderRadius: '2px',
                                transition: 'width 0.4s ease',
                            }} />
                        </div>
                        <span style={{ fontSize: '11px', color: batteryColor(state.battery), marginTop: '4px', display: 'block' }}>
                            {state.battery.toFixed(1)}% battery
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FleetPanel;