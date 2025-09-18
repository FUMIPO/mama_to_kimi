import { NextRequest, NextResponse } from 'next/server';
import { getBucketName } from '@/lib/r2';
import { randomUUID } from 'crypto';

export const runtime = 'edge';

type TurnstileVerifyResponse = {
  success: boolean;
};

function isValidPin(pin: string | null): boolean {
  if (!pin) return false;
  const expected = process.env.UPLOAD_PIN;
  return pin === expected;
}

async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as TurnstileVerifyResponse;
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = body?.pin as string | null;
  const turnstileToken = body?.turnstileToken as string | null;

  if (!isValidPin(pin)) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }
  const ok = await verifyTurnstile(turnstileToken);
  if (!ok) {
    return NextResponse.json({ error: 'Turnstile verification failed' }, { status: 401 });
  }

  const bucket = getBucketName();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const folder = `${yyyy}/${mm}/${dd}`;
  const key = `${folder}/${randomUUID()}.jpg`;

  return NextResponse.json({ bucket, key });
}


