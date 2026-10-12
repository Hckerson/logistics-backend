import { MINUTE_MS } from '@common/enums/time';
import {
    TRACKING_EXCEPTION_MINUTES,
    TRACKING_STALE_MINUTES,
    TrackingHealth,
} from '@common/enums/tracking';

export const minutesSince = (moment: Date, now = Date.now()): number =>
    (now - moment.getTime()) / MINUTE_MS;

export const healthOf = (recordedAt: Date): TrackingHealth => {
    const age = minutesSince(recordedAt);

    if (age >= TRACKING_EXCEPTION_MINUTES) return TrackingHealth.EXCEPTION;
    return age >= TRACKING_STALE_MINUTES
        ? TrackingHealth.STALE
        : TrackingHealth.FRESH;
};

export const downsample = <T>(points: readonly T[], max: number): T[] => {
    if (points.length <= max) return [...points];

    const step = Math.ceil(points.length / max);
    const kept = points.filter((_, index) => index % step === 0);

    return kept.at(-1) === points.at(-1)
        ? kept
        : [...kept, ...points.slice(-1)];
};

interface StopDeparture {
    departedAt: Date | null;
}

export const deliveredAtOf = (stops: readonly StopDeparture[]): Date | null =>
    stops.length > 0 && stops.every((stop) => stop.departedAt)
        ? (stops[stops.length - 1].departedAt ?? null)
        : null;

export const roundTo = (value: number, decimals: number): number =>
    Number(value.toFixed(decimals));
