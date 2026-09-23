# Epic Restaurant

A TanStack Start (React 19 + Vite) website with a Supabase backend.

It runs on a standard, self-contained TanStack Start + Vite toolchain.

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

These are the steps that live outside the codebase. Until they are done the site
builds and deploys, but parts of it will not work for a visitor.

1. **Apply the outstanding migrations.** Two migrations in
   `supabase/migrations/` are not in the hosted database yet. Run them with
   `supabase db push`, or paste each file into the Supabase SQL editor:
   - `20260921120000_bootstrap_admins.sql` — the allowlist that makes the first
     admin account possible.
   - `20260923120000_contact_and_newsletter.sql` — the `contact_messages` and
     `newsletter_subscribers` tables. **The contact form and the newsletter
     signup both fail until this one is applied.**

2. **Name the first admin.** `grant_admin()` refuses anyone who is not already
   an admin, so the first one is seeded by hand. In the SQL editor:

   ```sql
   insert into public.bootstrap_admins (email) values ('owner@example.com');
   select public.sync_bootstrap_admins();   -- if that account already signed up
   ```

3. **Use the right site URL everywhere.** This project is deployed at
   `https://epic-restraurant.vercel.app` — note the spelling. The correctly
   spelled `epic-restaurant.vercel.app` belongs to an unrelated project, so
   pointing auth at it sends users to somebody else's website. The misspelled
   host is what belongs in Supabase → Authentication → URL Configuration, both
   as the Site URL and in the redirect allowlist
   (`https://epic-restraurant.vercel.app/auth/callback`).

4. **Google sign-in.** The "Continue with Google" button uses native Supabase
   OAuth and currently fails with `provider is not enabled`. Create a Web
   application OAuth client in the Google Cloud console with
   `https://isawexccruqpiecjmrgs.supabase.co/auth/v1/callback` as the authorized
   redirect URI, then enable Google under Authentication → Providers in Supabase
   and paste in the client ID and secret. Otherwise remove the button from
   `src/routes/auth.tsx`.

5. **Email delivery.** Reservation and contact emails go through Resend and are
   best-effort: a booking or message is always stored first, so a failed send
   never loses it. To make sends actually land, verify a domain in Resend and set
   `EMAIL_FROM` to an address on it. The default sender
   (`onboarding@resend.dev`) only delivers to the Resend account owner, so every
   other guest gets a 403. `RESTAURANT_EMAIL` is where staff notifications go; if
   it is unset, no staff email is sent at all.

6. **Set the environment variables in Vercel**, not just in your local `.env`
   (Project → Settings → Environment Variables). The `VITE_*` keys must be
   present at **build** time.

7. **Confirm the business details with the restaurant.** The site's address,
   phone, hours, Instagram and Facebook links were taken from Epic's own public
   channels and cross-checked, but only the owner can confirm them:

   | Detail | Value on the site | Source |
   | --- | --- | --- |
   | Address | 12th Avenue & Jason Moyo, Bulawayo | Their own Facebook posts |
   | Phone | +263 78 946 1108 | Public listings |
   | Hours | 8AM – 10PM, daily | Their own channels |
   | Instagram | [@epic.11.2022](https://www.instagram.com/epic.11.2022/) | Verified |
   | Facebook | [Epic Restaurant Bulawayo](https://www.facebook.com/p/Epic-Restaurant-Bulawayo-100086311914355/) | Verified, ~13.8k followers |
   | Email | epicrestaurant22@gmail.com | **Unverified** — came with the original build |

   Two things worth raising with them: `epicrestaurant.co.zw` shows up in search
   results as their website but the domain does not currently resolve, and a
   "Best Restaurant in Bulawayo / Bulawayo Business Awards" claim circulates on
   aggregator sites that appear to be auto-generated, so it is **not** used
   anywhere on this site. Ask before adding it.

   The fabricated content that used to be here is gone: the homepage stat strip
   ("60+ Signature Dishes", "10k+ Plates Served", "4.6 Guest Rating") now carries
   only checkable facts, the three invented guest testimonials were replaced with
   what the restaurant says about itself plus a link to its real Facebook
   reviews, the unsourced head-chef quote on the About page was removed, and the
   invented `aggregateRating` is out of the JSON-LD in
   `src/lib/structured-data.ts`.
