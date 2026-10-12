import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class LoadRepo {
    constructor(private prisma: PrismaService) {}

    async findFirst<T extends Prisma.LoadFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadFindFirstArgs>,
    ) {
        try {
            return await this.prisma.load.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first load',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.LoadFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadFindManyArgs>,
    ) {
        try {
            return await this.prisma.load.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find loads',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async update<T extends Prisma.LoadUpdateArgs>(
        params: Prisma.SelectSubset<T, Prisma.LoadUpdateArgs>,
    ) {
        try {
            return await this.prisma.load.update(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update load',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.LoadCountArgs): Promise<number> {
        try {
            return await this.prisma.load.count(params);
        } catch (error) {
            throw new RepoError(
                'Failed to count loads',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async groupBy(
        field: Prisma.LoadScalarFieldEnum,
        where: Prisma.LoadWhereInput,
    ) {
        try {
            return await this.prisma.load.groupBy({
                by: [field],
                where,
                _count: { _all: true },
            });
        } catch (error) {
            throw new RepoError(
                'Failed to group loads',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
