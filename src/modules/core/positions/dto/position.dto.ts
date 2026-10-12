import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { EtaDto } from '@core/loads/dto';
import { CHECK_CALL, TrackingHealth } from '@common/enums/tracking';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { LoadStatus, PositionSource } from 'generated/prisma/enums';

export class PositionDto {
    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty({ type: Number, nullable: true })
    heading: number | null;

    @ApiProperty({ type: Number, nullable: true })
    speedMph: number | null;

    @ApiProperty()
    city: string;

    @ApiProperty({ enum: PositionSource })
    source: PositionSource;

    @ApiProperty({ format: 'date-time' })
    recordedAt: string;
}

export class LoadPositionsDto {
    @ApiProperty({ type: PositionDto, nullable: true })
    latest: PositionDto | null;

    @ApiProperty({ type: PositionDto, isArray: true })
    track: PositionDto[];

    @ApiProperty({ type: EtaDto, nullable: true })
    eta: EtaDto | null;

    @ApiProperty({ enum: TrackingHealth, nullable: true })
    health: TrackingHealth | null;
}

export class MapPositionDto extends PositionDto {
    @ApiProperty({ example: 'HL-7K2M9QXA' })
    loadId: string;

    @ApiProperty({ enum: LoadStatus })
    status: LoadStatus;
}

export class CheckCallDto {
    @ApiProperty({ required: false, maxLength: CHECK_CALL.noteMax })
    @IsOptional()
    @IsString()
    @MaxLength(CHECK_CALL.noteMax)
    note?: string;
}

export const positionSelect = {
    latitude: true,
    longitude: true,
    heading: true,
    speedMph: true,
    city: true,
    source: true,
    recordedAt: true,
} as const satisfies Prisma.PositionSelect;

export class CheckCallResponseDto {
    @ApiProperty({ format: 'date-time' })
    requestedAt: string;
}
