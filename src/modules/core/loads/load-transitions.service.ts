import { stopFits, stopTimesFor } from '@lib/stop-times';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '@common/errors/repo.error';
import { LoadRepo } from '@common/repos/load.repo';
import { LoadEventRepo } from '@common/repos/load-event.repo';
import { RECORD_NOT_FOUND } from '@common/enums/prisma';
import { MINUTE_MS } from '@common/enums/time';
import type { LoadActor } from '@common/enums/roles';
import type { AuthUser } from '@core/auth/types/auth.types';
import { LoadsService } from './loads.service';
import { LoadAccessService } from './load-access.service';
import { LoadTransitionDto } from './dto';
import {
    LOAD_MESSAGES,
    STOP_EVENT_UNDO_MINUTES,
    UNDOABLE_LOAD_STATUSES,
} from '@common/enums/load';
import {
    LOAD_MOVES,
    LOAD_RETURNS,
    REASONED_MOVES,
} from '@common/enums/load-transitions';
import { LoadEventType, LoadStatus } from 'generated/prisma/enums';
import {
    ConflictException,
    Injectable,
    PreconditionFailedException,
    UnprocessableEntityException,
} from '@nestjs/common';

const allows = (
    rule: { from: readonly LoadStatus[]; actors: readonly LoadActor[] },
    from: LoadStatus,
    actors: readonly LoadActor[],
) =>
    rule.from.includes(from) &&
    rule.actors.some((actor) => actors.includes(actor));

const staleOnMissing = (error: unknown): never => {
    if (
        error instanceof RepoError &&
        error.cause instanceof Prisma.PrismaClientKnownRequestError &&
        error.cause.code === RECORD_NOT_FOUND
    ) {
        throw new PreconditionFailedException(LOAD_MESSAGES.staleVersion);
    }
    throw error;
};

@Injectable()
export class LoadTransitionsService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly loadEventRepo: LoadEventRepo,
        private readonly access: LoadAccessService,
        private readonly loads: LoadsService,
    ) {}

    async transition(user: AuthUser, loadId: string, dto: LoadTransitionDto) {
        const { status, version } = await this.access.visible(user, loadId);
        if (version !== dto.version) {
            throw new PreconditionFailedException(LOAD_MESSAGES.staleVersion);
        }

        const found = await this.loadRepo.findFirst({
            where: { id: loadId },
            select: {
                stops: {
                    orderBy: { sequence: 'asc' },
                    select: {
                        id: true,
                        type: true,
                        arrivedAt: true,
                        departedAt: true,
                    },
                },
            },
        });
        const stops = found?.stops ?? [];
        const actors = this.access.actorsOf(user);
        const isMove =
            stopFits(dto.to, stops) &&
            LOAD_MOVES.some(
                (move) => move.to === dto.to && allows(move, status, actors),
            );
        const undo =
            !isMove && (await this.isReturn(loadId, status, dto.to, actors));
        if (!isMove && !undo)
            throw new ConflictException(LOAD_MESSAGES.illegalMove);

        const reasoned =
            this.access.isStaff(user) ||
            REASONED_MOVES.includes(dto.to) ||
            status === LoadStatus.OnHold;
        if (reasoned && !dto.reason) {
            throw new UnprocessableEntityException(
                LOAD_MESSAGES.reasonRequired,
            );
        }

        const stop = stopTimesFor(status, dto.to, undo, stops, new Date());

        await this.loadRepo
            .update({
                where: { id: loadId, version: dto.version },
                data: {
                    status: dto.to,
                    version: { increment: 1 },
                    ...this.coverage(user, actors, status, dto),
                    events: {
                        create: {
                            type: LoadEventType.statusChanged,
                            fromStatus: status,
                            toStatus: dto.to,
                            reason: dto.reason ?? null,
                            ...this.access.actorOf(user),
                        },
                    },
                    ...(stop
                        ? {
                              stops: {
                                  update: {
                                      where: { id: stop.id },
                                      data: stop.data,
                                  },
                              },
                          }
                        : {}),
                },
                select: { id: true },
            })
            .catch(staleOnMissing);

        return this.loads.findOne(user, loadId);
    }

    private coverage(
        user: AuthUser,
        actors: readonly LoadActor[],
        from: LoadStatus,
        { to, carrierId }: LoadTransitionDto,
    ) {
        if (to === LoadStatus.Posted && from !== LoadStatus.Draft) {
            return { carrierId: null, driverId: null };
        }
        if (to !== LoadStatus.Booked) return {};

        const booking = actors.includes('Carrier')
            ? user.organizationId
            : carrierId;
        if (!booking)
            throw new UnprocessableEntityException(
                LOAD_MESSAGES.carrierRequired,
            );

        return { carrierId: booking };
    }

    private async isReturn(
        loadId: string,
        from: LoadStatus,
        to: LoadStatus,
        actors: readonly LoadActor[],
    ): Promise<boolean> {
        if (!LOAD_RETURNS.some((rule) => allows(rule, from, actors)))
            return false;

        const previous = await this.loadEventRepo.findFirst({
            where: {
                loadId,
                type: LoadEventType.statusChanged,
                toStatus: from,
            },
            orderBy: { occurredAt: 'desc' },
            select: { fromStatus: true, occurredAt: true },
        });
        if (previous?.fromStatus !== to) return false;

        return (
            !UNDOABLE_LOAD_STATUSES.includes(from) ||
            Date.now() - previous.occurredAt.getTime() <=
                STOP_EVENT_UNDO_MINUTES * MINUTE_MS
        );
    }
}
