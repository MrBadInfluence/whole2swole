-- ==========================================================
-- whole2swole personal tracker (1 row per workout) — CRU ONLY
-- - Uses Supabase Auth (authenticated role)
-- - Disable signups so ONLY you can log in
-- - Allow 4-digit PIN by setting min password length to 4 in Auth settings
-- ==========================================================

create extension if not exists pgcrypto;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- optional: hard-block deletes at DB level
create or replace function public.block_deletes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Deletes are not allowed in this app.';
end;
$$;

-- Tables
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  duration integer,
  notes text,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.body_stats (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  weight numeric,
  body_fat numeric,
  measurements jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure jsonb columns exist (safe re-run)
alter table public.workouts
  add column if not exists exercises jsonb not null default '[]'::jsonb;

alter table public.body_stats
  add column if not exists measurements jsonb not null default '{}'::jsonb;

-- Triggers for updated_at
drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

drop trigger if exists body_stats_set_updated_at on public.body_stats;
create trigger body_stats_set_updated_at
before update on public.body_stats
for each row execute function public.set_updated_at();

-- DB-level delete block (optional but recommended)
drop trigger if exists workouts_block_delete on public.workouts;
create trigger workouts_block_delete
before delete on public.workouts
for each row execute function public.block_deletes();

drop trigger if exists body_stats_block_delete on public.body_stats;
create trigger body_stats_block_delete
before delete on public.body_stats
for each row execute function public.block_deletes();

-- RLS ON
alter table public.workouts enable row level security;
alter table public.body_stats enable row level security;

-- Policies: allow CRU for authenticated users.
-- IMPORTANT: disable signups so you are the only authenticated user.
drop policy if exists "workouts_cru" on public.workouts;
create policy "workouts_cru"
on public.workouts
for select
to authenticated
using (true);

drop policy if exists "workouts_create" on public.workouts;
create policy "workouts_create"
on public.workouts
for insert
to authenticated
with check (true);

drop policy if exists "workouts_update" on public.workouts;
create policy "workouts_update"
on public.workouts
for update
to authenticated
using (true)
with check (true);

-- No DELETE policy => deletes blocked (plus we added a delete-block trigger)

drop policy if exists "body_stats_read" on public.body_stats;
create policy "body_stats_read"
on public.body_stats
for select
to authenticated
using (true);

drop policy if exists "body_stats_create" on public.body_stats;
create policy "body_stats_create"
on public.body_stats
for insert
to authenticated
with check (true);

drop policy if exists "body_stats_update" on public.body_stats;
create policy "body_stats_update"
on public.body_stats
for update
to authenticated
using (true)
with check (true);

-- No DELETE policy => deletes blocked (plus delete-block trigger)
