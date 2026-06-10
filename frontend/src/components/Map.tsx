import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { World, Telemetry } from '../types/drone';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import { useState } from 'react';

interface Props {
    world: World | null;
    telemetry: Telemetry | null;
    path: [number, number][];
    origin: [number, number] | null;
}

const CursorTracker = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
    useMapEvents({
        mousemove(e) {
            const center = { lat: 51.505, lng: -0.09 };
            const scale = 0.001;
            const x = Math.round((e.latlng.lng - center.lng) / scale);
            const y = Math.round((e.latlng.lat - center.lat) / scale);
            onMove(x, y);
        }
    });
    return null;
}

const droneIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            width: 36px;
            height: 36px;
            background: #0A84FF;
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 12px rgba(10,132,255,0.6);
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

const Map = ({ world, telemetry, path, origin }: Props) => {
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
                 <CursorTracker onMove={(x, y) => setCursor([x, y])} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Obstacles */}
                {world?.obstacles.map(([x, y], i) => (
                    <Circle
                        key={i}
                        center={toLatLng(x, y)}
                        radius={25}
                        pathOptions={{
                            color: '#FF453A',
                            fillColor: '#FF453A',
                            fillOpacity: 0.25,
                            weight: 2,
                        }}
                    />
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

                {/* Drone */}
                {telemetry && (
                    <Marker
                        position={toLatLng(telemetry.position[0], telemetry.position[1])}
                        icon={droneIcon}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'system-ui', fontSize: '13px' }}>
                                <strong>Drone-1</strong><br />
                                Battery: {telemetry.battery.toFixed(1)}%<br />
                                Steps: {telemetry.steps}
                            </div>
                        </Popup>
                    </Marker>
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
            </MapContainer>
            {cursor && (
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'system-ui',
                    backdropFilter: 'blur(6px)',
                    pointerEvents: 'none',
                }}>
                    X: {cursor[0]}  Y: {cursor[1]}
                </div>
            )}
        </div>
    );
};

export default Map;