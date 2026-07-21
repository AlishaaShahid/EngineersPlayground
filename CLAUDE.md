# CLAUDE.md

Project context for AI coding assistants working in this repo during the Engineers' Playground 2-hour build sprint.

## Stack

- Frontend: React + TypeScript + Vite (`src/`)
- Backend: Vercel serverless functions, Node/TypeScript (`api/`)
- DB/Auth: Supabase
- Deploy: Vercel (Hobby plan) — auto-deploys on push to `main`

## Code standards (apply by default)

Write production-grade code: clean, modular, testable, SOLID/DRY/KISS/YAGNI. Handle errors explicitly (invalid input, network/DB/API failures, timeouts) with meaningful messages — never fail silently. Validate/sanitize all external input; guard against injection/XSS/CSRF/SSRF; never hardcode secrets. Keep logs structured and free of sensitive data. Full standard: see `PROMPTS.md` (Prompt #1).

**Exception for this event:** it's a hard 2-hour timebox. Keep the quality/security bar above, but do not build for scale this prototype will never see — no queues, no distributed systems, no horizontal-scaling infra. Working end-to-end beats gold-plated.

## Env vars

- `VITE_`-prefixed vars are bundled into the browser JS — frontend-safe values only (Supabase URL + anon key).
- Everything else (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `GROK_API_KEY`) is backend-only — call from `/api` routes only, never from `src/`.
- Real values live in local `.env` (gitignored) and in Vercel's dashboard env settings. `.env.example` documents the shape.

## Prompts log

Log key prompts used during the build in `PROMPTS.md` — it's a required deliverable for the judge presentation ("AI/vibe-coding approach & key prompts").
