import { Injectable } from '@nestjs/common';
import { PAGE_SIZE } from '@common/enums/load';
import { LoadEventType } from 'generated/prisma/enums';
import { LoadEventRepo } from '@common/repos/load-event.repo';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { EVENT_CATEGORY, type TimelineCategory } from '@common/enums/timeline';
import { LoadEventRecord, TimelineQueryDto, loadEventSelect } from './dto';

const typesIn = (category: TimelineCategory): LoadEventType[] =>
    Object.values(LoadEventType).filter(
        (type) => EVENT_CATEGORY[type] === category,
    );

const toEvent = ({ actor, ...event }: LoadEventRecord) => ({
    ...event,
    category: EVENT_CATEGORY[event.type],
    actorName: actor?.fullName ?? null,
});

@Injectable()
export class TimelineService {
    constructor(
        private readonly loadEventRepo: LoadEventRepo,
        private readonly access: LoadAccessService,
    ) {}

    async list(user: AuthUser, loadId: string, query: TimelineQueryDto) {
        await this.access.visible(user, loadId);

        const limit = query.limit ?? PAGE_SIZE.default;
        const records = await this.loadEventRepo.findMany({
            where: {
                loadId,
                ...(query.category
                    ? { type: { in: typesIn(query.category) } }
                    : {}),
            },
            orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
            take: limit + 1,
            ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
            select: loadEventSelect,
        });
        const items = records.slice(0, limit);

        return {
            items: items.map(toEvent),
            nextCursor: records.length > limit ? items[limit - 1].id : null,
        };
    }
}
