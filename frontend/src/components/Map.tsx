import { MapContainer, TileLayer, Polyline, Marker, Popup, Rectangle, CircleMarker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FleetState } from '../types/drone';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import { useState } from 'react';

interface Props {
    path: [number, number][];
    origin: [number, number] | null;
    obstacleList: [number, number][];
    onObstaclesChange: (updated: [number, number][]) => void;
    fleet: FleetState;
    plannedWaypoints: [number, number][];
    threatZones: [number, number][];
    onMapClick: (x: number, y: number) => void;
}

const CursorTracker = ({ onMove, onClick }: {
    onMove: (x: number, y: number) => void;
    onClick: (x: number, y: number) => void;
}) => {
    useMapEvents({
        mousemove(e) {
            const center = { lat: 51.505, lng: -0.09 };
            const scale = 0.001;
            const x = Math.round((e.latlng.lng - center.lng) / scale);
            const y = Math.round((e.latlng.lat - center.lat) / scale);
            onMove(x, y);
        },
        click(e) {
            const center = { lat: 51.505, lng: -0.09 };
            const scale = 0.001;
            const x = Math.round((e.latlng.lng - center.lng) / scale);
            const y = Math.round((e.latlng.lat - center.lat) / scale);
            if (x >= 0 && x <= 9 && y >= 0 && y <= 9) {
                onClick(x, y);
            }
        }
    });
    return null;
};

const DRONE_COLORS: Record<string, string> = {
    'drone-1': '#0A84FF',
    'drone-2': '#FF9F0A',
    'drone-3': '#30D158',
};

const makeDroneIcon = (color: string) => L.divIcon({
    className: '',
    html: `
        <div style="
            width: 36px;
            height: 36px;
            background: ${color};
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 12px ${color}99;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                <path d="M6.5 8.5 4 6M17.5 8.5 20 6M6.5 15.5 4 18M17.5 15.5 20 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <circle cx="4" cy="5.5" r="2" fill="white"/>
                <circle cx="20" cy="5.5" r="2" fill="white"/>
                <circle cx="4" cy="18.5" r="2" fill="white"/>
                <circle cx="20" cy="18.5" r="2" fill="white"/>
                <rect x="7" y="9" width="10" height="6" rx="2" fill="white"/>
            </svg>
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const originIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            width: 28px;
            height: 28px;
            background: #30D158;
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 0 12px rgba(48,209,88,0.6);
        ">⬤</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const Map = ({ path, origin, obstacleList, onObstaclesChange, fleet, plannedWaypoints, threatZones, onMapClick }: Props) => {
    const center: [number, number] = [51.505, -0.09];
    const scale = 0.001;
    const [cursor, setCursor] = useState<[number, number] | null>(null);

    const toLatLng = (x: number, y: number): [number, number] => [
        center[0] + y * scale,
        center[1] + x * scale,
    ];

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <style>{`
                .leaflet-container {
                    height: 100%;
                    width: 100%;
                    background: #1C1C1E;
                }
                .leaflet-tile {
                    filter: brightness(0.4) saturate(0.3) hue-rotate(200deg);
                }
                .leaflet-control-attribution {
                    background: rgba(0,0,0,0.6) !important;
                    color: #636366 !important;
                }
                .leaflet-control-zoom a {
                    background: #2C2C2E !important;
                    color: #fff !important;
                    border-color: #3A3A3C !important;
                }
            `}</style>

            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <CursorTracker
                    onMove={(x, y) => setCursor([x, y])}
                    onClick={onMapClick}
                />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Grid bounds */}
                <Rectangle
                    bounds={[toLatLng(0, 0), toLatLng(9, 9)]}
                    pathOptions={{
                        color: '#FFD60A',
                        weight: 1.5,
                        opacity: 0.6,
                        fill: false,
                        dashArray: '6 4',
                    }}
                />

                {/* Threat zones */}
                {threatZones.map(([x, y], i) => (
                    <Circle
                        key={`threat-${i}`}
                        center={toLatLng(x, y)}
                        radius={40}
                        pathOptions={{
                            color: '#FF9F0A',
                            fillColor: '#FF9F0A',
                            fillOpacity: 0.2,
                            weight: 2,
                            dashArray: '4 4',
                        }}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                <strong>⚠ Threat Zone</strong><br />
                                ({x}, {y})<br />
                                <span style={{ color: '#888' }}>Click to remove</span>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* Obstacles */}
                {obstacleList.map(([x, y], i) => (
                    <Marker
                        key={i}
                        position={toLatLng(x, y)}
                        draggable={true}
                        icon={L.divIcon({
                            className: '',
                            html: `
                                <div style="
                                    width: 24px;
                                    height: 24px;
                                    background: #FF453A;
                                    border: 2px solid #fff;
                                    border-radius: 50%;
                                    box-shadow: 0 0 8px rgba(255,69,58,0.6);
                                "></div>
                            `,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                        })}
                        eventHandlers={{
                            dragend(e) {
                                const latlng = e.target.getLatLng();
                                const newX = Math.round((latlng.lng - center[1]) / scale);
                                const newY = Math.round((latlng.lat - center[0]) / scale);
                                const updated = obstacleList.map((obs, idx) =>
                                    idx === i ? [newX, newY] as [number, number] : obs
                                ) as [number, number][];
                                onObstaclesChange(updated);
                            }
                        }}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                <strong>Obstacle {i + 1}</strong><br />
                                ({x}, {y})
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Path trail */}
                {path.length > 1 && (
                    <Polyline
                        positions={path.map(([x, y]) => toLatLng(x, y))}
                        pathOptions={{
                            color: '#0A84FF',
                            weight: 2,
                            opacity: 0.6,
                            dashArray: '6 4',
                        }}
                    />
                )}

                {/* Origin */}
                {origin && (
                    <Marker
                        position={toLatLng(origin[0], origin[1])}
                        icon={originIcon}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                <strong>Origin</strong><br />
                                ({origin[0]}, {origin[1]})
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Fleet drones */}
                {Object.entries(fleet).map(([droneId, state]) => (
                    <Marker
                        key={droneId}
                        position={toLatLng(state.position[0], state.position[1])}
                        icon={makeDroneIcon(DRONE_COLORS[droneId] ?? '#fff')}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                <strong>{droneId}</strong><br />
                                Position: ({state.position[0]}, {state.position[1]})<br />
                                Battery: {state.battery.toFixed(1)}%<br />
                                Status: {state.status}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Planned waypoints */}
                {plannedWaypoints.length > 0 && (
                    <>
                        <Polyline
                            positions={plannedWaypoints.map(([x, y]) => toLatLng(x, y))}
                            pathOptions={{
                                color: '#FFD60A',
                                weight: 2,
                                opacity: 0.8,
                                dashArray: '4 6',
                            }}
                        />
                        {plannedWaypoints.map(([x, y], i) => (
                            <CircleMarker
                                key={i}
                                center={toLatLng(x, y)}
                                radius={8}
                                pathOptions={{
                                    color: '#FFD60A',
                                    fillColor: '#FFD60A',
                                    fillOpacity: 0.3,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                        <strong>Waypoint {i + 1}</strong><br />
                                        ({x}, {y})
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </>
                )}
            </MapContainer>

            {/* HUD */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
            }}>
                {cursor && (
                    <div style={{
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'system-ui',
                        backdropFilter: 'blur(6px)',
                    }}>
                        X: {cursor[0]}  Y: {cursor[1]}
                    </div>
                )}
                <div style={{
                    background: 'rgba(0,0,0,0.75)',
                    color: '#8E8E93',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'system-ui',
                    backdropFilter: 'blur(6px)',
                }}>
                    Click map to place/remove threat zones
                </div>
            </div>
        </div>
    );
};

export default Map;