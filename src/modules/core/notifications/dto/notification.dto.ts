import { ApiProperty } from '@nestjs/swagger';
import { NotificationEvent } from 'generated/prisma/enums';

export class NotificationDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: NotificationEvent })
    event: NotificationEvent;

    @ApiProperty({ type: String, nullable: true, example: 'HL-7K2M9QXA' })
    loadId: string | null;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: String, format: 'date-time', nullable: true })
    readAt: string | null;
}

export class NotificationPageDto {
    @ApiProperty({ type: NotificationDto, isArray: true })
    items: NotificationDto[];

    @ApiProperty({ type: String, nullable: true })
    nextCursor: string | null;
}

export class UnreadCountDto {
    @ApiProperty()
    count: number;
}

export const notificationSelect = {
    id: true,
    event: true,
    loadId: true,
    createdAt: true,
    readAt: true,
} as const satisfies Record<keyof NotificationDto, true>;
