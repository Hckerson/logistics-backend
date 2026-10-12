import { ConfigService } from '@nestjs/config';
import { SECOND_MS } from '@common/enums/time';
import { SIGNATURE_BYTES } from '@lib/file-signature';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
    DEFAULT_STORAGE_REGION,
    DOCUMENT_MESSAGES,
    SIGNED_URL_TTL_SECONDS,
} from '@common/enums/documents';
import {
    GetObjectCommand,
    HeadObjectCommand,
    NotFound,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

interface Storage {
    client: S3Client;
    bucket: string;
}

@Injectable()
export class StorageService {
    private readonly storage: Storage | null;

    constructor(config: ConfigService) {
        const bucket = config.get<string>('STORAGE_BUCKET');
        const endpoint = config.get<string>('STORAGE_ENDPOINT');
        const accessKeyId = config.get<string>('STORAGE_ACCESS_KEY_ID');
        const secretAccessKey = config.get<string>('STORAGE_SECRET_ACCESS_KEY');

        this.storage = bucket
            ? {
                  bucket,
                  client: new S3Client({
                      region:
                          config.get<string>('STORAGE_REGION') ??
                          DEFAULT_STORAGE_REGION,
                      endpoint,
                      forcePathStyle: Boolean(endpoint),
                      credentials:
                          accessKeyId && secretAccessKey
                              ? { accessKeyId, secretAccessKey }
                              : undefined,
                  }),
              }
            : null;
    }

    expiresAt(): Date {
        return new Date(Date.now() + SIGNED_URL_TTL_SECONDS * SECOND_MS);
    }

    uploadUrl(
        key: string,
        contentType: string,
        sizeBytes: number,
    ): Promise<string> {
        const { client, bucket } = this.ready();

        return getSignedUrl(
            client,
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: contentType,
                ContentLength: sizeBytes,
            }),
            { expiresIn: SIGNED_URL_TTL_SECONDS },
        );
    }

    downloadUrl(key: string, fileName: string): Promise<string> {
        const { client, bucket } = this.ready();

        return getSignedUrl(
            client,
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
            }),
            { expiresIn: SIGNED_URL_TTL_SECONDS },
        );
    }

    async inspect(key: string) {
        const { client, bucket } = this.ready();

        try {
            const head = await client.send(
                new HeadObjectCommand({ Bucket: bucket, Key: key }),
            );
            const start = await client.send(
                new GetObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Range: `bytes=0-${SIGNATURE_BYTES - 1}`,
                }),
            );

            return {
                sizeBytes: head.ContentLength ?? 0,
                leading:
                    (await start.Body?.transformToByteArray()) ??
                    new Uint8Array(),
            };
        } catch (error) {
            if (error instanceof NotFound) return null;
            throw error;
        }
    }

    private ready(): Storage {
        if (!this.storage) {
            throw new ServiceUnavailableException(DOCUMENT_MESSAGES.storageOff);
        }
        return this.storage;
    }
}
