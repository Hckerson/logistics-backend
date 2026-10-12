import { LoadStatus } from 'generated/prisma/enums';
import type { LoadActor } from './roles';
import { ACTIVE_LOAD_STATUSES, UNDOABLE_LOAD_STATUSES } from './load';

interface LoadRule {
    from: readonly LoadStatus[];
    actors: readonly LoadActor[];
}

interface LoadMove extends LoadRule {
    to: LoadStatus;
}

const STOP_ACTORS: readonly LoadActor[] = ['Driver', 'Carrier', 'Operations'];

const TRACKED_ACTORS: readonly LoadActor[] = [
    'Driver',
    'Carrier',
    'System',
    'Operations',
];

const { Draft, PendingApproval, Posted, Booked, Dispatched, AtPickup } =
    LoadStatus;

const { InTransit, AtDelivery, Delivered, PodVerified, Invoiced, Paid } =
    LoadStatus;

const { Closed, Cancelled, Expired, OnHold, Disputed } = LoadStatus;

export const LOAD_MOVES: readonly LoadMove[] = [
    { from: [Draft], to: Posted, actors: ['Shipper', 'Operations'] },
    { from: [Draft], to: PendingApproval, actors: ['Shipper'] },
    { from: [PendingApproval], to: Posted, actors: ['Approver'] },
    {
        from: [PendingApproval],
        to: Draft,
        actors: ['Approver', 'Shipper', 'System'],
    },
    { from: [Draft], to: Cancelled, actors: ['Shipper'] },
    { from: [Expired], to: Draft, actors: ['Shipper'] },
    { from: [Posted], to: Booked, actors: ['Carrier', 'Operations'] },
    { from: [Posted], to: Expired, actors: ['System'] },
    { from: [Posted], to: Cancelled, actors: ['Shipper', 'Operations'] },
    { from: [Booked], to: Dispatched, actors: ['Carrier', 'Operations'] },
    {
        from: [Booked, Dispatched],
        to: Posted,
        actors: ['Carrier', 'Operations'],
    },
    {
        from: [Booked, Dispatched],
        to: Cancelled,
        actors: ['Shipper', 'Operations'],
    },
    { from: [Dispatched], to: AtPickup, actors: TRACKED_ACTORS },
    { from: [AtPickup], to: InTransit, actors: STOP_ACTORS },
    { from: [InTransit], to: AtPickup, actors: TRACKED_ACTORS },
    { from: [InTransit], to: AtDelivery, actors: TRACKED_ACTORS },
    { from: [AtDelivery], to: InTransit, actors: STOP_ACTORS },
    { from: [AtDelivery], to: Delivered, actors: STOP_ACTORS },
    { from: [Delivered], to: PodVerified, actors: ['System', 'Finance'] },
    { from: [PodVerified], to: Invoiced, actors: ['System'] },
    { from: [Invoiced], to: Paid, actors: ['System'] },
    { from: [Paid], to: Closed, actors: ['System'] },
    {
        from: ACTIVE_LOAD_STATUSES,
        to: OnHold,
        actors: ['Operations', 'Compliance'],
    },
    { from: [Invoiced, Paid], to: Disputed, actors: ['Shipper', 'Carrier'] },
    { from: [AtPickup], to: Cancelled, actors: ['Operations'] },
];

export const LOAD_RETURNS: readonly LoadRule[] = [
    { from: UNDOABLE_LOAD_STATUSES, actors: STOP_ACTORS },
    { from: [OnHold], actors: ['Operations'] },
    { from: [Disputed], actors: ['Finance'] },
];

export const REASONED_MOVES: readonly LoadStatus[] = [OnHold];
