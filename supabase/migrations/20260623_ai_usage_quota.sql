-- Per-user daily quota for the OpenAI-backed Edge Functions (ai-chat, breed-scan).
-- Anti cost-explosion: 007 audit found both functions had verify_jwt=true but NO
-- per-user quota, so any authenticated (incl. anonymous) caller could spam GPT-4o.
-- Mirrors the proven kie_daily_usage design (20260620_kie_daily_usage_quota.sql),
-- generalised with a `feature` column so one table serves multiple functions.

create table if not exists public.ai_daily_usage (
  user_id    uuid not null,
  feature    text not null,                       -- e.g. 'ai-chat', 'breed-scan'
  usage_date date not null default current_date,
  count      int  not null default 0,
  primary key (user_id, feature, usage_date)
);

-- Lock down: only the SECURITY DEFINER function / service role may touch it.
alter table public.ai_daily_usage enable row level security;

-- Atomic check-and-increment for a given (user, feature). Allows exactly p_limit
-- calls per day. Returns true if permitted (and counts it), false if over quota.
create or replace function public.check_and_increment_ai_usage(
  p_user_id uuid,
  p_feature text,
  p_limit   int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.ai_daily_usage (user_id, feature, usage_date, count)
  values (p_user_id, p_feature, current_date, 1)
  on conflict (user_id, feature, usage_date)
  do update set count = public.ai_daily_usage.count + 1
  where public.ai_daily_usage.count < p_limit
  returning count into v_count;

  -- No row returned => WHERE guard blocked it (already at limit).
  return v_count is not null;
end;
$$;

revoke all on function public.check_and_increment_ai_usage(uuid, text, int)
  from public, anon, authenticated;
