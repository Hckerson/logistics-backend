import { ChargeKind, LoadStatus } from 'generated/prisma/enums';

export const EQUIPMENT_TYPES = ['dry-van', 'reefer', 'flatbed'] as const;

export const ACTIVE_LOAD_STATUSES: readonly LoadStatus[] = [
    LoadStatus.Posted,
    LoadStatus.Booked,
    LoadStatus.Dispatched,
    LoadStatus.AtPickup,
    LoadStatus.InTransit,
    LoadStatus.AtDelivery,
    LoadStatus.Delivered,
    LoadStatus.PodVerified,
    LoadStatus.Invoiced,
    LoadStatus.Paid,
    LoadStatus.Disputed,
];

export const UNDOABLE_LOAD_STATUSES: readonly LoadStatus[] = [
    LoadStatus.AtPickup,
    LoadStatus.InTransit,
    LoadStatus.AtDelivery,
    LoadStatus.Delivered,
];

export const STOP_EVENT_UNDO_MINUTES = 5;

export const SUBTRACTIVE_CHARGE_KINDS: readonly ChargeKind[] = [
    ChargeKind.deduction,
    ChargeKind.quickPayFee,
];

export const PAGE_SIZE = { default: 50, max: 200 } as const;

export const LOAD_MESSAGES = {
    notFound: 'Load not found',
    illegalMove: 'That move is not open for this load right now',
    staleVersion: 'The load changed since you opened it',
    reasonRequired: 'A reason is required for this action',
    carrierRequired: 'Choose the carrier to book this load for',
} as const;
