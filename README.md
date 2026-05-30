This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. **Root Directory** — leave empty (`.`). The repo root already contains `package.json`. Do **not** set `Brandcure-landing-page` unless that folder exists in GitHub.
2. **Environment variables** — copy from `.env.example`. Required for production:
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com` (include `https://`)
   - Sanity, Supabase, `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY` as needed
3. **Redeploy** after changing env vars.

If the browser shows `(index):1` 404, the deployment root is usually wrong or the domain is not assigned to this project yet. Open the `*.vercel.app` URL from the Vercel dashboard first.

`/favicon.ico` is served from `public/favicon.ico`.
