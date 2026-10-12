import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { RepoError } from '../errors/repo.error';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class DocumentRepo {
    constructor(private prisma: PrismaService) {}

    async findFirst<T extends Prisma.DocumentFindFirstArgs>(
        params: Prisma.SelectSubset<T, Prisma.DocumentFindFirstArgs>,
    ) {
        try {
            return await this.prisma.document.findFirst(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find first document',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async findMany<T extends Prisma.DocumentFindManyArgs>(
        params: Prisma.SelectSubset<T, Prisma.DocumentFindManyArgs>,
    ) {
        try {
            return await this.prisma.document.findMany(params);
        } catch (error) {
            throw new RepoError(
                'Failed to find documents',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async create<T extends Prisma.DocumentCreateArgs>(
        params: Prisma.SelectSubset<T, Prisma.DocumentCreateArgs>,
    ) {
        try {
            return await this.prisma.document.create(params);
        } catch (error) {
            throw new RepoError(
                'Failed to create document',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async update<T extends Prisma.DocumentUpdateArgs>(
        params: Prisma.SelectSubset<T, Prisma.DocumentUpdateArgs>,
    ) {
        try {
            return await this.prisma.document.update(params);
        } catch (error) {
            throw new RepoError(
                'Failed to update document',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }

    async count(params?: Prisma.DocumentCountArgs): Promise<number> {
        try {
            return await this.prisma.document.count(params);
        } catch (error) {
            throw new RepoError(
                'Failed to count documents',
                HttpStatus.INTERNAL_SERVER_ERROR,
                error,
            );
        }
    }
}
