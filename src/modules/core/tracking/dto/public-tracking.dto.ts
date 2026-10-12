import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { EtaDto } from '@core/loads/dto';
import { LoadStatus, PositionSource, StopType } from 'generated/prisma/enums';

export class PublicStopDto {
    @ApiProperty({ enum: StopType })
    type: StopType;

    @ApiProperty()
    city: string;

    @ApiProperty()
    region: string;

    @ApiProperty({ example: 'America/Chicago' })
    timeZone: string;

    @ApiProperty({ description: 'Rounded to city level' })
    latitude: number;

    @ApiProperty({ description: 'Rounded to city level' })
    longitude: number;

    @ApiProperty({ format: 'date-time' })
    windowStart: string;

    @ApiProperty({ format: 'date-time' })
    windowEnd: string;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    arrivedAt: string | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    departedAt: string | null;
}

export class PublicPositionDto {
    @ApiProperty({ description: 'Rounded to city level' })
    latitude: number;

    @ApiProperty({ description: 'Rounded to city level' })
    longitude: number;

    @ApiProperty()
    city: string;

    @ApiProperty({ enum: PositionSource })
    source: PositionSource;

    @ApiProperty({ format: 'date-time' })
    recordedAt: string;
}

export class PublicTrackingDto {
    @ApiProperty({ example: 'HL-7K2M9QXA' })
    reference: string;

    @ApiProperty({ enum: LoadStatus })
    status: LoadStatus;

    @ApiProperty()
    sharedBy: string;

    @ApiProperty({ type: PublicStopDto, isArray: true })
    stops: PublicStopDto[];

    @ApiProperty({ type: EtaDto, nullable: true })
    eta: EtaDto | null;

    @ApiProperty({ type: PublicPositionDto, nullable: true })
    position: PublicPositionDto | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    deliveredAt: string | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    expiresAt: string | null;

    @ApiProperty()
    expired: boolean;
}

export const publicLoadSelect = {
    id: true,
    status: true,
    etaAt: true,
    etaConfidence: true,
    etaLate: true,
    milesRemaining: true,
    shipper: { select: { name: true } },
    stops: {
        orderBy: { sequence: 'asc' },
        select: {
            type: true,
            windowStart: true,
            windowEnd: true,
            arrivedAt: true,
            departedAt: true,
            facility: {
                select: {
                    city: true,
                    region: true,
                    timeZone: true,
                    latitude: true,
                    longitude: true,
                },
            },
        },
    },
} as const satisfies Prisma.LoadSelect;

export type PublicLoadRecord = Prisma.LoadGetPayload<{
    select: typeof publicLoadSelect;
}>;
