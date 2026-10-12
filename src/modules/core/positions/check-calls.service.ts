import { minutesSince } from '@lib/tracking';
import { MINUTE_MS } from '@common/enums/time';
import { CHECK_CALL_RECIPIENT_ROLE } from '@common/enums/roles';
import { LoadRepo } from '@common/repos/load.repo';
import { UserRepo } from '@common/repos/user.repo';
import { PositionRepo } from '@common/repos/position.repo';
import { LoadEventRepo } from '@common/repos/load-event.repo';
import { NotificationRepo } from '@common/repos/notification.repo';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { ConflictException, Injectable } from '@nestjs/common';
import { LoadEventType, NotificationEvent } from 'generated/prisma/enums';
import { CheckCallDto } from './dto';
import {
    CHECK_CALL,
    TRACKED_STATUSES,
    TRACKING_MESSAGES,
    TRACKING_STALE_MINUTES,
} from '@common/enums/tracking';

@Injectable()
export class CheckCallsService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly userRepo: UserRepo,
        private readonly positionRepo: PositionRepo,
        private readonly loadEventRepo: LoadEventRepo,
        private readonly notificationRepo: NotificationRepo,
        private readonly access: LoadAccessService,
    ) {}

    async request(user: AuthUser, loadId: string, { note }: CheckCallDto) {
        const { status } = await this.access.visible(
            user,
            loadId,
            'requestCheckCall',
        );
        const latest = await this.positionRepo.findFirst({
            where: { loadId },
            orderBy: { recordedAt: 'desc' },
            select: { recordedAt: true },
        });

        if (
            !TRACKED_STATUSES.includes(status) ||
            (latest && minutesSince(latest.recordedAt) < TRACKING_STALE_MINUTES)
        ) {
            throw new ConflictException(TRACKING_MESSAGES.checkCallClosed);
        }

        const recent = await this.loadEventRepo.findFirst({
            where: {
                loadId,
                type: LoadEventType.checkCallRequested,
                occurredAt: {
                    gte: new Date(
                        Date.now() - CHECK_CALL.repeatMinutes * MINUTE_MS,
                    ),
                },
            },
            select: { id: true },
        });
        if (recent)
            throw new ConflictException(TRACKING_MESSAGES.checkCallRecent);

        const event = await this.loadEventRepo.create({
            data: {
                loadId,
                type: LoadEventType.checkCallRequested,
                note: note ?? null,
                ...this.access.actorOf(user),
            },
            select: { occurredAt: true },
        });

        await this.notify(loadId);

        return { requestedAt: event.occurredAt };
    }

    private async notify(loadId: string) {
        const load = await this.loadRepo.findFirst({
            where: { id: loadId },
            select: { carrierId: true, driverId: true },
        });
        const dispatchers = load?.carrierId
            ? await this.userRepo.findMany({
                  where: {
                      membership: {
                          organizationId: load.carrierId,
                          roles: { has: CHECK_CALL_RECIPIENT_ROLE },
                      },
                  },
                  select: { id: true },
              })
            : [];
        const recipients = new Set([
            ...dispatchers.map(({ id }) => id),
            ...(load?.driverId ? [load.driverId] : []),
        ]);

        await this.notificationRepo.createMany({
            data: [...recipients].map((userId) => ({
                userId,
                loadId,
                event: NotificationEvent.checkCallRequested,
            })),
        });
    }
}
