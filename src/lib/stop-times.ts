import { LoadStatus, StopType } from 'generated/prisma/enums';

interface StopClock {
    id: string;
    type: StopType;
    arrivedAt: Date | null;
    departedAt: Date | null;
}

interface StopChange {
    id: string;
    data: { arrivedAt?: Date | null; departedAt?: Date | null };
}

const AT_STOP: readonly LoadStatus[] = [
    LoadStatus.AtPickup,
    LoadStatus.AtDelivery,
];

const LEFT_STOP: readonly LoadStatus[] = [
    LoadStatus.InTransit,
    LoadStatus.Delivered,
];

export const stopFits = (
    to: LoadStatus,
    stops: readonly StopClock[],
): boolean => {
    const index = stops.findIndex((stop) => !stop.departedAt);
    const current = index === -1 ? undefined : stops[index];

    switch (to) {
        case LoadStatus.AtPickup:
            return current?.type === StopType.pickup;
        case LoadStatus.AtDelivery:
            return current?.type === StopType.delivery;
        case LoadStatus.InTransit:
            return index !== -1 && index < stops.length - 1;
        case LoadStatus.Delivered:
            return index === stops.length - 1;
        default:
            return true;
    }
};

export const stopTimesFor = (
    from: LoadStatus,
    to: LoadStatus,
    undo: boolean,
    stops: readonly StopClock[],
    now: Date,
): StopChange | null => {
    const current = stops.find((stop) => !stop.departedAt);
    const lastDeparted = stops.filter((stop) => stop.departedAt).at(-1);

    if (undo) {
        if (AT_STOP.includes(from) && current) {
            return { id: current.id, data: { arrivedAt: null } };
        }
        return LEFT_STOP.includes(from) && lastDeparted
            ? { id: lastDeparted.id, data: { departedAt: null } }
            : null;
    }

    if (!current) return null;
    if (AT_STOP.includes(to))
        return { id: current.id, data: { arrivedAt: now } };

    return AT_STOP.includes(from) && LEFT_STOP.includes(to)
        ? { id: current.id, data: { departedAt: now } }
        : null;
};
