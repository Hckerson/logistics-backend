import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class TrackingLinkRepo {
    constructor(private prisma: PrismaService) {}

    async findFirst<T extends Prisma.TrackingLinkFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.TrackingLinkFindFirstArgs>,
    ) {
        try {
            return await this.prisma.trackingLink.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first tracking link',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.TrackingLinkFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.TrackingLinkFindManyArgs>,
    ) {
        try {
            return await this.prisma.trackingLink.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find tracking links',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async create<T extends Prisma.TrackingLinkCreateArgs>(
        params: Prisma.SelectSubset<T, Prisma.TrackingLinkCreateArgs>,
    ) {
        try {
            return await this.prisma.trackingLink.create(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create tracking link',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async update<T extends Prisma.TrackingLinkUpdateArgs>(
        params: Prisma.SelectSubset<T, Prisma.TrackingLinkUpdateArgs>,
    ) {
        try {
            return await this.prisma.trackingLink.update(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update tracking link',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
