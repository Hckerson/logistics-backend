import { PageQueryDto } from '@common/dto';
import { Injectable } from '@nestjs/common';
import { PAGE_SIZE } from '@common/enums/load';
import { NotificationRepo } from '@common/repos/notification.repo';
import type { AuthUser } from '@core/auth/types/auth.types';
import { notificationSelect } from './dto';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationRepo: NotificationRepo) {}

    async list(user: AuthUser, { cursor, limit }: PageQueryDto) {
        const take = limit ?? PAGE_SIZE.default;
        const records = await this.notificationRepo.findMany({
            where: { userId: user.id },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: notificationSelect,
        });
        const items = records.slice(0, take);

        return {
            items,
            nextCursor: records.length > take ? items[take - 1].id : null,
        };
    }

    async unreadCount(user: AuthUser) {
        return {
            count: await this.notificationRepo.count({
                where: { userId: user.id, readAt: null },
            }),
        };
    }

    async markRead(user: AuthUser, notificationId: string) {
        await this.notificationRepo.updateMany({
            where: { id: notificationId, userId: user.id, readAt: null },
            data: { readAt: new Date() },
        });

        return this.unreadCount(user);
    }

    async markAllRead(user: AuthUser) {
        await this.notificationRepo.updateMany({
            where: { userId: user.id, readAt: null },
            data: { readAt: new Date() },
        });

        return this.unreadCount(user);
    }
}
