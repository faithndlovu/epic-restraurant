# Epic Restaurant

A TanStack Start (React 19 + Vite) website with a Supabase backend.

This project was originally scaffolded on Lovable. All Lovable-specific code,
dependencies, and hosting glue have been removed — it now runs on a standard,
self-contained TanStack Start + Vite toolchain.

## Requirements

- Node.js 20.19+ (or 22+)
- A Supabase project

## Setup

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
```

See `.env.example` for the required variables. The `VITE_*` keys are inlined
into the browser bundle at build time; the non-prefixed keys are used by SSR and
server functions. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be
exposed to the client.

## Develop

```bash
npm run dev          # http://localhost:3000
```

## Production

```bash
npm run build        # outputs dist/client (static) + dist/server (SSR handler)
npm run start        # serves the build on http://localhost:3000 (any Node host)
```

`npm run start` runs `server/prod.mjs`, a small portable server that serves the
static assets and pipes everything else through the SSR handler. It works on any
Node host (Render, Railway, Fly.io, a VPS, etc.).

## Deploy to Vercel

`vercel.json` and `api/index.mjs` are already configured:

- `npm run build` produces the static client (`dist/client`) and the SSR bundle.
- `api/index.mjs` is a serverless function that runs the SSR handler.
- Static files are served directly; all other routes are rewritten to the function.

Set the environment variables from `.env.example` in your Vercel project settings
(Project → Settings → Environment Variables), then deploy. The `VITE_*` variables
must be present at **build** time.

## Things you still need to do

1. **Apply the menu-image migration.** The site images now live in
   `public/images/` and are wired into the homepage, About, Gallery, etc. via
   `src/assets/images.ts`. The public **Menu** page (`/menu`), however, reads
   images from the `menu_items` table in Supabase, which still holds the old
   Lovable CDN URLs. Run the new migration
   `supabase/migrations/20260624190000_update_menu_images.sql` against your
   database (e.g. `supabase db push`, or paste it into the Supabase SQL editor)
   to point those rows at the local images. You can also edit images per-dish in
   the admin panel (`/admin/menu`).
2. **Google sign-in.** The "Continue with Google" button now uses native Supabase
   OAuth. Enable the Google provider in your Supabase dashboard
   (Authentication → Providers → Google) and add your site URL to the allowed
   redirect URLs, or remove the button from `src/routes/auth.tsx`.
