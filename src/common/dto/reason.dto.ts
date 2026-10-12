import { ApiProperty } from '@nestjs/swagger';
import { REASON_LENGTH } from '@common/enums/roles';
import { IsOptional, IsString, Length } from 'class-validator';

export class ReasonDto {
    @ApiProperty({
        required: false,
        minLength: REASON_LENGTH.min,
        maxLength: REASON_LENGTH.max,
    })
    @IsOptional()
    @IsString()
    @Length(REASON_LENGTH.min, REASON_LENGTH.max)
    reason?: string;
}
