-- H3 (red-team 2026-11-27) — NOT APPLIED. Review, then apply on the Purrly project.
--
-- Before: `CommunityStore.addComment` and `sendMessage` only mutated local
-- state (`@State` in the view for DMs) — a comment was never visible to anyone
-- else and a DM vanished on dismiss while the UI implied delivery.
-- Now: real tables with per-user RLS; the app inserts rows and reads them back.
--
-- Security model:
--   * comments are public to authenticated users (they attach to public posts)
--     but only their author may insert/delete them.
--   * DMs are visible ONLY to sender and recipient (both matched on auth.uid()).
--   * anon has no access at all.
--
-- Same caveat as 20261127_post_likes.sql: `community_posts` may be absent in
-- the live shared project (report C3); nothing here depends on it.

create table if not exists public.community_comments (
  id         text        not null primary key,
  post_id    text        not null,
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text       not null default '' check (char_length(author_name) <= 200),
  content    text        not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists community_comments_post_idx
  on public.community_comments (post_id, created_at);

alter table public.community_comments enable row level security;

revoke all on public.community_comments from anon, authenticated;
grant select on public.community_comments to authenticated;
grant insert (id, post_id, author_name, content) on public.community_comments to authenticated;
grant delete on public.community_comments to authenticated;

create policy "community_comments_select_all" on public.community_comments
  for select to authenticated using (true);

create policy "community_comments_insert_own" on public.community_comments
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "community_comments_delete_own" on public.community_comments
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Direct messages: visible only to sender and recipient.
create table if not exists public.community_messages (
  id           text        not null primary key,
  sender_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid        not null references auth.users(id) on delete cascade,
  sender_name  text        not null default '' check (char_length(sender_name) <= 200),
  content      text        not null check (char_length(content) between 1 and 2000),
  created_at   timestamptz not null default now()
);

create index if not exists community_messages_pair_idx
  on public.community_messages (sender_id, recipient_id, created_at);

alter table public.community_messages enable row level security;

revoke all on public.community_messages from anon, authenticated;
grant select on public.community_messages to authenticated;
grant insert (id, recipient_id, sender_name, content) on public.community_messages to authenticated;

create policy "community_messages_select_own" on public.community_messages
  for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));

create policy "community_messages_insert_own" on public.community_messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()));
