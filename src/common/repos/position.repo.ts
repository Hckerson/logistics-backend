import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class PositionRepo {
    constructor(private prisma: PrismaService) {}

    async findFirst<T extends Prisma.PositionFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.PositionFindFirstArgs>,
    ) {
        try {
            return await this.prisma.position.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first position',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.PositionFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.PositionFindManyArgs>,
    ) {
        try {
            return await this.prisma.position.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find positions',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
