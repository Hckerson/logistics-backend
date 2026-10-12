import {
    EventSource,
    LoadEventType,
    LoadStatus,
    StopType,
} from '../../generated/prisma/client';
import { shiftHours } from './clock';
import {
    SHIPPER,
    SYSTEM,
    event,
    member,
    type Actor,
    type LoadEventSeed,
} from './event-actors';
import type { LoadSpec } from './load-spec';
import type { OrganizationKey } from './organizations';
import type { UserKey } from './users';

const STEP_HOURS = {
    posted: 0.5,
    booked: 2,
    dispatched: 3,
    verified: 2,
    invoiced: 8,
} as const;

const CANCEL_REASON = 'Customer moved the order to next week';

const CARRIER_DISPATCHERS: Partial<Record<OrganizationKey, UserKey>> = {
    ridgeway: 'usr_carrier',
};

export const statusEventsOf = (spec: LoadSpec, now: number) => {
    const { status, stops, carrier, driver } = spec;
    const after = (hours: number) => shiftHours(now, hours - spec.ageHours);
    const dispatcher = member(carrier && CARRIER_DISPATCHERS[carrier]);
    const events: LoadEventSeed[] = [];
    let current: LoadStatus = LoadStatus.Draft;
    const step = (
        to: LoadStatus,
        at: number,
        actor: Actor,
        reason?: string,
    ) => {
        events.push(
            event(LoadEventType.statusChanged, at, actor, {
                fromStatus: current,
                toStatus: to,
                reason,
            }),
        );
        current = to;
    };

    if (status === LoadStatus.PendingApproval) {
        step(LoadStatus.PendingApproval, after(STEP_HOURS.posted), SHIPPER);
    }
    if (status === LoadStatus.Draft || status === LoadStatus.PendingApproval) {
        return events;
    }

    step(LoadStatus.Posted, after(STEP_HOURS.posted), SHIPPER);
    if (status === LoadStatus.Cancelled) {
        step(
            LoadStatus.Cancelled,
            after(STEP_HOURS.booked),
            SHIPPER,
            CANCEL_REASON,
        );
    }
    if (status === LoadStatus.Cancelled || status === LoadStatus.Posted) {
        return events;
    }

    step(LoadStatus.Booked, after(STEP_HOURS.booked), dispatcher);
    if (status === LoadStatus.Booked) return events;
    step(LoadStatus.Dispatched, after(STEP_HOURS.dispatched), dispatcher);

    stops.forEach((stop, index) => {
        if (stop.arrived !== undefined) {
            step(
                stop.type === StopType.pickup
                    ? LoadStatus.AtPickup
                    : LoadStatus.AtDelivery,
                shiftHours(now, -stop.arrived),
                member(driver, EventSource.geofence),
            );
        }
        if (stop.departed !== undefined) {
            step(
                index === stops.length - 1
                    ? LoadStatus.Delivered
                    : LoadStatus.InTransit,
                shiftHours(now, -stop.departed),
                member(driver, EventSource.driver),
            );
        }
    });

    const delivered = stops[stops.length - 1].departed;
    if (status === LoadStatus.Invoiced && delivered !== undefined) {
        const verified = STEP_HOURS.verified - delivered;
        const invoiced = STEP_HOURS.invoiced - delivered;
        step(LoadStatus.PodVerified, shiftHours(now, verified), SYSTEM);
        step(LoadStatus.Invoiced, shiftHours(now, invoiced), SYSTEM);
    }
    return events;
};
