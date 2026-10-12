import { roleKeysOf } from '@lib/role-keys';
import type { AuthUser } from '../types/auth.types';
import type { UserIdentity } from '@core/users/dto';

export const toAuthUser = ({
    id,
    fullName,
    email,
    role,
    membership,
}: UserIdentity): AuthUser => ({
    id,
    name: fullName,
    email,
    role,
    roles: roleKeysOf(membership?.roles ?? []),
    organizationId: membership?.organizationId ?? null,
    side: membership?.organization.side ?? null,
});
