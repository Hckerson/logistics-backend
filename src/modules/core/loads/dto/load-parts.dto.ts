import { ApiProperty } from '@nestjs/swagger';
import {
    ChargeKind,
    ChargeStatus,
    EtaConfidence,
    StopType,
} from 'generated/prisma/enums';

export class PartyDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;
}

export class FacilityPlaceDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    line1: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    region: string;

    @ApiProperty()
    postalCode: string;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty({ example: 'America/Chicago' })
    timeZone: string;
}

export class StopDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    sequence: number;

    @ApiProperty({ enum: StopType })
    type: StopType;

    @ApiProperty({ format: 'date-time' })
    windowStart: string;

    @ApiProperty({ format: 'date-time' })
    windowEnd: string;

    @ApiProperty({ type: String, nullable: true })
    reference: string | null;

    @ApiProperty({ type: String, nullable: true })
    instructions: string | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    arrivedAt: string | null;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    departedAt: string | null;

    @ApiProperty({ type: FacilityPlaceDto })
    facility: FacilityPlaceDto;
}

export class ChargeDto {
    @ApiProperty({ enum: ChargeKind })
    kind: ChargeKind;

    @ApiProperty()
    amountCents: number;

    @ApiProperty({ enum: ChargeStatus })
    status: ChargeStatus;
}

export class MoneyDto {
    @ApiProperty()
    totalCents: number;

    @ApiProperty({ example: 'USD' })
    currency: string;

    @ApiProperty()
    pending: boolean;

    @ApiProperty({ type: ChargeDto, isArray: true })
    parts: ChargeDto[];
}

export class EtaDto {
    @ApiProperty({ format: 'date-time' })
    at: string;

    @ApiProperty({ enum: EtaConfidence })
    confidence: EtaConfidence;

    @ApiProperty()
    late: boolean;

    @ApiProperty({ type: Number, nullable: true })
    milesRemaining: number | null;
}
