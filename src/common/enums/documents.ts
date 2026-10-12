export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

export const DOCUMENT_NAME_MAX = 255;

export const DOCUMENT_CONTENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
] as const;

export const SIGNED_URL_TTL_SECONDS = 300;

export const DEFAULT_STORAGE_REGION = 'us-east-1';

export const DOCUMENT_KEY_PREFIX = 'loads';

export const DOCUMENT_MESSAGES = {
    notFound: 'Document not found',
    notUploaded: 'The file has not reached storage yet',
    mismatch: 'The stored file does not match what was declared',
    notReady: 'The document is still being checked',
    storageOff: 'Document storage is not configured',
    wrongType: 'The file content is not the declared type',
} as const;
