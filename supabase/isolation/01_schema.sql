-- ============================================================================
-- Purrly — isolated-project schema bundle
-- Apply ONCE to a FRESH Supabase project dedicated to Purrly (NOT the shared one).
-- Rebuilds every Purrly DB object, hardened per the 007 audit (2026-06-23):
--   • profiles: subscription_tier/expiry are SERVICE-ROLE-ONLY (users can't self-grant)
--   • handle_new_user: SECURITY DEFINER WITH fixed search_path
--   • kie_daily_usage + ai_daily_usage quota tables/RPCs (RLS-locked)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  name                text not null default '',
  subscription_tier   text not null default 'free',
  subscription_expiry timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read / insert own row.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
-- Update own row — but billing columns are NOT grantable to users (see grants).
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Column-level privileges: users may edit `name` only.
-- subscription_tier / subscription_expiry are writable ONLY by the service role
-- (RevenueCat webhook), which bypasses RLS. This is the audit's core fix.
-- NOTE (red-team 2026-11-27): revoking only UPDATE left the default table-level INSERT
-- grant in place, so users could INSERT billing columns on their own row. Revoke INSERT
-- too, and strip anon entirely (it is blocked only by RLS otherwise).
revoke all    on public.profiles from anon;
revoke update on public.profiles from authenticated;
revoke insert on public.profiles from authenticated;
grant  select on public.profiles to authenticated;
grant  insert (id, email, name) on public.profiles to authenticated;
grant  update (name) on public.profiles to authenticated;

-- Auto-create a profile row when an auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- kie_daily_usage  (Photo Booth quota — mirrors shared-project migration)
-- ---------------------------------------------------------------------------
create table if not exists public.kie_daily_usage (
  user_id    uuid not null,
  usage_date date not null default current_date,
  count      int  not null default 0,
  primary key (user_id, usage_date)
);
alter table public.kie_daily_usage enable row level security;

create or replace function public.check_and_increment_kie_usage(p_user_id uuid, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  insert into public.kie_daily_usage (user_id, usage_date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set count = public.kie_daily_usage.count + 1
  where public.kie_daily_usage.count < p_limit
  returning count into v_count;
  return v_count is not null;
end;
$$;
revoke all on function public.check_and_increment_kie_usage(uuid, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- ai_daily_usage  (ai-chat / breed-scan quota)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_daily_usage (
  user_id    uuid not null,
  feature    text not null,
  usage_date date not null default current_date,
  count      int  not null default 0,
  primary key (user_id, feature, usage_date)
);
alter table public.ai_daily_usage enable row level security;

create or replace function public.check_and_increment_ai_usage(p_user_id uuid, p_feature text, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  insert into public.ai_daily_usage (user_id, feature, usage_date, count)
  values (p_user_id, p_feature, current_date, 1)
  on conflict (user_id, feature, usage_date)
  do update set count = public.ai_daily_usage.count + 1
  where public.ai_daily_usage.count < p_limit
  returning count into v_count;
  return v_count is not null;
end;
$$;
revoke all on function public.check_and_increment_ai_usage(uuid, text, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- content_reports  (signalements UGC — Guideline 1.2 ; voir
-- migrations/20261127_content_reports.sql pour le détail du modèle de sécurité)
-- ---------------------------------------------------------------------------
create table if not exists public.content_reports (
  id           bigint generated always as identity primary key,
  reporter_id  uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  content_type text        not null check (content_type in ('post', 'comment', 'thread', 'message', 'profile')),
  content_id   text        not null check (char_length(content_id) between 1 and 100),
  author_id    text        check (char_length(author_id) <= 100),
  author_name  text        not null default '' check (char_length(author_name) <= 200),
  reason       text        not null check (char_length(reason) between 1 and 500),
  status       text        not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at   timestamptz not null default now(),
  unique (reporter_id, content_type, content_id)
);
create index if not exists content_reports_status_created_idx on public.content_reports (status, created_at);
alter table public.content_reports enable row level security;
revoke all on public.content_reports from anon, authenticated;
grant insert (content_type, content_id, author_id, author_name, reason) on public.content_reports to authenticated;
create policy "content_reports_insert_own" on public.content_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
