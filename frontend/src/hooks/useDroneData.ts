import { useState, useEffect, useRef } from 'react';
import { getTelemetry } from '../services/api';
import type { Telemetry } from '../types/drone';

export const useDroneData = (polling: boolean) => {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (polling) {
            intervalRef.current = setInterval(async () => {
                const data = await getTelemetry();
                setTelemetry(data);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [polling]);

    return { telemetry };
};