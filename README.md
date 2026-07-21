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

If your AI coding assistant doesn't pick up the Supabase skill (`.claude/skills` is gitignored — it's a machine-specific symlink), regenerate it locally:

```bash
npx skills add supabase/agent-skills
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to find it | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | frontend |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key | frontend |
| `SUPABASE_URL` | same Project URL | backend (`/api`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (secret!) | backend (`/api`) only |
| `ANTHROPIC_API_KEY` | Anthropic Console | backend (`/api`) only, if the solution needs Claude |
| `GROK_API_KEY` | xAI Console | backend (`/api`) only, fallback LLM if needed |

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, or `GROK_API_KEY` to the frontend or prefix them with `VITE_` — call LLM APIs from an `/api` route, never directly from browser code.

The same variables need to be added in **Vercel → Project → Settings → Environment Variables** for deployed builds.

## Deploy

Connected to Vercel — push to `main` to deploy. Vercel auto-detects the Vite frontend and the `/api` folder as serverless functions.
