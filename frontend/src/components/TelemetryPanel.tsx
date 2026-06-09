import type { Telemetry } from '../types/drone';

interface Props {
    telemetry: Telemetry | null;
}

const batteryColor = (battery: number) => {
    if (battery > 50) return '#30D158';
    if (battery > 20) return '#FFD60A';
    return '#FF453A';
};

const TelemetryPanel = ({ telemetry }: Props) => {
    return (
        <div style={{ padding: '20px 24px' }}>
            <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.8px',
                color: '#8E8E93',
                textTransform: 'uppercase',
                marginBottom: '16px',
            }}>
                Telemetry
            </p>

            {!telemetry ? (
                <p style={{ fontSize: '14px', color: '#636366' }}>No active mission</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Position */}
                    <div style={{
                        background: '#2C2C2E',
                        borderRadius: '10px',
                        padding: '12px 16px',
                    }}>
                        <p style={{ fontSize: '11px', color: '#8E8E93', marginBottom: '4px' }}>Position</p>
                        <p style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px', color: '#fff' }}>
                            ({telemetry.position[0]}, {telemetry.position[1]})
                        </p>
                    </div>

                    {/* Battery */}
                    <div style={{
                        background: '#2C2C2E',
                        borderRadius: '10px',
                        padding: '12px 16px',
                    }}>
                        <p style={{ fontSize: '11px', color: '#8E8E93', marginBottom: '4px' }}>Battery</p>
                        <p style={{
                            fontSize: '22px',
                            fontWeight: 600,
                            letterSpacing: '-0.5px',
                            color: batteryColor(telemetry.battery),
                        }}>
                            {telemetry.battery.toFixed(1)}%
                        </p>
                        <div style={{
                            marginTop: '8px',
                            height: '4px',
                            background: '#3A3A3C',
                            borderRadius: '2px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${telemetry.battery}%`,
                                background: batteryColor(telemetry.battery),
                                borderRadius: '2px',
                                transition: 'width 0.4s ease',
                            }} />
                        </div>
                    </div>

                    {/* Steps + Status */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                            flex: 1,
                            background: '#2C2C2E',
                            borderRadius: '10px',
                            padding: '12px 16px',
                        }}>
                            <p style={{ fontSize: '11px', color: '#8E8E93', marginBottom: '4px' }}>Steps</p>
                            <p style={{ fontSize: '22px', fontWeight: 600, color: '#fff' }}>{telemetry.steps}</p>
                        </div>
                        <div style={{
                            flex: 1,
                            background: '#2C2C2E',
                            borderRadius: '10px',
                            padding: '12px 16px',
                        }}>
                            <p style={{ fontSize: '11px', color: '#8E8E93', marginBottom: '4px' }}>Status</p>
                            <p style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: telemetry.status === 'arrived' ? '#30D158' : '#0A84FF',
                                marginTop: '4px',
                            }}>
                                {telemetry.status.charAt(0).toUpperCase() + telemetry.status.slice(1)}
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default TelemetryPanel;