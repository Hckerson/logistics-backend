import { etaOf } from '@lib/eta';
import { Injectable } from '@nestjs/common';
import { LoadRepo } from '@common/repos/load.repo';
import { PositionRepo } from '@common/repos/position.repo';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { downsample, healthOf } from '@lib/tracking';
import { positionSelect } from './dto';
import { HOUR_MS } from '@common/enums/time';
import {
    MAP_LOAD_LIMIT,
    TRACE_STATUSES,
    TRACKED_STATUSES,
    TRACK_MAX_POINTS,
    TRACK_WINDOW_HOURS,
} from '@common/enums/tracking';

const etaSelect = {
    etaAt: true,
    etaConfidence: true,
    etaLate: true,
    milesRemaining: true,
} as const;

@Injectable()
export class PositionsService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly positionRepo: PositionRepo,
        private readonly access: LoadAccessService,
    ) {}

    async forLoad(user: AuthUser, loadId: string) {
        const { status } = await this.access.visible(
            user,
            loadId,
            'viewLiveLocation',
        );
        const load = await this.loadRepo.findFirst({
            where: { id: loadId },
            select: etaSelect,
        });
        const eta = load ? etaOf(load) : null;

        if (!TRACE_STATUSES.includes(status)) {
            return { latest: null, track: [], eta, health: null };
        }

        const points = await this.positionRepo.findMany({
            where: {
                loadId,
                recordedAt: {
                    gte: new Date(Date.now() - TRACK_WINDOW_HOURS * HOUR_MS),
                },
            },
            orderBy: { recordedAt: 'asc' },
            select: positionSelect,
        });
        const latest =
            points.at(-1) ??
            (await this.positionRepo.findFirst({
                where: { loadId },
                orderBy: { recordedAt: 'desc' },
                select: positionSelect,
            }));

        return {
            latest,
            track: downsample(points, TRACK_MAX_POINTS),
            eta,
            health:
                latest && TRACKED_STATUSES.includes(status)
                    ? healthOf(latest.recordedAt)
                    : null,
        };
    }

    async latestForMap(user: AuthUser) {
        if (!this.access.can(user, 'viewLiveLocation')) return [];

        const loads = await this.loadRepo.findMany({
            where: {
                AND: [
                    this.access.scope(user),
                    { status: { in: [...TRACKED_STATUSES] } },
                ],
            },
            orderBy: { updatedAt: 'desc' },
            take: MAP_LOAD_LIMIT,
            select: {
                id: true,
                status: true,
                positions: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                    select: positionSelect,
                },
            },
        });

        return loads.flatMap(({ id, status, positions: [latest] }) =>
            latest ? [{ loadId: id, status, ...latest }] : [],
        );
    }
}
