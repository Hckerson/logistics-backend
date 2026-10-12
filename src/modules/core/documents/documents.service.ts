import { randomUUID } from 'node:crypto';
import { signatureMatches } from '@lib/file-signature';
import { LoadRepo } from '@common/repos/load.repo';
import { DocumentRepo } from '@common/repos/document.repo';
import { LoadAccessService } from '@core/loads/load-access.service';
import type { AuthUser } from '@core/auth/types/auth.types';
import { LoadEventType, ScanStatus } from 'generated/prisma/enums';
import { StorageService } from './storage.service';
import { DocumentRecord, UploadRequestDto, documentSelect } from './dto';
import {
    DOCUMENT_KEY_PREFIX,
    DOCUMENT_MESSAGES,
} from '@common/enums/documents';
import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';

const toDocument = ({
    id,
    type,
    fileName,
    contentType,
    sizeBytes,
    scanStatus,
    version,
    createdAt,
    uploadedBy,
}: DocumentRecord) => ({
    id,
    type,
    fileName,
    contentType,
    sizeBytes,
    scanStatus,
    version,
    createdAt,
    uploadedByName: uploadedBy.fullName,
});

@Injectable()
export class DocumentsService {
    constructor(
        private readonly loadRepo: LoadRepo,
        private readonly documentRepo: DocumentRepo,
        private readonly storage: StorageService,
        private readonly access: LoadAccessService,
    ) {}

    async list(user: AuthUser, loadId: string) {
        await this.access.visible(user, loadId);

        const documents = await this.documentRepo.findMany({
            where: { loadId, scanStatus: { not: ScanStatus.awaitingUpload } },
            orderBy: [{ type: 'asc' }, { version: 'desc' }],
            select: documentSelect,
        });

        return documents.map(toDocument);
    }

    async requestUpload(user: AuthUser, loadId: string, dto: UploadRequestDto) {
        await this.access.visible(user, loadId, 'uploadDocument');

        const storageKey = `${DOCUMENT_KEY_PREFIX}/${loadId}/${randomUUID()}`;
        const uploadUrl = await this.storage.uploadUrl(
            storageKey,
            dto.contentType,
            dto.sizeBytes,
        );
        const earlier = await this.documentRepo.count({
            where: {
                loadId,
                type: dto.type,
                scanStatus: { not: ScanStatus.awaitingUpload },
            },
        });
        const document = await this.documentRepo.create({
            data: {
                ...dto,
                loadId,
                storageKey,
                version: earlier + 1,
                uploadedById: user.id,
            },
            select: documentSelect,
        });

        return {
            document: toDocument(document),
            uploadUrl,
            expiresAt: this.storage.expiresAt(),
        };
    }

    async complete(user: AuthUser, documentId: string) {
        const document = await this.owned(user, documentId);
        await this.access.visible(user, document.loadId, 'uploadDocument');

        const stored = await this.storage.inspect(document.storageKey);
        if (!stored) throw new ConflictException(DOCUMENT_MESSAGES.notUploaded);

        const intact = stored.sizeBytes === document.sizeBytes;
        const typed = signatureMatches(document.contentType, stored.leading);
        if (!intact || !typed) {
            await this.mark(documentId, ScanStatus.rejected);
            throw new UnprocessableEntityException(
                intact
                    ? DOCUMENT_MESSAGES.wrongType
                    : DOCUMENT_MESSAGES.mismatch,
            );
        }

        const pending = await this.mark(documentId, ScanStatus.pending);
        await this.loadRepo.update({
            where: { id: document.loadId },
            data: {
                events: {
                    create: {
                        type: LoadEventType.documentUploaded,
                        ...this.access.actorOf(user),
                    },
                },
            },
            select: { id: true },
        });

        return toDocument(pending);
    }

    async download(user: AuthUser, documentId: string) {
        const document = await this.documentRepo.findFirst({
            where: { id: documentId },
            select: documentSelect,
        });
        if (!document) throw new NotFoundException(DOCUMENT_MESSAGES.notFound);

        await this.access.visible(user, document.loadId);
        if (document.scanStatus !== ScanStatus.clean) {
            throw new ConflictException(DOCUMENT_MESSAGES.notReady);
        }

        return {
            url: await this.storage.downloadUrl(
                document.storageKey,
                document.fileName,
            ),
            expiresAt: this.storage.expiresAt(),
        };
    }

    private async owned(user: AuthUser, documentId: string) {
        const document = await this.documentRepo.findFirst({
            where: {
                id: documentId,
                uploadedById: user.id,
                scanStatus: ScanStatus.awaitingUpload,
            },
            select: documentSelect,
        });
        if (!document) throw new NotFoundException(DOCUMENT_MESSAGES.notFound);

        return document;
    }

    private mark(documentId: string, scanStatus: ScanStatus) {
        return this.documentRepo.update({
            where: { id: documentId },
            data: { scanStatus },
            select: documentSelect,
        });
    }
}
