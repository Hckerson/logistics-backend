import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class OrganizationRepo {
    constructor(private prisma: PrismaService) {}

    async findMany<T extends Prisma.OrganizationFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.OrganizationFindManyArgs>,
    ) {
        try {
            return await this.prisma.organization.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find organizations',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.OrganizationCountArgs): Promise<number> {
        try {
            return await this.prisma.organization.count(params);
        } catch (error) {
            throw new RepoError(
                'Failed to count organizations',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
