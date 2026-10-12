import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { LoadStatus, StopType } from 'generated/prisma/enums';
import { EQUIPMENT_TYPES } from '@common/enums/load';
import { EtaDto, PartyDto } from './load-parts.dto';

export class StopPlaceDto {
    @ApiProperty({ enum: StopType })
    type: StopType;

    @ApiProperty()
    city: string;

    @ApiProperty()
    region: string;

    @ApiProperty({ format: 'date-time' })
    windowStart: string;

    @ApiProperty({ format: 'date-time' })
    windowEnd: string;

    @ApiProperty({ example: 'America/Chicago' })
    timeZone: string;
}

export class LoadSummaryDto {
    @ApiProperty({ example: 'HL-7K2M9QXA' })
    id: string;

    @ApiProperty({ enum: LoadStatus })
    status: LoadStatus;

    @ApiProperty({ enum: EQUIPMENT_TYPES })
    equipment: string;

    @ApiProperty({ type: PartyDto })
    shipper: PartyDto;

    @ApiProperty({ type: PartyDto, nullable: true })
    carrier: PartyDto | null;

    @ApiProperty({ type: StopPlaceDto })
    origin: StopPlaceDto;

    @ApiProperty({ type: StopPlaceDto })
    destination: StopPlaceDto;

    @ApiProperty({ type: EtaDto, nullable: true })
    eta: EtaDto | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    lastPositionAt: string | null;

    @ApiProperty({ type: String, nullable: true })
    lastPositionCity: string | null;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;
}

export class LoadPageDto {
    @ApiProperty({ type: LoadSummaryDto, isArray: true })
    items: LoadSummaryDto[];

    @ApiProperty({ type: String, nullable: true })
    nextCursor: string | null;
}

export class LoadCountDto {
    @ApiProperty({ enum: LoadStatus })
    status: LoadStatus;

    @ApiProperty()
    count: number;
}

const partySelect = { select: { id: true, name: true } } as const;

export const loadSummarySelect = {
    id: true,
    status: true,
    equipment: true,
    etaAt: true,
    etaConfidence: true,
    etaLate: true,
    milesRemaining: true,
    updatedAt: true,
    shipper: partySelect,
    carrier: partySelect,
    stops: {
        orderBy: { sequence: 'asc' },
        select: {
            type: true,
            windowStart: true,
            windowEnd: true,
            facility: { select: { city: true, region: true, timeZone: true } },
        },
    },
    positions: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
        select: { recordedAt: true, city: true },
    },
} as const satisfies Prisma.LoadSelect;

export type LoadSummaryRecord = Prisma.LoadGetPayload<{
    select: typeof loadSummarySelect;
}>;
