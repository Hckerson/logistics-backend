import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_BYTES = 16;
const UUID_GROUPS = [8, 4, 4, 4, 12];
const SEPARATOR = '.';

const uuidFromHex = (hex: string): string => {
    let offset = 0;

    return UUID_GROUPS.map((length) => {
        const group = hex.slice(offset, offset + length);
        offset += length;
        return group;
    }).join('-');
};

@Injectable()
export class TrackingTokenService {
    constructor(private readonly config: ConfigService) {}

    tokenFor(linkId: string): string {
        const id = Buffer.from(linkId.replaceAll('-', ''), 'hex');

        return [
            id.toString('base64url'),
            this.sign(id).toString('base64url'),
        ].join(SEPARATOR);
    }

    linkIdOf(token: string): string | null {
        const [encoded, signature, ...rest] = token.split(SEPARATOR);
        if (!encoded || !signature || rest.length > 0) return null;

        const id = Buffer.from(encoded, 'base64url');
        const given = Buffer.from(signature, 'base64url');
        const expected = this.sign(id);

        return given.length === expected.length &&
            timingSafeEqual(given, expected)
            ? uuidFromHex(id.toString('hex'))
            : null;
    }

    private sign(id: Buffer): Buffer {
        return createHmac(
            'sha256',
            this.config.getOrThrow<string>('TRACKING_TOKEN_SECRET'),
        )
            .update(id)
            .digest()
            .subarray(0, SIGNATURE_BYTES);
    }
}
