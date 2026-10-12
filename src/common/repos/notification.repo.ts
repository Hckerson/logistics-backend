import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class NotificationRepo {
    constructor(private prisma: PrismaService) {}

    async findMany<T extends Prisma.NotificationFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.NotificationFindManyArgs>,
    ) {
        try {
            return await this.prisma.notification.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find notifications',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async createMany(
        params: Prisma.NotificationCreateManyArgs,
    ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.notification.createMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create notifications',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async updateMany(
        params: Prisma.NotificationUpdateManyArgs,
    ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.notification.updateMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update notifications',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.NotificationCountArgs): Promise<number> {
        try {
            return await this.prisma.notification.count(params);
        } catch (error) {
            throw new RepoError(
                'Failed to count notifications',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
