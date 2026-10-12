import { etaOf } from '@lib/eta';
import { moneyOf } from '@lib/money';
import { Prisma } from 'generated/prisma/client';
import { LoadRepo } from '@common/repos/load.repo';
import { ChargeParty } from 'generated/prisma/enums';
import { LoadAccessService } from './load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LOAD_MESSAGES, PAGE_SIZE } from '@common/enums/load';
import {
    LoadDetailRecord,
    LoadListQueryDto,
    LoadSummaryRecord,
    loadDetailSelect,
    loadSummarySelect,
} from './dto';

const placeOf = ({
    type,
    windowStart,
    windowEnd,
    facility,
}: LoadSummaryRecord['stops'][number]) => ({
    type,
    windowStart,
    windowEnd,
    ...facility,
});

const partsFor = (charges: LoadDetailRecord['charges'], party: ChargeParty) =>
    charges
        .filter((charge) => charge.party === party)
        .map(({ kind, amountCents, status }) => ({
            kind,
            amountCents,
            status,
        }));

@Injectable()
export class LoadsService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly access: LoadAccessService,
    ) {}

    async list(user: AuthUser, query: LoadListQueryDto) {
        const limit = query.limit ?? PAGE_SIZE.default;
        const records = await this.loadRepo.findMany({
            where: { AND: [this.access.scope(user), this.filters(query)] },
            select: loadSummarySelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit + 1,
            ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        });
        const items = records.slice(0, limit);

        return {
            items: items.map((record) => this.toSummary(record)),
            nextCursor: records.length > limit ? items[limit - 1].id : null,
        };
    }

    async counts(user: AuthUser) {
        const groups = await this.loadRepo.groupBy(
            'status',
            this.access.scope(user),
        );

        return groups.map(({ status, _count }) => ({
            status,
            count: _count._all,
        }));
    }

    async findOne(user: AuthUser, loadId: string) {
        const record = await this.loadRepo.findFirst({
            where: { AND: [{ id: loadId }, this.access.scope(user)] },
            select: loadDetailSelect,
        });

        if (!record) throw new NotFoundException(LOAD_MESSAGES.notFound);

        return this.toDetail(user, record);
    }

    private toDetail(
        user: AuthUser,
        {
            etaAt,
            etaConfidence,
            etaLate,
            milesRemaining,
            charges,
            ...load
        }: LoadDetailRecord,
    ) {
        return {
            ...load,
            eta: etaOf({ etaAt, etaConfidence, etaLate, milesRemaining }),
            shipperPrice: this.access.can(user, 'viewShipperPrice')
                ? moneyOf(partsFor(charges, ChargeParty.shipper))
                : null,
            carrierPay: this.access.can(user, 'viewCarrierPay')
                ? moneyOf(partsFor(charges, ChargeParty.carrier))
                : null,
        };
    }

    private toSummary({
        etaAt,
        etaConfidence,
        etaLate,
        milesRemaining,
        stops,
        positions,
        ...load
    }: LoadSummaryRecord) {
        const [latest] = positions;

        return {
            ...load,
            origin: placeOf(stops[0]),
            destination: placeOf(stops[stops.length - 1]),
            eta: etaOf({ etaAt, etaConfidence, etaLate, milesRemaining }),
            lastPositionAt: latest?.recordedAt ?? null,
            lastPositionCity: latest?.city ?? null,
        };
    }

    private filters({
        status,
        equipment,
        q,
        late,
    }: LoadListQueryDto): Prisma.LoadWhereInput {
        return {
            ...(status?.length ? { status: { in: status } } : {}),
            ...(equipment?.length ? { equipment: { in: equipment } } : {}),
            ...(late ? { etaLate: true } : {}),
            ...(q?.trim() ? { OR: this.matches(q.trim()) } : {}),
        };
    }

    private matches(q: string): Prisma.LoadWhereInput[] {
        const contains: Prisma.StringFilter = {
            contains: q,
            mode: 'insensitive',
        };

        return [
            { id: { startsWith: q.toUpperCase() } },
            { poNumber: q },
            { bolNumber: q },
            { shipper: { name: contains } },
            { carrier: { name: contains } },
            { stops: { some: { facility: { city: contains } } } },
        ];
    }
}
