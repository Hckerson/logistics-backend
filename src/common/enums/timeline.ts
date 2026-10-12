import { LoadEventType } from 'generated/prisma/enums';

export const TIMELINE_CATEGORIES = [
    'status',
    'stop',
    'tracking',
    'document',
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number];

export const EVENT_CATEGORY: Record<LoadEventType, TimelineCategory> = {
    [LoadEventType.statusChanged]: 'status',
    [LoadEventType.stopArrived]: 'stop',
    [LoadEventType.stopDeparted]: 'stop',
    [LoadEventType.trackingStale]: 'tracking',
    [LoadEventType.checkCallRequested]: 'tracking',
    [LoadEventType.trackingLinkCreated]: 'tracking',
    [LoadEventType.trackingLinkRevoked]: 'tracking',
    [LoadEventType.documentUploaded]: 'document',
};
