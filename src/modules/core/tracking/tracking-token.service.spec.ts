import { ConfigService } from '@nestjs/config';
import { TrackingTokenService } from './tracking-token.service';

const LINK_ID = '3f2a9c1e-7b4d-4e8a-9c2f-5d6e7f8a9b0c';

const serviceWith = (secret: string) =>
    new TrackingTokenService(
        new ConfigService({ TRACKING_TOKEN_SECRET: secret }),
    );

describe('TrackingTokenService', () => {
    it('round-trips a link id through its signed token', () => {
        const service = serviceWith('secret-a');

        expect(service.linkIdOf(service.tokenFor(LINK_ID))).toBe(LINK_ID);
    });

    it('rejects a token signed with another secret or altered in transit', () => {
        const token = serviceWith('secret-a').tokenFor(LINK_ID);
        const [id] = token.split('.');

        expect(serviceWith('secret-b').linkIdOf(token)).toBeNull();
        expect(serviceWith('secret-a').linkIdOf(`${id}.forged`)).toBeNull();
        expect(serviceWith('secret-a').linkIdOf('not-a-token')).toBeNull();
    });
});
