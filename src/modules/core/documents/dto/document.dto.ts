import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { DocumentType, ScanStatus } from 'generated/prisma/enums';
import {
    IsEnum,
    IsIn,
    IsInt,
    IsString,
    Length,
    Max,
    Min,
} from 'class-validator';
import {
    DOCUMENT_CONTENT_TYPES,
    DOCUMENT_MAX_BYTES,
    DOCUMENT_NAME_MAX,
} from '@common/enums/documents';

export class UploadRequestDto {
    @ApiProperty({ enum: DocumentType })
    @IsEnum(DocumentType)
    type: DocumentType;

    @ApiProperty({ maxLength: DOCUMENT_NAME_MAX })
    @IsString()
    @Length(1, DOCUMENT_NAME_MAX)
    fileName: string;

    @ApiProperty({ enum: DOCUMENT_CONTENT_TYPES })
    @IsIn(DOCUMENT_CONTENT_TYPES)
    contentType: string;

    @ApiProperty({ minimum: 1, maximum: DOCUMENT_MAX_BYTES })
    @IsInt()
    @Min(1)
    @Max(DOCUMENT_MAX_BYTES)
    sizeBytes: number;
}

export class DocumentDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: DocumentType })
    type: DocumentType;

    @ApiProperty()
    fileName: string;

    @ApiProperty({ enum: DOCUMENT_CONTENT_TYPES })
    contentType: string;

    @ApiProperty()
    sizeBytes: number;

    @ApiProperty({ enum: ScanStatus })
    scanStatus: ScanStatus;

    @ApiProperty()
    version: number;

    @ApiProperty()
    uploadedByName: string;

    @ApiProperty({ format: 'date-time' })
    createdAt: string;
}

export class UploadTicketDto {
    @ApiProperty({ type: DocumentDto })
    document: DocumentDto;

    @ApiProperty({ description: 'Presigned PUT URL' })
    uploadUrl: string;

    @ApiProperty({ format: 'date-time' })
    expiresAt: string;
}

export class DownloadLinkDto {
    @ApiProperty()
    url: string;

    @ApiProperty({ format: 'date-time' })
    expiresAt: string;
}

export const documentSelect = {
    id: true,
    type: true,
    fileName: true,
    contentType: true,
    sizeBytes: true,
    scanStatus: true,
    version: true,
    createdAt: true,
    loadId: true,
    storageKey: true,
    uploadedBy: { select: { fullName: true } },
} as const satisfies Prisma.DocumentSelect;

export type DocumentRecord = Prisma.DocumentGetPayload<{
    select: typeof documentSelect;
}>;
