# Engineers' Playground

Squad project for the 2-hour Engineers' Playground vibe-coding build sprint.

## Stack

- **Frontend:** React + TypeScript + Vite (`src/`)
- **Backend:** Vercel serverless functions, Node/TypeScript (`api/`)
- **Database/Auth:** Supabase

## Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase values, see below
npm run dev
```

`npm run dev` serves the frontend only. To also run the `/api` functions locally, use the Vercel CLI instead:

```bash
npm i -g vercel
vercel dev
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to find it | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | frontend |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key | frontend |
| `SUPABASE_URL` | same Project URL | backend (`/api`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (secret!) | backend (`/api`) only |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend or prefix it with `VITE_`.

The same variables need to be added in **Vercel → Project → Settings → Environment Variables** for deployed builds.

## Deploy

Connected to Vercel — push to `main` to deploy. Vercel auto-detects the Vite frontend and the `/api` folder as serverless functions.
