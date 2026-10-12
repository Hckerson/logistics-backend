import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PAGE_SIZE } from '@common/enums/load';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PageQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiProperty({
        required: false,
        minimum: 1,
        maximum: PAGE_SIZE.max,
        default: PAGE_SIZE.default,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(PAGE_SIZE.max)
    limit?: number;
}
