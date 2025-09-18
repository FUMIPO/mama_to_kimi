export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <main className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">mama_to_kimi</h1>
        <p className="mb-6">写真アップローダーへ移動してください。</p>
        <a
          href="/upload"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded font-medium hover:bg-blue-700"
        >
          /upload へ
        </a>
      </main>
    </div>
  );
}
