import {
    ChargeKind,
    ChargeParty,
    ChargeStatus,
    Prisma,
    StopType,
} from '../../generated/prisma/client';
import { dateAgo, dateAgoOrNull, dateIn } from './clock';
import { FACILITIES } from './facilities';
import { FREIGHT, type LoadSpec } from './load-spec';
import { OFF_ROAD_LOADS } from './loads-off-road';
import { UNDERWAY_LOADS } from './loads-underway';
import { ORGANIZATIONS } from './organizations';
import { etaOf, positionsOf } from './positions';
import { sideEventsOf } from './side-events';
import { statusEventsOf } from './timeline';
import { SEED_USERS } from './users';

export const SEED_LOADS: readonly LoadSpec[] = [
    ...UNDERWAY_LOADS,
    ...OFF_ROAD_LOADS,
];

export const stopTypesAt = (facilityId: string): Set<StopType> =>
    new Set(
        SEED_LOADS.flatMap(({ stops }) => stops)
            .filter((stop) => FACILITIES[stop.facility].id === facilityId)
            .map((stop) => stop.type),
    );

const charge = (
    party: ChargeParty,
    kind: ChargeKind,
    amountCents: number,
    status: ChargeStatus = ChargeStatus.agreed,
): Prisma.ChargeCreateManyLoadInput => ({ party, kind, amountCents, status });

const fuelOf = (cents: number) => Math.round(cents * FREIGHT.fuelShare);

const chargesOf = ({ priceCents, payCents, pendingCents }: LoadSpec) => [
    charge(ChargeParty.shipper, ChargeKind.linehaul, priceCents),
    charge(ChargeParty.shipper, ChargeKind.fuel, fuelOf(priceCents)),
    ...(pendingCents
        ? [
              charge(
                  ChargeParty.shipper,
                  ChargeKind.accessorial,
                  pendingCents,
                  ChargeStatus.pendingApproval,
              ),
          ]
        : []),
    ...(payCents > 0
        ? [
              charge(ChargeParty.carrier, ChargeKind.linehaul, payCents),
              charge(ChargeParty.carrier, ChargeKind.fuel, fuelOf(payCents)),
          ]
        : []),
];

const stopsOf = ({ stops }: LoadSpec, now: number) =>
    stops.map(
        (stop, index) =>
            ({
                facilityId: FACILITIES[stop.facility].id,
                sequence: index + 1,
                type: stop.type,
                windowStart: dateIn(now, stop.opensIn),
                windowEnd: dateIn(now, stop.opensIn + FREIGHT.windowHours),
                arrivedAt: dateAgoOrNull(now, stop.arrived),
                departedAt: dateAgoOrNull(now, stop.departed),
            }) satisfies Prisma.StopCreateManyLoadInput,
    );

export const loadInput = (spec: LoadSpec, now: number) => {
    const statusEvents = statusEventsOf(spec, now);

    return {
        id: spec.id,
        status: spec.status,
        version: 1 + statusEvents.length,
        shipperId: ORGANIZATIONS[spec.shipper].id,
        carrierId: spec.carrier ? ORGANIZATIONS[spec.carrier].id : null,
        driverId: spec.driver ? SEED_USERS[spec.driver].id : null,
        equipment: spec.equipment,
        commodity: spec.commodity,
        weightLb: spec.weightLb,
        pallets: spec.pallets,
        tempMinF: spec.tempF?.[0],
        tempMaxF: spec.tempF?.[1],
        poNumber: spec.poNumber,
        bolNumber: spec.bolNumber,
        createdAt: dateAgo(now, spec.ageHours),
        ...etaOf(spec, now),
        stops: { createMany: { data: stopsOf(spec, now) } },
        charges: { createMany: { data: chargesOf(spec) } },
        positions: { createMany: { data: positionsOf(spec, now) } },
        events: {
            createMany: {
                data: [...statusEvents, ...sideEventsOf(spec, now)],
            },
        },
    } satisfies Prisma.LoadUncheckedCreateInput;
};
