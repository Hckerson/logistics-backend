import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { Prisma } from 'generated/prisma/client';
import { PageQueryDto } from '@common/dto';
import {
    TIMELINE_CATEGORIES,
    type TimelineCategory,
} from '@common/enums/timeline';
import {
    ActorType,
    EventSource,
    LoadEventType,
    LoadStatus,
} from 'generated/prisma/enums';

export class TimelineQueryDto extends PageQueryDto {
    @ApiProperty({ enum: TIMELINE_CATEGORIES, required: false })
    @IsOptional()
    @IsIn(TIMELINE_CATEGORIES)
    category?: TimelineCategory;
}

export class LoadEventDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: LoadEventType })
    type: LoadEventType;

    @ApiProperty({ enum: TIMELINE_CATEGORIES })
    category: TimelineCategory;

    @ApiProperty({ enum: LoadStatus, nullable: true })
    fromStatus: LoadStatus | null;

    @ApiProperty({ enum: LoadStatus, nullable: true })
    toStatus: LoadStatus | null;

    @ApiProperty({ enum: ActorType })
    actorType: ActorType;

    @ApiProperty({ type: String, nullable: true })
    actorName: string | null;

    @ApiProperty({ enum: EventSource })
    source: EventSource;

    @ApiProperty({ type: String, nullable: true })
    reason: string | null;

    @ApiProperty({ type: String, nullable: true })
    note: string | null;

    @ApiProperty({ type: String, nullable: true })
    city: string | null;

    @ApiProperty({ format: 'date-time' })
    occurredAt: string;
}

export class LoadEventPageDto {
    @ApiProperty({ type: LoadEventDto, isArray: true })
    items: LoadEventDto[];

    @ApiProperty({ type: String, nullable: true })
    nextCursor: string | null;
}

export const loadEventSelect = {
    id: true,
    type: true,
    fromStatus: true,
    toStatus: true,
    actorType: true,
    source: true,
    reason: true,
    note: true,
    city: true,
    occurredAt: true,
    actor: { select: { fullName: true } },
} as const satisfies Prisma.LoadEventSelect;

export type LoadEventRecord = Prisma.LoadEventGetPayload<{
    select: typeof loadEventSelect;
}>;
