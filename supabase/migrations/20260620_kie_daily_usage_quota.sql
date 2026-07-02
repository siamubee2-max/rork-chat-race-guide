-- Per-user daily quota for KIE Photo Booth generations (anti cost-explosion).
-- Applied to project wifievmrlovkjlbnjgwr on 2026-06-20.
create table if not exists public.kie_daily_usage (
  user_id    uuid not null,
  usage_date date not null default current_date,
  count      int  not null default 0,
  primary key (user_id, usage_date)
);

-- Lock the table down: only the SECURITY DEFINER function / service role may touch it.
alter table public.kie_daily_usage enable row level security;

-- Atomic check-and-increment. Allows exactly p_limit generations per day.
-- Returns true if the call is permitted (and counts it), false if over quota.
create or replace function public.check_and_increment_kie_usage(p_user_id uuid, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.kie_daily_usage (user_id, usage_date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set count = public.kie_daily_usage.count + 1
  where public.kie_daily_usage.count < p_limit
  returning count into v_count;

  -- No row returned => conflict hit the WHERE guard (already at limit) => blocked.
  return v_count is not null;
end;
$$;

revoke all on function public.check_and_increment_kie_usage(uuid, int) from public, anon, authenticated;
