import { LoadStatus } from 'generated/prisma/enums';

export enum TrackingHealth {
    FRESH = 'fresh',
    STALE = 'stale',
    EXCEPTION = 'exception',
}

export const TRACKED_STATUSES: readonly LoadStatus[] = [
    LoadStatus.AtPickup,
    LoadStatus.InTransit,
    LoadStatus.AtDelivery,
];

export const TRACE_STATUSES: readonly LoadStatus[] = [
    ...TRACKED_STATUSES,
    LoadStatus.Delivered,
];

export const TRACKING_STALE_MINUTES = 60;

export const TRACKING_EXCEPTION_MINUTES = 90;

export const TRACK_WINDOW_HOURS = 24;

export const TRACK_MAX_POINTS = 288;

export const MAP_LOAD_LIMIT = 500;

export const TRACKING_LINK_EXPIRY_DAYS = 7;

export const PUBLIC_POSITION_DECIMALS = 1;

export const CHECK_CALL = { repeatMinutes: 30, noteMax: 500 } as const;

export const PUBLIC_TRACKING_HEADERS = {
    cacheControl: 'private, no-store',
    robots: 'noindex, nofollow',
} as const;

export const TRACKING_MESSAGES = {
    linkNotFound: 'Tracking link not found',
    linkClosed: 'Tracking links close 7 days after delivery',
    checkCallClosed: 'A check call opens once the last position is an hour old',
    checkCallRecent: 'A check call was requested in the last 30 minutes',
} as const;
