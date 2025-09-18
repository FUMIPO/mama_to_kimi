import { S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials or account id in environment variables');
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

export function getBucketName(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error('Missing R2_BUCKET');
  return bucket;
}


