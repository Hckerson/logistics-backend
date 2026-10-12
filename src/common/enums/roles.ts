export const ROLE_KEYS = [
    'shipper.member',
    'shipper.admin',
    'shipper.finance',
    'shipper.approver',
    'carrier.dispatcher',
    'carrier.admin',
    'carrier.driver',
    'public.tracking',
    'internal.ops',
    'internal.compliance',
    'internal.finance',
    'internal.support',
    'internal.admin',
    'org.security',
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export const INTERNAL_ROLES = [
    'internal.ops',
    'internal.compliance',
    'internal.finance',
    'internal.support',
    'internal.admin',
] as const satisfies readonly RoleKey[];

export const LOAD_PARTY_ROLES = {
    shipper: [
        'shipper.member',
        'shipper.admin',
        'shipper.finance',
        'shipper.approver',
    ],
    carrier: ['carrier.dispatcher', 'carrier.admin'],
} as const satisfies Record<string, readonly RoleKey[]>;

export const LOAD_ACTORS = [
    'Shipper',
    'Approver',
    'Carrier',
    'Driver',
    'Operations',
    'Compliance',
    'Finance',
    'System',
] as const;

export type LoadActor = (typeof LOAD_ACTORS)[number];

export const ACTOR_ROLES = {
    Shipper: ['shipper.member', 'shipper.admin'],
    Approver: ['shipper.approver'],
    Carrier: ['carrier.dispatcher', 'carrier.admin'],
    Driver: ['carrier.driver'],
    Operations: ['internal.ops'],
    Compliance: ['internal.compliance'],
    Finance: ['internal.finance'],
    System: [],
} as const satisfies Record<LoadActor, readonly RoleKey[]>;

export const CAPABILITY_ROLES = {
    viewShipperPrice: [
        'shipper.member',
        'shipper.admin',
        'shipper.finance',
        'internal.ops',
        'internal.finance',
        'internal.support',
    ],
    viewCarrierPay: [
        'carrier.dispatcher',
        'carrier.admin',
        'internal.ops',
        'internal.finance',
        'internal.support',
    ],
    viewLiveLocation: [
        'shipper.member',
        'shipper.admin',
        'carrier.dispatcher',
        'carrier.admin',
        'internal.ops',
        'internal.support',
    ],
    shareTrackingLink: [
        'shipper.member',
        'shipper.admin',
        'internal.ops',
        'internal.support',
    ],
    requestCheckCall: ['carrier.dispatcher', 'carrier.admin', 'internal.ops'],
    uploadDocument: [
        'shipper.member',
        'shipper.admin',
        'carrier.dispatcher',
        'carrier.admin',
        'internal.ops',
        'internal.finance',
    ],
} as const satisfies Record<string, readonly RoleKey[]>;

export type Capability = keyof typeof CAPABILITY_ROLES;

export const CHECK_CALL_RECIPIENT_ROLE: RoleKey = 'carrier.dispatcher';

export const REASON_LENGTH = { min: 1, max: 1000 } as const;
