This is the web app for mama_to_kimi. Built with Next.js(App Router), TypeScript, Tailwind CSS.

## Environment Variables

Create `.env.local` at `web/` based on `.env.local.example`.

```
R2_ACCOUNT_ID=xxxx
R2_ACCESS_KEY_ID=xxxx
R2_SECRET_ACCESS_KEY=xxxx
R2_BUCKET=mama-to-kimi

UPLOAD_PIN=123456
NEXT_PUBLIC_TURNSTILE_SITE_KEY=dummy
TURNSTILE_SECRET_KEY=dummy
```

## Getting Started

First, run the development server:

```bash
cd web
pnpm install
pnpm dev
```

Note: Do NOT commit `.env.local`.

Open [http://localhost:3000](http://localhost:3000) with your browser.
Visit `/upload` to try the MVP uploader.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
