"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import Script from 'next/script';

type UploadUrlResponse = {
  bucket: string;
  key: string;
};

export default function UploadPage() {
  const [pin, setPin] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Turnstile
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const renderTurnstile = useCallback(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && (window as any).turnstile && siteKey) {
      // @ts-ignore
      (window as any).turnstile.render('#cf-turnstile', {
        sitekey: siteKey,
        callback: (t: string) => setToken(t),
      });
    }
  }, [siteKey]);

  useEffect(() => {
    renderTurnstile();
  }, [renderTurnstile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const processImage = async (original: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(original);
    const maxSize = 2000; // 2k辺まで縮小
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(bitmap, 0, 0, width, height);
    // EXIF除去: canvas出力でメタデータは落ちる
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
    );
    if (!blob) throw new Error('Failed to export image');
    return blob;
  };

  const handleSubmit = async () => {
    try {
      setMessage("");
      if (!file) {
        setMessage('画像を選択してください');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage('10MB以下の画像を選んでください');
        return;
      }
      if (pin.length !== 6) {
        setMessage('6桁のPINを入力してください');
        return;
      }
      if (!token) {
        setMessage('Turnstile を完了してください');
        return;
      }

      const processed = await processImage(file);
      if (processed.size > 10 * 1024 * 1024) {
        setMessage('縮小後も10MBを超えました');
        return;
      }

      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin, turnstileToken: token }),
      });
      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to get upload key');
      }
      const { key } = (await urlRes.json()) as UploadUrlResponse;

      const putRes = await fetch('/api/put', {
        method: 'POST',
        headers: {
          'content-type': 'image/jpeg',
          'x-object-key': key,
          'content-length': String(processed.size),
        },
        body: processed,
      });
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to upload');
      }

      setMessage('アップロードに成功しました');
      setProgress(100);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (e: any) {
      setMessage(e?.message || 'エラーが発生しました');
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">写真アップロード</h1>

      <label className="block mb-2 text-sm font-medium">6桁のPIN</label>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        className="w-full border rounded px-3 py-2 mb-4"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
      />

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div id="cf-turnstile" className="mb-4" suppressHydrationWarning />

      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="mb-4" />
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="preview" className="mb-4 rounded" />
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded px-4 py-2"
      >
        アップロード
      </button>

      {progress > 0 && (
        <div className="mt-3 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-green-500 rounded" style={{ width: `${progress}%` }} />
        </div>
      )}

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}


