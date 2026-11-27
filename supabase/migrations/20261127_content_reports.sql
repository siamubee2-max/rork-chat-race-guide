-- H1 (red-team 2026-11-27) — NOT APPLIED. Review, then apply on the Purrly project.
--
-- Before: ModerationStore.report() only wrote an id into UserDefaults and told the user
-- "signalé à notre équipe, qui agira sous 24 h". Nothing reached anyone (Guideline 1.2
-- requires a way to report AND that the developer acts on reports within 24 h).
-- Now the app inserts here (ios-native ModerationStore -> SupabaseReportSubmitter).
--
-- Security model:
--   * authenticated users may INSERT only (no select/update/delete): reporters cannot
--     read other people's reports, nor tamper with `status`.
--   * reporter_id is forced to the caller (default auth.uid() + RLS check).
--   * one report per (reporter, content): a repeat insert fails with 23505, which the
--     client treats as success.
--   * moderators read/triage with the service role (SQL editor / dashboard).
--
-- Triage (service role):
--   select id, created_at, content_type, content_id, author_id, author_name, reason
--   from public.content_reports where status = 'open' order by created_at;
--
-- !! The "within 24 h" promise shown in the app is a PROCESS, not code. Set up an alert
-- !! (Database Webhook -> email/Slack on INSERT) and a daily check, or change the wording.

create table if not exists public.content_reports (
  id           bigint generated always as identity primary key,
  reporter_id  uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  content_type text        not null check (content_type in ('post', 'comment', 'thread', 'message', 'profile')),
  content_id   text        not null check (char_length(content_id) between 1 and 100),
  author_id    text        check (char_length(author_id) <= 100),   -- null for legacy/sample content
  author_name  text        not null default '' check (char_length(author_name) <= 200),
  reason       text        not null check (char_length(reason) between 1 and 500),
  status       text        not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at   timestamptz not null default now(),
  unique (reporter_id, content_type, content_id)
);

create index if not exists content_reports_status_created_idx
  on public.content_reports (status, created_at);

alter table public.content_reports enable row level security;

revoke all on public.content_reports from anon, authenticated;
-- Column-level INSERT: `status`, `reporter_id`, `id`, `created_at` are not user-writable.
grant insert (content_type, content_id, author_id, author_name, reason)
  on public.content_reports to authenticated;

create policy "content_reports_insert_own" on public.content_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));
