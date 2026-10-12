import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class LoadEventRepo {
    constructor(private prisma: PrismaService) {}

    async findFirst<T extends Prisma.LoadEventFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadEventFindFirstArgs>,
    ) {
        try {
            return await this.prisma.loadEvent.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first load event',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.LoadEventFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadEventFindManyArgs>,
    ) {
        try {
            return await this.prisma.loadEvent.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find load events',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async create<T extends Prisma.LoadEventCreateArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadEventCreateArgs>,
    ) {
        try {
            return await this.prisma.loadEvent.create(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create load event',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
