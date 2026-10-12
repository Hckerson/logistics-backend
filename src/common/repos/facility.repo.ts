import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class FacilityRepo {
    constructor(private prisma: PrismaService) {}

    async findMany<T extends Prisma.FacilityFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.FacilityFindManyArgs>,
    ) {
        try {
            return await this.prisma.facility.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find facilities',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.FacilityCountArgs): Promise<number> {
        try {
            return await this.prisma.facility.count(params);
        } catch (error) {
            throw new RepoError(
                'Failed to count facilities',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
