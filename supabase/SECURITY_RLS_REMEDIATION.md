# RLS Remediation — shared Supabase project `wifievmrlovkjlbnjgwr`

**Source:** 007 audit, 2026-06-23. **Status:** NOT applied — requires per-table review.

## ⚠️ Why this is not a ready-to-run migration

This Supabase project is **shared across several unrelated apps** (Purrly, and what
look like MonAdmin, L'Écrin/jewelry, and a CRM). `get_advisors` flagged:

- **RLS DISABLED** (anon key can read/write every row) on:
  `user_profiles, documents, prospects, conversation_history, memory_states,
  action_triggers, analytics_events, content_library, transactions`
- **Permissive `using(true)` policies** (RLS on but wide open) on:
  `body_parts, clothing_items, creations, family_members, history_actions,
  jewelry_items, monadmin_documents, orders, settings, shared_documents`
- 3 `SECURITY DEFINER` views, several `search_path`-mutable functions, anon-EXECUTE
  on `handle_new_user`, and Auth leaked-password protection disabled.

**Danger:** running `alter table … enable row level security` on a table that has
**no policy** denies ALL access through the anon/auth API → it will **break whichever
app currently reads that table**. So each table must get correct owner-scoped policies
*in the same migration* that enables RLS, and must be validated against that app's real
ownership column. Blind enabling = outage for the other apps.

## Recommended fix (strongest): isolate Purrly

The cleanest remediation is to **move Purrly into its own Supabase project**. Purrly's
own tables (`profiles`, `kie_daily_usage`, `ai_daily_usage`) are already locked down;
the exposure is entirely from co-tenant tables it shouldn't share a key with. A
dedicated project removes the cross-tenant blast radius permanently.

## If staying multi-tenant: per-table procedure (review EACH table first)

For every table above, in a transaction, **per owning app**:

```sql
-- 1. Inspect the table first — confirm the column that identifies the owner.
--    (auth.uid() = <owner_col>) is the usual pattern; some tables key on a
--    different column or a join table. DO NOT assume.
\d public.<table>

-- 2. Enable RLS AND add the owner policy together (never enable without a policy).
alter table public.<table> enable row level security;

create policy "<table>_owner_rw" on public.<table>
  for all
  to authenticated
  using      (auth.uid() = <owner_col>)
  with check (auth.uid() = <owner_col>);

-- 3. If a table is genuinely public-read (e.g. catalog data like clothing_items),
--    replace the blanket using(true) with an explicit read-only policy:
-- create policy "<table>_public_read" on public.<table> for select to anon, authenticated using (true);
--    …and ensure there is NO permissive write policy.
```

Then, separately:

```sql
-- Replace permissive ALL using(true) policies with scoped ones (drop + recreate).
-- Recreate the 3 SECURITY DEFINER views as SECURITY INVOKER.
-- revoke execute on function public.handle_new_user() from anon, authenticated;
-- alter function <fn>(...) set search_path = public;   -- for each search_path-mutable fn
```

In the dashboard: **Auth → Providers → enable leaked-password (HIBP) protection.**

## Rollout

1. Snapshot / PITR checkpoint before any change.
2. Apply one table at a time; after each, smoke-test the owning app (read + write).
3. Keep `analytics_events` / `conversation_history` (flagged `sensitive_columns_exposed`)
   high priority — they expose `session_id`.

> Purrly-specific: `profiles`, `kie_daily_usage`, and the new `ai_daily_usage`
> (migration `20260623_ai_usage_quota.sql`) are already correctly locked; nothing
> here changes them.
