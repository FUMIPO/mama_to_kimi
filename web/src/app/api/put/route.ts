import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getBucketName, getR2Client } from '@/lib/r2';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const bucket = getBucketName();
    const key = req.headers.get('x-object-key');
    if (!key) {
      return NextResponse.json({ error: 'Missing x-object-key' }, { status: 400 });
    }

    const contentLength = req.headers.get('content-length');
    if (!contentLength) {
      return NextResponse.json({ error: 'Missing content length' }, { status: 411 });
    }
    const size = Number(contentLength);
    if (!Number.isFinite(size) || size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    const client = getR2Client();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await client.send(cmd);

    return NextResponse.json({ ok: true, key });
  } catch (e: any) {
    console.error('PUT /api/put error', e);
    return NextResponse.json({ error: 'Internal error', message: e?.message }, { status: 500 });
  }
}


