import { Prisma } from 'generated/prisma/client';
import { hasAnyRole } from '@lib/role-keys';
import { LoadRepo } from '@common/repos/load.repo';
import { LOAD_MESSAGES } from '@common/enums/load';
import {
    ActorType,
    EventSource,
    OrganizationSide,
} from 'generated/prisma/enums';
import type { AuthUser } from '@core/auth/types/auth.types';
import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import {
    ACTOR_ROLES,
    CAPABILITY_ROLES,
    INTERNAL_ROLES,
    LOAD_ACTORS,
    LOAD_PARTY_ROLES,
    type Capability,
    type LoadActor,
} from '@common/enums/roles';

const NO_LOADS: Prisma.LoadWhereInput = { id: { in: [] } };

@Injectable()
export class LoadAccessService {
    constructor(private readonly loadRepo: LoadRepo) {}

    scope({ roles, side, organizationId }: AuthUser): Prisma.LoadWhereInput {
        if (hasAnyRole(roles, INTERNAL_ROLES)) return {};
        if (!organizationId) return NO_LOADS;

        if (
            side === OrganizationSide.shipper &&
            hasAnyRole(roles, LOAD_PARTY_ROLES.shipper)
        ) {
            return { shipperId: organizationId };
        }

        if (
            side === OrganizationSide.carrier &&
            hasAnyRole(roles, LOAD_PARTY_ROLES.carrier)
        ) {
            return { carrierId: organizationId };
        }

        return NO_LOADS;
    }

    can(user: AuthUser, capability: Capability): boolean {
        return hasAnyRole(user.roles, CAPABILITY_ROLES[capability]);
    }

    isStaff(user: AuthUser): boolean {
        return hasAnyRole(user.roles, INTERNAL_ROLES);
    }

    requireReason(user: AuthUser, reason?: string): void {
        if (this.isStaff(user) && !reason) {
            throw new UnprocessableEntityException(
                LOAD_MESSAGES.reasonRequired,
            );
        }
    }

    actorOf(user: AuthUser) {
        const staff = this.isStaff(user);

        return {
            actorId: user.id,
            actorType: staff ? ActorType.staff : ActorType.member,
            source: staff ? EventSource.operations : EventSource.web,
        };
    }

    actorsOf(user: AuthUser): LoadActor[] {
        return LOAD_ACTORS.filter((actor) =>
            hasAnyRole(user.roles, ACTOR_ROLES[actor]),
        );
    }

    async visible(user: AuthUser, loadId: string, capability?: Capability) {
        const load = await this.loadRepo.findFirst({
            where: { AND: [{ id: loadId }, this.scope(user)] },
            select: { id: true, status: true, version: true },
        });

        if (!load || (capability && !this.can(user, capability))) {
            throw new NotFoundException(LOAD_MESSAGES.notFound);
        }

        return load;
    }
}
