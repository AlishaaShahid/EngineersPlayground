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

## Key decisions already made (don't re-litigate)

- **Node over FastAPI for `/api`**: same language as the frontend (shared types, no context-switching), and Vercel deploys Node functions with zero config vs. extra Python runtime config for FastAPI. Only reconsider if the problem statement is clearly Python/ML-shaped.
- **One database (Supabase/Postgres), not MongoDB**: schema-flexibility needs are covered by `jsonb` columns. A second DB adds a second set of credentials/clients/failure points for a hypothetical need. Don't provision Mongo unless the actual problem statement requires a document-store feature Postgres can't do.
- **Scalability = architected-to-scale, not built-to-scale**: default to the free wins always — stateless functions, correct indexing, no N+1 queries, upserts/idempotency where natural, clean separation of concerns so pieces can scale independently later. Do NOT build actual scaling infra (queues, sharding, read replicas, custom rate limiting, caching layers like Redis) unless the problem statement explicitly calls for it — that costs real build time for zero visible payoff in a 2-hour demo.
- **Security stays a hard default regardless of timebox** — validation, no hardcoded secrets, RLS-appropriate Supabase access patterns. This is the one category from the code standards that isn't relaxed for the timebox.
- Squad is 3 engineers, all added as GitHub collaborators on this repo.
