import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';

export class TrackingLinkDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: 'Signed token for /track/{token}' })
    token: string;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    createdByName: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    revokedAt: string | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    expiresAt: string | null;
}

export const trackingLinkSelect = {
    id: true,
    loadId: true,
    createdAt: true,
    revokedAt: true,
    createdBy: { select: { fullName: true } },
} as const satisfies Prisma.TrackingLinkSelect;

export type TrackingLinkRecord = Prisma.TrackingLinkGetPayload<{
    select: typeof trackingLinkSelect;
}>;
