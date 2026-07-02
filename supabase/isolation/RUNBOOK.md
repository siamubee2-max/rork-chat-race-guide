# Purrly — isolate into a dedicated Supabase project

**Why:** the shared project `wifievmrlovkjlbnjgwr` exposes other apps' RLS-disabled
tables via Purrly's shipped anon key (007 audit). Isolation removes the cross-tenant
blast radius permanently.

**Why it's cheap NOW:** the shared project has only **3 auth users (all test, 0
anonymous)** and **0 KIE usage**. No real user base → **no auth migration**. The 3
testers just re-register on the new project.

**Cost:** a new project = **$10/month** in org `akkfxbpatifhedlsfmgv`.

---

## Steps

### 1. Create the project
`Purrly`, region close to users (e.g. `eu-west-3` Paris), org `akkfxbpatifhedlsfmgv`.
Dashboard, or CLI: `supabase projects create Purrly --org-id akkfxbpatifhedlsfmgv --region eu-west-3`.
Note the new **project ref**, **anon key**, **project URL**, and **service_role key**.

### 2. Apply the schema (one shot)
```
psql "<new-project-connection-string>" -f supabase/isolation/01_schema.sql
# or paste into the SQL editor
```
This creates `profiles` (+ hardened RLS: tier/expiry service-role-only), the
`handle_new_user` trigger, and the `kie_daily_usage` / `ai_daily_usage` quota
tables + RPCs.

### 3. Set secrets on the NEW project
```
supabase secrets set --project-ref <NEW_REF> \
  KIE_API_KEY=<the rotated key> \
  OPENAI_API_KEY=<openai key> \
  REVENUECAT_WEBHOOK_AUTH_KEY=<same Authorization value configured in RevenueCat>
```
(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` are auto-injected.)

### 4. Deploy the 4 edge functions to the new project
```
supabase functions deploy kie-generate       --project-ref <NEW_REF>
supabase functions deploy ai-chat            --project-ref <NEW_REF>   # hardened
supabase functions deploy breed-scan         --project-ref <NEW_REF>   # hardened
supabase functions deploy revenuecat-webhook --project-ref <NEW_REF>
```
(`ai-chat`/`breed-scan` already hardened in `supabase/functions/`. `revenuecat-webhook`
keeps `--no-verify-jwt` per its own secret check — confirm its current deploy flag.)

### 5. Repoint the iOS app
In `ios-native/Purrly/Resources/Secrets.xcconfig` (gitignored):
```
SUPABASE_URL      = https://<NEW_REF>.supabase.co
SUPABASE_ANON_KEY = <new anon key>
RORK_API_BASE_URL = https://<NEW_REF>.supabase.co/functions/v1
```
Then `xcodegen generate` + rebuild + ship the update. (KIE_API_KEY/VIP_EMAILS are
already removed from the client — nothing else to change.)

### 6. Repoint RevenueCat
RevenueCat dashboard → Project → Integrations → Webhook URL →
`https://<NEW_REF>.supabase.co/functions/v1/revenuecat-webhook`.

### 7. Re-register the testers
The 3 test accounts sign up again on the new project. If any needs `pro` for testing,
set it server-side (service role), e.g.:
`update profiles set subscription_tier='pro', subscription_expiry='2125-01-01' where email='…';`

### 8. Decommission Purrly's footprint in the SHARED project (last, after cutover verified)
Once the new project is live and verified, drop Purrly's objects from
`wifievmrlovkjlbnjgwr`: functions `kie-generate/ai-chat/breed-scan/revenuecat-webhook`,
tables `profiles/kie_daily_usage/ai_daily_usage`, the `handle_new_user` trigger.
This shrinks that project back to the OTHER apps — which still need the separate
RLS remediation (`SECURITY_RLS_REMEDIATION.md`) for their own tables.

---

## Cutover order (minimal disruption)
3 testers → no live traffic to protect, so: create → schema → secrets → deploy →
repoint app+RevenueCat → verify → decommission. No maintenance window needed.
