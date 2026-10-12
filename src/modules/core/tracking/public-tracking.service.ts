import { etaOf } from '@lib/eta';
import { deliveredAtOf, roundTo } from '@lib/tracking';
import { DAY_MS } from '@common/enums/time';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PositionRepo } from '@common/repos/position.repo';
import { TrackingLinkRepo } from '@common/repos/tracking-link.repo';
import { TrackingTokenService } from './tracking-token.service';
import { PublicLoadRecord, publicLoadSelect } from './dto';
import {
    PUBLIC_POSITION_DECIMALS,
    TRACKED_STATUSES,
    TRACKING_LINK_EXPIRY_DAYS,
    TRACKING_MESSAGES,
} from '@common/enums/tracking';

const publicStop = ({
    facility,
    ...stop
}: PublicLoadRecord['stops'][number]) => ({
    ...stop,
    ...facility,
    latitude: roundTo(facility.latitude, PUBLIC_POSITION_DECIMALS),
    longitude: roundTo(facility.longitude, PUBLIC_POSITION_DECIMALS),
});

@Injectable()
export class PublicTrackingService {
    constructor(
        private readonly linkRepo: TrackingLinkRepo,
        private readonly positionRepo: PositionRepo,
        private readonly tokens: TrackingTokenService,
    ) {}

    async find(token: string) {
        const linkId = this.tokens.linkIdOf(token);
        const link = linkId
            ? await this.linkRepo.findFirst({
                  where: { id: linkId, revokedAt: null },
                  select: { load: { select: publicLoadSelect } },
              })
            : null;
        if (!link) throw new NotFoundException(TRACKING_MESSAGES.linkNotFound);

        const { id, status, shipper, stops, ...eta } = link.load;
        const deliveredAt = deliveredAtOf(stops);
        const expiresAt = deliveredAt
            ? new Date(
                  deliveredAt.getTime() + TRACKING_LINK_EXPIRY_DAYS * DAY_MS,
              )
            : null;
        const expired = expiresAt !== null && expiresAt.getTime() <= Date.now();

        return {
            reference: id,
            status,
            sharedBy: shipper.name,
            stops: stops.map(publicStop),
            eta: expired ? null : etaOf(eta),
            position:
                expired || !TRACKED_STATUSES.includes(status)
                    ? null
                    : await this.positionOf(id),
            deliveredAt,
            expiresAt,
            expired,
        };
    }

    private async positionOf(loadId: string) {
        const latest = await this.positionRepo.findFirst({
            where: { loadId },
            orderBy: { recordedAt: 'desc' },
            select: {
                latitude: true,
                longitude: true,
                city: true,
                source: true,
                recordedAt: true,
            },
        });

        return latest
            ? {
                  ...latest,
                  latitude: roundTo(latest.latitude, PUBLIC_POSITION_DECIMALS),
                  longitude: roundTo(
                      latest.longitude,
                      PUBLIC_POSITION_DECIMALS,
                  ),
              }
            : null;
    }
}
