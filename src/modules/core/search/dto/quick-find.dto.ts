import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { QUICK_FIND, QuickFindType } from '@common/enums/search';

export class QuickFindQueryDto {
    @ApiProperty({ minLength: QUICK_FIND.min, maxLength: QUICK_FIND.max })
    @IsString()
    @Length(QUICK_FIND.min, QUICK_FIND.max)
    q: string;
}

export class QuickFindItemDto {
    @ApiProperty({ enum: QuickFindType })
    type: QuickFindType;

    @ApiProperty()
    id: string;

    @ApiProperty()
    label: string;

    @ApiProperty({ type: String, nullable: true })
    detail: string | null;
}

export class QuickFindGroupDto {
    @ApiProperty({ enum: QuickFindType })
    type: QuickFindType;

    @ApiProperty()
    total: number;

    @ApiProperty({ type: QuickFindItemDto, isArray: true })
    items: QuickFindItemDto[];
}

export class QuickFindDto {
    @ApiProperty({ type: QuickFindItemDto, nullable: true })
    exact: QuickFindItemDto | null;

    @ApiProperty({ type: QuickFindGroupDto, isArray: true })
    groups: QuickFindGroupDto[];
}
