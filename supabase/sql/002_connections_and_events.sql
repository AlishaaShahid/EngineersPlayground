-- AI Tool Connection + AI Event Capture module.
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
--
-- RLS is enabled on both tables and every policy is scoped to auth.uid(),
-- so the API's session-aware client (anon key + user JWT) can only ever read
-- or write the signed-in employee's own rows. The service-role client is not
-- used for these tables.

-- ---------------------------------------------------------------------------
-- tool_connections: one row per (user, tool). MVP models a mock connection
-- state (connected / disconnected) rather than real OAuth.
-- ---------------------------------------------------------------------------
create table if not exists public.tool_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tool text not null,
  status text not null default 'connected' check (status in ('connected', 'disconnected')),
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, tool)
);

alter table public.tool_connections enable row level security;

drop policy if exists "own connections - select" on public.tool_connections;
create policy "own connections - select"
  on public.tool_connections for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "own connections - insert" on public.tool_connections;
create policy "own connections - insert"
  on public.tool_connections for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "own connections - update" on public.tool_connections;
create policy "own connections - update"
  on public.tool_connections for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ai_events: captured AI usage events. Metadata columns (category, tags,
-- skills, summary) are filled in by Claude after insert; status tracks that
-- enrichment lifecycle.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tool text not null default 'cursor',
  prompt text not null,
  category text,
  tags text[] not null default '{}',
  skills text[] not null default '{}',
  summary text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.ai_events enable row level security;

drop policy if exists "own events - select" on public.ai_events;
create policy "own events - select"
  on public.ai_events for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "own events - insert" on public.ai_events;
create policy "own events - insert"
  on public.ai_events for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "own events - update" on public.ai_events;
create policy "own events - update"
  on public.ai_events for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dashboard/list queries are "my events, newest first" — index for it.
create index if not exists ai_events_user_created_idx
  on public.ai_events (user_id, created_at desc);
