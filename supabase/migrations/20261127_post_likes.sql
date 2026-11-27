-- H5 (red-team 2026-11-27) — NOT APPLIED. Review, then apply on the Purrly project.
--
-- Before: the client rewrote an ABSOLUTE `likes` counter on `community_posts`
-- (lost updates under concurrency) and `isLiked` was never persisted, so each
-- relaunch let the same user inflate the count again (+1 per launch).
-- Now: one row per (post, user) — a like is idempotent by construction.
--
-- Security model:
--   * authenticated users see all likes (public counts) but may only
--     insert/delete THEIR OWN row (user_id forced to auth.uid()).
--   * the counter on community_posts.likes is maintained by trigger, never
--     written directly by clients.
--   * anon has no access at all.
--
-- Note: community_posts may be absent, RLS-on-no-policy, or open in the live
-- project (see report C3). This migration only ADDS the likes table; it does
-- not depend on community_posts' own RLS state. If `community_posts` does not
-- exist yet, the trigger creation below must be re-run after it does (kept
-- idempotent with `drop trigger if exists` + `create trigger`).

create table if not exists public.community_post_likes (
  post_id    text        not null,
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_post_likes enable row level security;

revoke all on public.community_post_likes from anon, authenticated;

grant select on public.community_post_likes to authenticated;
grant insert (post_id, user_id) on public.community_post_likes to authenticated;
grant delete on public.community_post_likes to authenticated;

create policy "community_post_likes_select_all" on public.community_post_likes
  for select to authenticated using (true);

create policy "community_post_likes_insert_own" on public.community_post_likes
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "community_post_likes_delete_own" on public.community_post_likes
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Counter maintenance: community_posts.likes always equals the number of
-- like rows. Clients never write the counter (fixes lost updates).
create or replace function public.sync_community_post_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
       set likes = (select count(*) from public.community_post_likes where post_id = NEW.post_id)
     where id = NEW.post_id;
    return NEW;
  elsif tg_op = 'DELETE' then
    update public.community_posts
       set likes = (select count(*) from public.community_post_likes where post_id = OLD.post_id)
     where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

revoke all on function public.sync_community_post_likes_count() from public, anon, authenticated;

drop trigger if exists community_post_likes_count_trigger on public.community_post_likes;
create trigger community_post_likes_count_trigger
  after insert or delete on public.community_post_likes
  for each row execute function public.sync_community_post_likes_count();

-- Backfill (idempotent): rebuild counters from existing rows, if any.
-- Conditionnel : community_posts peut être absente du projet partagé (report C3) ;
-- dans ce cas le trigger ci-dessus est à rejouer après sa création.
do $$
begin
  if to_regclass('public.community_posts') is not null then
    update public.community_posts p
       set likes = (select count(*) from public.community_post_likes l where l.post_id = p.id)
     where exists (select 1 from public.community_post_likes l where l.post_id = p.id);
  end if;
end $$;
