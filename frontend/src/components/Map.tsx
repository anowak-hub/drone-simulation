import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { World, Telemetry } from '../types/drone';
import L from 'leaflet';

interface Props {
    world: World | null;
    telemetry: Telemetry | null;
    path: [number, number][];
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
            font-size: 18px;
            box-shadow: 0 0 12px rgba(10,132,255,0.6);
        ">🛸</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const Map = ({ world, telemetry, path }: Props) => {
    const center: [number, number] = [51.505, -0.09];
    const scale = 0.001;

    const toLatLng = (x: number, y: number): [number, number] => [
        center[0] + y * scale,
        center[1] + x * scale,
    ];

    return (
        <div style={{ height: '100%', width: '100%' }}>
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
            </MapContainer>
        </div>
    );
};

export default Map;