import { ConfigService } from '@nestjs/config';
import { DEFAULT_FRONTEND_URL } from '@common/enums/env';
import { TrackingTokenService } from '@core/tracking/tracking-token.service';
import type { trackingLinkInput } from './tracking-links';

type SeededLink = ReturnType<typeof trackingLinkInput>;

const REVOKED_MARK = '  (revoked)';

export const trackingAddresses = (links: readonly SeededLink[]): string[] => {
    const secret = process.env.TRACKING_TOKEN_SECRET?.trim();
    const frontendUrl =
        process.env.FRONTEND_URL?.trim() || DEFAULT_FRONTEND_URL;
    const tokens = secret
        ? new TrackingTokenService(
              new ConfigService({ TRACKING_TOKEN_SECRET: secret }),
          )
        : null;

    return links.map(({ id, loadId, revokedAt }) => {
        const address = tokens
            ? `${frontendUrl}/track/${tokens.tokenFor(id)}`
            : id;
        return `${loadId}  ${address}${revokedAt ? REVOKED_MARK : ''}`;
    });
};
