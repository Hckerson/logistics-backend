import type { RoleKey } from '@common/enums/roles';
import { OrganizationSide, UserRole } from 'generated/prisma/enums';

export interface JwtPayload {
    email: string;
    sub: string;
    role: UserRole;
    roles: RoleKey[];
}

export interface AuthResponseUser {
    id: string;
    name: string;
    email: string;
    role: string;
    roles: RoleKey[];
}

export interface AuthResponse {
    user: AuthResponseUser;
    accessToken?: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    roles: RoleKey[];
    organizationId: string | null;
    side: OrganizationSide | null;
}
