import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { RoleKey } from '@common/enums/roles';
import {
    Prisma,
    UserRole,
    UserAccountStatus,
} from '../../generated/prisma/client';
import { ORGANIZATIONS, type OrganizationKey } from './organizations';

const SEED_PASSWORD = 'hunter22';
const HASH_ROUNDS = 10;

interface UserSeed {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    roles: readonly RoleKey[];
    organization: OrganizationKey;
    verified: boolean;
}

export const SEED_USERS = {
    usr_dispatch: {
        id: randomUUID(),
        fullName: 'Dana Okafor',
        email: 'dispatch@northline.example',
        role: UserRole.USER,
        roles: ['shipper.admin', 'shipper.member'],
        organization: 'northline',
        verified: true,
    },
    usr_fresh: {
        id: randomUUID(),
        fullName: 'Kofi Mensah',
        email: 'fresh@northline.example',
        role: UserRole.USER,
        roles: ['shipper.member'],
        organization: 'northline',
        verified: false,
    },
    usr_approver: {
        id: randomUUID(),
        fullName: 'Mara Lindqvist',
        email: 'approver@northline.example',
        role: UserRole.USER,
        roles: ['shipper.approver', 'shipper.member'],
        organization: 'northline',
        verified: true,
    },
    usr_carrier: {
        id: randomUUID(),
        fullName: 'Ray Okoro',
        email: 'ray@ridgeway.example',
        role: UserRole.USER,
        roles: ['carrier.admin', 'carrier.dispatcher'],
        organization: 'ridgeway',
        verified: true,
    },
    usr_driver: {
        id: randomUUID(),
        fullName: 'Ana Ruiz',
        email: 'driver@ridgeway.example',
        role: UserRole.USER,
        roles: ['carrier.driver'],
        organization: 'ridgeway',
        verified: true,
    },
    usr_ops: {
        id: randomUUID(),
        fullName: 'Theo Banks',
        email: 'ops@haulr.test',
        role: UserRole.ADMIN,
        roles: ['internal.ops'],
        organization: 'haulr',
        verified: true,
    },
} as const satisfies Record<string, UserSeed>;

export type UserKey = keyof typeof SEED_USERS;

export const userInput = ({
    id,
    fullName,
    email,
    role,
    roles,
    organization,
    verified,
}: UserSeed) =>
    ({
        id,
        fullName,
        email,
        role,
        passwordHash: bcrypt.hashSync(SEED_PASSWORD, HASH_ROUNDS),
        status: verified ? UserAccountStatus.ACTIVE : UserAccountStatus.PENDING,
        membership: {
            create: {
                organizationId: ORGANIZATIONS[organization].id,
                roles: [...roles],
            },
        },
    }) satisfies Prisma.UserCreateInput;
