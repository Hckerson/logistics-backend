import { DOCUMENT_KEY_PREFIX } from '@common/enums/documents';
import {
    DocumentType,
    Prisma,
    ScanStatus,
} from '../../generated/prisma/client';
import { dateAgo } from './clock';
import { SEED_USERS, type UserKey } from './users';

interface DocumentSeed {
    load: string;
    type: DocumentType;
    fileName: string;
    sizeBytes: number;
    scanStatus: ScanStatus;
    by: UserKey;
    ageHours: number;
}

const PDF_BYTES = 184_000;
const DANA = 'usr_dispatch';
const RAY = 'usr_carrier';
const ANA = 'usr_driver';

const pdf = (
    load: string,
    type: DocumentType,
    fileName: string,
    by: UserKey,
    ageHours: number,
    sizeBytes = PDF_BYTES,
): DocumentSeed => ({
    load,
    type,
    fileName,
    sizeBytes,
    scanStatus: ScanStatus.clean,
    by,
    ageHours,
});

const rateConfirmation = (load: string, by: UserKey, ageHours: number) =>
    pdf(
        load,
        DocumentType.rateConfirmation,
        `rate-confirmation-${load}.pdf`,
        by,
        ageHours,
    );

export const DOCUMENTS: readonly DocumentSeed[] = [
    rateConfirmation('HL-7K2M9QXA', RAY, 40),
    pdf('HL-7K2M9QXA', DocumentType.bol, 'bol-55120.pdf', ANA, 9.5),
    rateConfirmation('HL-3RW8TNPE', RAY, 26),
    rateConfirmation('HL-9DQ4ZB2M', DANA, 30),
    rateConfirmation('HL-2PV7MW4R', RAY, 30),
    pdf('HL-2PV7MW4R', DocumentType.bol, 'bol-55188.pdf', ANA, 8),
    {
        load: 'HL-2PV7MW4R',
        type: DocumentType.lumperReceipt,
        fileName: 'lumper-receipt.jpg',
        sizeBytes: 912_000,
        scanStatus: ScanStatus.pending,
        by: ANA,
        ageHours: 0.2,
    },
    {
        load: 'HL-2PV7MW4R',
        type: DocumentType.damagePhoto,
        fileName: 'pallet-corner.png',
        sizeBytes: 2_400_000,
        scanStatus: ScanStatus.rejected,
        by: ANA,
        ageHours: 0.3,
    },
    rateConfirmation('HL-4MC9RD7K', RAY, 30),
    pdf('HL-4MC9RD7K', DocumentType.bol, 'bol-chicago.pdf', ANA, 9.4),
    rateConfirmation('HL-6NX2HV9T', DANA, 16),
    rateConfirmation('HL-2GL4YN7S', RAY, 70),
    pdf('HL-2GL4YN7S', DocumentType.bol, 'bol-55102.pdf', ANA, 50),
    pdf('HL-2GL4YN7S', DocumentType.pod, 'pod-nashville.pdf', ANA, 44, 642_000),
    rateConfirmation('HL-5RT8VK3M', RAY, 236),
    pdf('HL-5RT8VK3M', DocumentType.pod, 'pod-chicago.pdf', ANA, 216, 598_000),
    pdf(
        'HL-5RT8VK3M',
        DocumentType.invoice,
        'invoice-INV-7H3K2M.pdf',
        DANA,
        200,
        96_000,
    ),
];

const contentTypeOf = (fileName: string) =>
    fileName.endsWith('.pdf')
        ? 'application/pdf'
        : fileName.endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';

export const documentInput = (
    document: DocumentSeed,
    index: number,
    now: number,
) =>
    ({
        loadId: document.load,
        type: document.type,
        fileName: document.fileName,
        contentType: contentTypeOf(document.fileName),
        sizeBytes: document.sizeBytes,
        scanStatus: document.scanStatus,
        storageKey: `${DOCUMENT_KEY_PREFIX}/${document.load}/seed-${index + 1}`,
        uploadedById: SEED_USERS[document.by].id,
        createdAt: dateAgo(now, document.ageHours),
    }) satisfies Prisma.DocumentCreateManyInput;
