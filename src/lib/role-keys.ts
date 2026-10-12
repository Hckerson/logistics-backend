import { ROLE_KEYS, type RoleKey } from '@common/enums/roles';

const KNOWN_ROLE_KEYS: readonly string[] = ROLE_KEYS;

const isRoleKey = (value: string): value is RoleKey =>
    KNOWN_ROLE_KEYS.includes(value);

export const roleKeysOf = (values: readonly string[]): RoleKey[] =>
    values.filter(isRoleKey);

export const hasAnyRole = (
    held: readonly RoleKey[],
    allowed: readonly RoleKey[],
): boolean => held.some((role) => allowed.includes(role));
