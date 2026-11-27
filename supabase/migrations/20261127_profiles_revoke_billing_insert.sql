-- C2 hardening (red-team 2026-11-27) — APPLIED by the project owner on 2026-11-27 and
-- verified from the resulting column privileges (anon: none; authenticated: INSERT
-- id,email,name / UPDATE name). Kept here as the record of what was run.
--
-- Finding (verified from the live catalogue, see docs/redteam/2026-11-27-ooda-redteam.md):
--   * `authenticated` can only UPDATE `profiles.name`  (good — this was the 007 fix)
--   * BUT `authenticated` can still INSERT every column, including
--     subscription_tier / subscription_expiry, because 01_schema.sql revoked only
--     UPDATE, so the default table-level INSERT grant survived.
--     `profiles_insert_own` (check id = auth.uid()) lets a user insert their OWN row
--     with tier='premium'. Normally blocked by the duplicate row created by the
--     handle_new_user trigger, but exploitable for any account without a profile row
--     (pre-trigger accounts, a failed trigger, or a deleted profile).
--   * `anon` holds INSERT/UPDATE on all columns. It is only blocked by RLS having no
--     anon policy; if RLS were ever disabled on `profiles`, the anon key (shipped in
--     the app) could rewrite anyone's tier. Defence in depth: remove the grants.
--
-- Safe for the app: the native app never writes billing columns; the server writes
-- them with the service role (RevenueCat webhook), which is unaffected by these grants.
-- The SECURITY DEFINER trigger handle_new_user is also unaffected.

-- 1. anon has no business touching profiles.
revoke all on public.profiles from anon;

-- 2. authenticated: drop the table-level INSERT (this also drops any column-level
--    INSERT), then re-grant only the columns a user may set at signup.
revoke insert on public.profiles from authenticated;
grant  insert (id, email, name) on public.profiles to authenticated;

-- Verification (expect: anon -> no rows; authenticated INSERT -> id,email,name;
-- authenticated UPDATE -> name):
--   select grantee, privilege_type, column_name
--   from information_schema.column_privileges
--   where table_schema = 'public' and table_name = 'profiles'
--     and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE')
--   order by 1,2,3;
