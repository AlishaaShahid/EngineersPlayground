# AI-Hub

Squad project for the 1.5-hour Engineers' Playground vibe-coding build sprint — Challenge #6: Enterprise AI Intelligence Platform.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui (`app/`, `components/`)
- **Backend:** Next.js Route Handlers, Node/TypeScript (`app/api/`)
- **Database/Auth:** Supabase (Postgres + pgvector for embeddings)
- **LLM:** Anthropic Claude API
- **Charts:** Recharts

## Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase + Anthropic values, see below
npm run dev
```

`npm run dev` serves both the frontend and the `app/api` routes together (Next.js handles both).

If your AI coding assistant doesn't pick up the Supabase skill (`.claude/skills` is gitignored — it's a machine-specific symlink), regenerate it locally:

```bash
npx skills add supabase/agent-skills
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Where to find it | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | frontend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key | frontend |
| `SUPABASE_URL` | same Project URL | backend (`app/api`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key (secret!) | backend (`app/api`) only |
| `ANTHROPIC_API_KEY` | Anthropic Console | backend (`app/api`) only |
| `GROK_API_KEY` | xAI Console | backend (`app/api`) only, fallback LLM if needed |

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, or `GROK_API_KEY` to the frontend or prefix them with `NEXT_PUBLIC_`. Call LLM/service-role Supabase code only from `app/api` routes — `lib/supabase/admin.ts` is guarded with the `server-only` package so importing it from a Client Component fails the build.

The same variables need to be added in **Vercel → Project → Settings → Environment Variables** for deployed builds.

## Deploy

Connected to Vercel — push to `main` to deploy. Vercel auto-detects the Next.js app.
