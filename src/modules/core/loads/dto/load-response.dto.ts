import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { LoadStatus } from 'generated/prisma/enums';
import { EQUIPMENT_TYPES } from '@common/enums/load';
import { EtaDto, MoneyDto, PartyDto, StopDto } from './load-parts.dto';

export class LoadDto {
    @ApiProperty({ example: 'HL-7K2M9QXA' })
    id: string;

    @ApiProperty({ enum: LoadStatus })
    status: LoadStatus;

    @ApiProperty()
    version: number;

    @ApiProperty({ enum: EQUIPMENT_TYPES })
    equipment: string;

    @ApiProperty()
    commodity: string;

    @ApiProperty()
    weightLb: number;

    @ApiProperty({ type: Number, nullable: true })
    pallets: number | null;

    @ApiProperty({ type: Number, nullable: true })
    tempMinF: number | null;

    @ApiProperty({ type: Number, nullable: true })
    tempMaxF: number | null;

    @ApiProperty()
    hazmat: boolean;

    @ApiProperty({ type: String, nullable: true })
    poNumber: string | null;

    @ApiProperty({ type: String, nullable: true })
    bolNumber: string | null;

    @ApiProperty({ type: PartyDto })
    shipper: PartyDto;

    @ApiProperty({ type: PartyDto, nullable: true })
    carrier: PartyDto | null;

    @ApiProperty({ type: EtaDto, nullable: true })
    eta: EtaDto | null;

    @ApiProperty({ type: StopDto, isArray: true })
    stops: StopDto[];

    @ApiProperty({ type: MoneyDto, nullable: true })
    shipperPrice: MoneyDto | null;

    @ApiProperty({ type: MoneyDto, nullable: true })
    carrierPay: MoneyDto | null;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ format: 'date-time' })
    updatedAt: string;
}

const partySelect = { select: { id: true, name: true } } as const;

export const loadDetailSelect = {
    id: true,
    status: true,
    version: true,
    equipment: true,
    commodity: true,
    weightLb: true,
    pallets: true,
    tempMinF: true,
    tempMaxF: true,
    hazmat: true,
    poNumber: true,
    bolNumber: true,
    etaAt: true,
    etaConfidence: true,
    etaLate: true,
    milesRemaining: true,
    createdAt: true,
    updatedAt: true,
    shipper: partySelect,
    carrier: partySelect,
    stops: {
        orderBy: { sequence: 'asc' },
        select: {
            id: true,
            sequence: true,
            type: true,
            windowStart: true,
            windowEnd: true,
            reference: true,
            instructions: true,
            arrivedAt: true,
            departedAt: true,
            facility: {
                select: {
                    name: true,
                    line1: true,
                    city: true,
                    region: true,
                    postalCode: true,
                    latitude: true,
                    longitude: true,
                    timeZone: true,
                },
            },
        },
    },
    charges: {
        select: { party: true, kind: true, amountCents: true, status: true },
    },
} as const satisfies Prisma.LoadSelect;

export type LoadDetailRecord = Prisma.LoadGetPayload<{
    select: typeof loadDetailSelect;
}>;
