import { randomUUID } from 'node:crypto';
import { OrganizationSide, Prisma } from '../../generated/prisma/client';

export const ORGANIZATIONS = {
    northline: {
        id: randomUUID(),
        name: 'Northline Freight',
        side: OrganizationSide.shipper,
    },
    ridgeway: {
        id: randomUUID(),
        name: 'Ridgeway Haulage',
        side: OrganizationSide.carrier,
    },
    harbor: {
        id: randomUUID(),
        name: 'Harbor Foods',
        side: OrganizationSide.shipper,
    },
    blueMesa: {
        id: randomUUID(),
        name: 'Blue Mesa Transport',
        side: OrganizationSide.carrier,
    },
    granite: {
        id: randomUUID(),
        name: 'Granite Line Carriers',
        side: OrganizationSide.carrier,
    },
    haulr: {
        id: randomUUID(),
        name: 'Haulr',
        side: OrganizationSide.haulr,
    },
} as const satisfies Record<string, Prisma.OrganizationCreateManyInput>;

export type OrganizationKey = keyof typeof ORGANIZATIONS;
