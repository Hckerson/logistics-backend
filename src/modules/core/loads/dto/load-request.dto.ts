import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { LoadStatus } from 'generated/prisma/enums';
import { QUICK_FIND } from '@common/enums/search';
import { EQUIPMENT_TYPES } from '@common/enums/load';
import { PageQueryDto, ReasonDto } from '@common/dto';
import {
    IsBoolean,
    IsEnum,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';

const commaList = ({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value;

const flag = ({ value }: TransformFnParams): unknown =>
    value === 'true' || value === true;

export class LoadListQueryDto extends PageQueryDto {
    @ApiProperty({ type: String, required: false, example: 'Posted,InTransit' })
    @IsOptional()
    @Transform(commaList)
    @IsEnum(LoadStatus, { each: true })
    status?: LoadStatus[];

    @ApiProperty({ type: String, required: false, example: 'dry-van,reefer' })
    @IsOptional()
    @Transform(commaList)
    @IsIn(EQUIPMENT_TYPES, { each: true })
    equipment?: string[];

    @ApiProperty({ required: false, maxLength: QUICK_FIND.max })
    @IsOptional()
    @IsString()
    @MaxLength(QUICK_FIND.max)
    q?: string;

    @ApiProperty({ type: Boolean, required: false })
    @IsOptional()
    @Transform(flag)
    @IsBoolean()
    late?: boolean;
}

export class LoadTransitionDto extends ReasonDto {
    @ApiProperty({ enum: LoadStatus })
    @IsEnum(LoadStatus)
    to: LoadStatus;

    @ApiProperty({ minimum: 1 })
    @IsInt()
    @Min(1)
    version: number;

    @ApiProperty({ required: false, format: 'uuid' })
    @IsOptional()
    @IsUUID()
    carrierId?: string;
}
