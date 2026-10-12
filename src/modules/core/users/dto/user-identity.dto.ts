import { Prisma } from 'generated/prisma/client';

export const identitySelect = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    membership: {
        select: {
            roles: true,
            organizationId: true,
            organization: { select: { side: true } },
        },
    },
} as const satisfies Prisma.UserSelect;

export const credentialSelect = {
    ...identitySelect,
    passwordHash: true,
} as const satisfies Prisma.UserSelect;

export type UserIdentity = Prisma.UserGetPayload<{
    select: typeof identitySelect;
}>;

export type UserCredential = Prisma.UserGetPayload<{
    select: typeof credentialSelect;
}>;
