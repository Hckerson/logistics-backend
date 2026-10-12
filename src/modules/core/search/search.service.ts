import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { LoadRepo } from '@common/repos/load.repo';
import { UserRepo } from '@common/repos/user.repo';
import { FacilityRepo } from '@common/repos/facility.repo';
import { OrganizationRepo } from '@common/repos/organization.repo';
import { QUICK_FIND, QuickFindType } from '@common/enums/search';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { QuickFindQueryDto } from './dto';

interface Found {
    id: string;
    label: string;
    detail: string | null;
}

const take = QUICK_FIND.groupLimit;

@Injectable()
export class SearchService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly userRepo: UserRepo,
        private readonly facilityRepo: FacilityRepo,
        private readonly organizationRepo: OrganizationRepo,
        private readonly access: LoadAccessService,
    ) {}

    async find(user: AuthUser, { q }: QuickFindQueryDto) {
        const term = q.trim();
        const contains: Prisma.StringFilter = {
            contains: term,
            mode: 'insensitive',
        };
        const staff = this.access.isStaff(user);
        const organizationId = staff
            ? undefined
            : (user.organizationId ?? undefined);
        const scoped = staff || Boolean(organizationId);

        const groups = await Promise.all([
            this.loads(user, term),
            ...(scoped ? [this.facilities(organizationId, contains)] : []),
            ...(scoped ? [this.members(organizationId, contains)] : []),
            ...(staff ? [this.organizations(contains)] : []),
        ]);
        const reference = term.toUpperCase();

        return {
            exact:
                groups[0].items.find((item) => item.id === reference) ?? null,
            groups: groups.filter((group) => group.total > 0),
        };
    }

    private loads(user: AuthUser, term: string) {
        const where: Prisma.LoadWhereInput = {
            AND: [
                this.access.scope(user),
                {
                    OR: [
                        { id: { startsWith: term.toUpperCase() } },
                        { poNumber: term },
                        { bolNumber: term },
                    ],
                },
            ],
        };

        return this.group(
            QuickFindType.LOAD,
            this.loadRepo.findMany({
                where,
                take,
                orderBy: { createdAt: 'desc' },
                select: { id: true, status: true },
            }),
            this.loadRepo.count({ where }),
            ({ id, status }) => ({ id, label: id, detail: status }),
        );
    }

    private facilities(
        organizationId: string | undefined,
        contains: Prisma.StringFilter,
    ) {
        const where: Prisma.FacilityWhereInput = {
            organizationId,
            OR: [{ name: contains }, { city: contains }],
        };

        return this.group(
            QuickFindType.FACILITY,
            this.facilityRepo.findMany({
                where,
                take,
                orderBy: { name: 'asc' },
                select: { id: true, name: true, city: true, region: true },
            }),
            this.facilityRepo.count({ where }),
            ({ id, name, city, region }) => ({
                id,
                label: name,
                detail: `${city}, ${region}`,
            }),
        );
    }

    private members(
        organizationId: string | undefined,
        contains: Prisma.StringFilter,
    ) {
        const where: Prisma.UserWhereInput = {
            ...(organizationId ? { membership: { organizationId } } : {}),
            OR: [{ fullName: contains }, { email: contains }],
        };

        return this.group(
            QuickFindType.MEMBER,
            this.userRepo.findMany({
                where,
                take,
                orderBy: { fullName: 'asc' },
                select: { id: true, fullName: true, email: true },
            }),
            this.userRepo.count({ where }),
            ({ id, fullName, email }) => ({
                id,
                label: fullName,
                detail: email,
            }),
        );
    }

    private organizations(contains: Prisma.StringFilter) {
        const where: Prisma.OrganizationWhereInput = { name: contains };

        return this.group(
            QuickFindType.ORGANIZATION,
            this.organizationRepo.findMany({
                where,
                take,
                orderBy: { name: 'asc' },
                select: { id: true, name: true, side: true },
            }),
            this.organizationRepo.count({ where }),
            ({ id, name, side }) => ({ id, label: name, detail: side }),
        );
    }

    private async group<Row>(
        type: QuickFindType,
        rows: Promise<Row[]>,
        total: Promise<number>,
        toFound: (row: Row) => Found,
    ) {
        const [found, count] = await Promise.all([rows, total]);

        return {
            type,
            total: count,
            items: found.map((row) => ({ type, ...toFound(row) })),
        };
    }
}
