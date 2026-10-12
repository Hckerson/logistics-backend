import type { EQUIPMENT_TYPES } from '@common/enums/load';
import {
    StopType,
    type EtaConfidence,
    type LoadStatus,
    type PositionSource,
} from '../../generated/prisma/client';
import type { FacilityKey } from './facilities';
import type { OrganizationKey } from './organizations';
import type { UserKey } from './users';

export const FREIGHT = {
    windowHours: 2,
    fuelShare: 0.18,
    reportEveryMinutes: 5,
    progressCap: 0.97,
    roadCircuity: 1.2,
} as const;

export interface StopSpec {
    facility: FacilityKey;
    type: StopType;
    opensIn: number;
    arrived?: number;
    departed?: number;
}

export interface TrackSpec {
    mph: number;
    source: PositionSource;
    confidence: EtaConfidence;
    silentMinutes?: number;
}

export interface LoadSpec {
    id: string;
    status: LoadStatus;
    shipper: OrganizationKey;
    carrier?: OrganizationKey;
    driver?: UserKey;
    equipment: (typeof EQUIPMENT_TYPES)[number];
    commodity: string;
    weightLb: number;
    pallets?: number;
    tempF?: readonly [number, number];
    poNumber?: string;
    bolNumber?: string;
    priceCents: number;
    payCents: number;
    pendingCents?: number;
    ageHours: number;
    stops: readonly StopSpec[];
    track?: TrackSpec;
}

export const NORTHLINE = { shipper: 'northline' } as const;

export const RIDGEWAY = { carrier: 'ridgeway', driver: 'usr_driver' } as const;

const stopOf =
    (type: StopType) =>
    (
        facility: FacilityKey,
        opensIn: number,
        arrived?: number,
        departed?: number,
    ): StopSpec => ({ facility, type, opensIn, arrived, departed });

export const pickup = stopOf(StopType.pickup);

export const delivery = stopOf(StopType.delivery);

export const tracked = (
    mph: number,
    source: PositionSource,
    confidence: EtaConfidence,
    silentMinutes?: number,
): TrackSpec => ({ mph, source, confidence, silentMinutes });
