import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    this.bucket    = config.get<string>('R2_BUCKET_NAME', 'smissi-uploads');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL', '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.get<string>('R2_ACCOUNT_ID', '')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     config.get<string>('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * Upload a buffer to R2.
   * @param buffer   File content
   * @param key      Object key, e.g. "payslips/2026-04/payslip-uuid.pdf"
   * @param mimeType e.g. "application/pdf" | "image/jpeg"
   * @returns        Public URL of the uploaded file
   */
  async upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket:      this.bucket,
        Key:         key,
        Body:        buffer,
        ContentType: mimeType,
      },
    });

    await upload.done();
    this.logger.debug(`Uploaded: ${key}`);

    return this.publicUrl ? `${this.publicUrl}/${key}` : key;
  }

  /**
   * Generate a time-limited pre-signed download URL (for private objects).
   */
  async getPresignedUrl(key: string, expiresInSecs = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSecs });
  }

  /**
   * Delete an object from R2.
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    this.logger.debug(`Deleted: ${key}`);
  }

  /** Extract the R2 key from a full public URL. */
  keyFromUrl(url: string): string {
    return this.publicUrl ? url.replace(`${this.publicUrl}/`, '') : url;
  }
}
