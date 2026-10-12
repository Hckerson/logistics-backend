import { ReasonDto } from '@common/dto';
import { deliveredAtOf } from '@lib/tracking';
import { DAY_MS } from '@common/enums/time';
import { LoadRepo } from '@common/repos/load.repo';
import { LoadEventType } from 'generated/prisma/enums';
import { TrackingLinkRepo } from '@common/repos/tracking-link.repo';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { TrackingTokenService } from './tracking-token.service';
import { TrackingLinkRecord, trackingLinkSelect } from './dto';
import {
    TRACKING_LINK_EXPIRY_DAYS,
    TRACKING_MESSAGES,
} from '@common/enums/tracking';
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

@Injectable()
export class TrackingLinksService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly linkRepo: TrackingLinkRepo,
        private readonly tokens: TrackingTokenService,
        private readonly access: LoadAccessService,
    ) {}

    async list(user: AuthUser, loadId: string) {
        await this.access.visible(user, loadId, 'shareTrackingLink');

        const [links, expiresAt] = await Promise.all([
            this.linkRepo.findMany({
                where: { loadId },
                orderBy: { createdAt: 'desc' },
                select: trackingLinkSelect,
            }),
            this.expiryOf(loadId),
        ]);

        return links.map((link) => this.toLink(link, expiresAt));
    }

    async create(user: AuthUser, loadId: string, { reason }: ReasonDto) {
        await this.access.visible(user, loadId, 'shareTrackingLink');
        this.access.requireReason(user, reason);

        const expiresAt = await this.expiryOf(loadId);
        if (expiresAt && expiresAt.getTime() <= Date.now()) {
            throw new ConflictException(TRACKING_MESSAGES.linkClosed);
        }

        const active = await this.linkRepo.findFirst({
            where: { loadId, revokedAt: null },
            select: trackingLinkSelect,
        });
        if (active) return this.toLink(active, expiresAt);

        const link = await this.linkRepo.create({
            data: { loadId, createdById: user.id },
            select: trackingLinkSelect,
        });
        await this.record(
            user,
            loadId,
            LoadEventType.trackingLinkCreated,
            reason,
        );

        return this.toLink(link, expiresAt);
    }

    async revoke(user: AuthUser, linkId: string, { reason }: ReasonDto) {
        const found = await this.linkRepo.findFirst({
            where: { id: linkId, revokedAt: null },
            select: { loadId: true },
        });
        if (!found) throw new NotFoundException(TRACKING_MESSAGES.linkNotFound);

        await this.access.visible(user, found.loadId, 'shareTrackingLink');
        this.access.requireReason(user, reason);

        const link = await this.linkRepo.update({
            where: { id: linkId },
            data: { revokedAt: new Date() },
            select: trackingLinkSelect,
        });
        await this.record(
            user,
            found.loadId,
            LoadEventType.trackingLinkRevoked,
            reason,
        );

        return this.toLink(link, await this.expiryOf(found.loadId));
    }

    private async record(
        user: AuthUser,
        loadId: string,
        type: LoadEventType,
        reason?: string,
    ) {
        await this.loadRepo.update({
            where: { id: loadId },
            data: {
                events: {
                    create: {
                        type,
                        reason: reason ?? null,
                        ...this.access.actorOf(user),
                    },
                },
            },
            select: { id: true },
        });
    }

    private async expiryOf(loadId: string): Promise<Date | null> {
        const load = await this.loadRepo.findFirst({
            where: { id: loadId },
            select: {
                stops: {
                    orderBy: { sequence: 'asc' },
                    select: { departedAt: true },
                },
            },
        });
        const deliveredAt = deliveredAtOf(load?.stops ?? []);

        return deliveredAt
            ? new Date(
                  deliveredAt.getTime() + TRACKING_LINK_EXPIRY_DAYS * DAY_MS,
              )
            : null;
    }

    private toLink(
        { id, createdAt, revokedAt, createdBy }: TrackingLinkRecord,
        expiresAt: Date | null,
    ) {
        return {
            id,
            token: this.tokens.tokenFor(id),
            active:
                !revokedAt && (!expiresAt || expiresAt.getTime() > Date.now()),
            createdByName: createdBy.fullName,
            createdAt,
            revokedAt,
            expiresAt,
        };
    }
}
