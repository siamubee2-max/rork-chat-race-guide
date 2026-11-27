# Purrly — Red-team OODA report (2026-11-27)

Method: superpowers:systematic-debugging, Phase 1 only (root-cause investigation, **no fixes applied**).
Scope: `expo/`, `ios-native/` (the app being shipped), `supabase/`, CI. Static analysis + `tsc` + `expo lint`.

**Not done:** no dynamic testing, no Swift compile (no Xcode here), live Supabase project not queried.
Labels: **CONFIRMED** = read in code, mechanism is unambiguous. **PLAUSIBLE** = depends on live config I could not see.

## Negative results (hypotheses tested and refuted)
- No hardcoded secrets in tracked files, in git history (all commits scanned for JWTs), or in the committed `purrly-simulator.tar.gz` bundle.
- RevenueCat key IS wired (`project.yml` → `Info.plist` → `AppConfiguration`).
- `tsc --noEmit` on `expo/` is clean.
- Edge functions verify the JWT in code (`admin.auth.getUser`) and gate tier + expiry server-side; quota RPCs are atomic and revoked from `anon/authenticated`.

## Critical

### C1 — Access token is never refreshed: AI features die ~1 h after sign-in — CONFIRMED
- `AuthService.swift:92` writes the token to the Keychain **only inside `signIn`**. `KeychainStore.Key.refreshToken` exists but is never written. No `authStateChanges` listener exists anywhere (`grep` empty).
- `bootstrap()` (`AuthService.swift:55-70`) refreshes the SDK's *own* session but never rewrites the Keychain entry.
- Every network call reads the raw Keychain value: `ScanResultView:204`, `PhotoAnalyzerView:126`, `AssistantChatView:183`, `InsightsView:118`, `BehaviorView:130`, `CatPhotoBoothView:338`, `AuthService.deleteAccount:145`.
- Effect: once the JWT expires (Supabase default TTL 3600 s — **assumption**, check project setting) every call gets 401 → UI says "Connectez-vous…" while the user is still "logged in"; **account deletion fails** (App Store 5.1.1(v)). App Review passed because its session is short.
- Fix direction: stop copying tokens; call `try await client.auth.session` (auto-refreshes) at each call site, or persist on `authStateChanges`.

### C2 — Subscription self-grant depends on DB column privileges nobody has proven — PLAUSIBLE (critical if open)
- Server gates (`ai-chat`, `breed-scan`, `kie-generate`) trust `profiles.subscription_tier/expiry`.
- Expo **writes those columns from the client**: `expo/context/auth.tsx:46-52` (`update … tier 'pro'`) and `:158-164` (signup upsert). Any user can run the same call.
- The fix ("billing columns service-role-only") exists only in `supabase/isolation/01_schema.sql` ("apply to a FRESH project"); `SECURITY_RLS_REMEDIATION.md` says **NOT applied**. No migration in the repo revokes it on the live shared project.
- Contradiction: if the hardened grants ARE live, Expo's signup `upsert` (which writes `subscription_tier`) hits 42501. *Correction after reading `auth.tsx:154-180`:* it is swallowed — `signUp` still returns `success: true` after ~2 s of pointless retries, and the VIP `update` becomes a silent no-op. So it is not a visible signup failure.

> **UPDATE 2026-11-27 — live-DB verdict (catalogue output pasted by the owner; project `tqqpvxbmxetpkghuwwqa`; this session had no access and ran nothing).**
> - **`UPDATE` is closed:** `authenticated` can update `profiles.name` only. The self-grant via `update` described above does **not** work.
> - **Residual hole — `INSERT`:** `authenticated` can INSERT all columns incl. `subscription_tier/expiry`, and `profiles_insert_own` allows inserting one's own row. Root cause is in `01_schema.sql`: it revoked only `UPDATE`, so the default table-level INSERT grant survived (the live grants match the file exactly). Exploitable only for an account with **no** profile row (pre-trigger accounts, failed trigger, deleted profile) — the `handle_new_user` trigger normally pre-creates it. Whether the trigger is attached to `auth.users` is **not yet verified** (only the function was listed).
> - **`anon` holds INSERT/UPDATE on every column.** It is blocked only if RLS is enabled on `profiles` with no anon policy. Policies exist, but `relrowsecurity` was **not** in the pasted output → **unverified**. If RLS were off, the shipped anon key could rewrite any tier.
> - **Good:** the 3 `SECURITY DEFINER` functions are not executable by `anon`.
> - **Fix applied by the owner and VERIFIED (2026-11-27):** `supabase/migrations/20261127_profiles_revoke_billing_insert.sql` (+ same correction in `isolation/01_schema.sql`). The owner pasted the post-change `information_schema.column_privileges` output: no `anon` rows; `authenticated` INSERT = `email, id, name`; UPDATE = `name`. (This session could not run it itself — result relayed by the owner.) **C2 is closed for billing columns regardless of RLS state or trigger**, since column privileges apply independently of RLS.
> - **Still open (privacy/integrity, not billing):** if RLS is disabled on `profiles`, any authenticated user could read other users' rows (emails) and edit other users' `name`. Needs query (1) below.
> - **Still needed:** (1) `select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';` (2) `select tgname from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal;`
> - **C3:** `pg_policies` lists **only** `profiles` policies, so no `using(true)` co-tenant policies exist here (consistent with an isolated project). RLS-off tables cannot be excluded without query (1). No policies at all for `community_posts` / `community_events` / `discussion_*`: those tables are either absent, RLS-on-no-policy (locked), or RLS-off (open) — query (1) tells which. If absent/locked, the native community silently shows the fake sample content (H4).
- Related: VIP is decided client-side from `EXPO_PUBLIC_VIP_EMAILS` (inlined in the shipped bundle — contradicts the comment claiming it is hidden); with email confirmation off, signing up with a VIP address grants lifetime pro.

### C3 — Shared Supabase project: RLS-disabled / `using(true)` tables — PLAUSIBLE (doc dated 2026-06-23, stale?)
`SECURITY_RLS_REMEDIATION.md` lists tables with RLS off or wide open (anon key = full R/W), incl. `user_profiles`, `conversation_history`, `transactions`. Current state unknown. The anon key ships in every client. **Read-only check available:** Supabase `get_advisors` (metadata only).

## High

> **FIX SHIPPED for H1 + H2 (2026-11-27) — compiled and green; migration NOT YET APPLIED.** `ModerationStoreTests` (15 tests) was authored before the code. Verified after the fact on Xcode 26.5 / iOS 26.5 simulator: `xcodegen generate` (project.yml now preserves `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION`/`ITSAppUsesNonExemptEncryption` on regeneration — they were being dropped), full `PurrlyTests` run green incl. `ModerationStoreTests` (15) and `AuthTokenResolverTests` (4). Two compile errors surfaced and were fixed: `ReportSubmitting` is now `Sendable` (Swift 6 strict concurrency refused crossing `self.submitter` from the `@MainActor` store). Still pending: apply `supabase/migrations/20261127_content_reports.sql`. Also fixed along the way: a **reported forum message stayed visible** (`DiscussionDetailView` filtered on `isBlocked` only, not `isHidden`).

### H1 — Reports go nowhere, UI claims they do — CONFIRMED
`ModerationStore.report()` (`:69-73`) only inserts an id into `UserDefaults` and shows "signalé à notre équipe, qui agira sous 24 h". No network call, no mailto; `supportEmail` is defined but referenced nowhere else. Misleading to users and fails the intent of Guideline 1.2 (act on reports within 24 h).

### H2 — Moderation bypass via name collision; blocking by display name — CONFIRMED
`ModerationMenuItems` hides Report/Block when `author != currentUserName`; display names are free text with no uniqueness (`profiles.name`, 1–100 chars). Set your name equal to a victim's → they cannot report/block you, and blocking "Marc" blocks every Marc. `author_name` is client-supplied on insert (`CommunityStore.addPost`), so impersonation is trivial.

### H3 — DMs and comments are local-only but presented as real — CONFIRMED
`CommunityStore.sendMessage` (`:159-177`) and `addComment` (`:151-157`) never touch the network; `ConversationView` keeps messages in `@State`. A sent DM is never delivered and vanishes on dismiss.

### H4 — Fabricated "community" content shown as real — CONFIRMED
`CommunityStore.load` catch → `loadSamples()` (`:61`); `DiscussionsStore.load` calls `loadSamples()` even on success with zero rows (`:46`). Users can reply/like fake "Léa/Marc" posts; writes then fail silently (`catch { /* keep local */ }`).

### H5 — Likes can be inflated indefinitely + lost updates — CONFIRMED
`toggleLike` (`:91-114`) writes an **absolute** `likes` value from the local copy; `isLiked` is never persisted (`load()` sets `false`), so each relaunch lets the same user add +1 again. Concurrent likes overwrite each other. Whether RLS lets non-authors UPDATE `community_posts` is unknown (table not in repo).

## Medium
- **M1 Quota burned on bad/failed requests** — CONFIRMED. `ai-chat:66-71`, `breed-scan:67-72`, `kie-generate:179-187` increment quota *before* validating input or calling upstream. Malformed body, bad base64, upstream 5xx → quota lost. `kie-generate` polls up to 60×3 s = 180 s; if the platform wall-clock limit is lower (PLAUSIBLE) the user gets an error and still pays the quota.
- **M2 `ai-chat` is a generic LLM proxy** — CONFIRMED. Client controls `systemPrompt` and per-message `role` (incl. `"system"`), `content` type unchecked, no body-size cap before `req.json()`. Cost is bounded only by per-account quota; signup is free.
- **M3 `delete-account` incomplete** — CONFIRMED for `ai_daily_usage` (no FK to `auth.users`, never deleted). UGC rows (`community_*`, `discussion_*`) not deleted — PLAUSIBLE (schemas not in repo).
- **M4 Webhook edge cases** — PLAUSIBLE. Non-UUID `app_user_id` (`$RCAnonymousID:…`) → Postgres 22P02 → HTTP 500 → RevenueCat retries; no `event_timestamp_ms` ordering guard (a late RENEWAL can undo an EXPIRATION); `safeEqual` leaks length.
- **M5 Debug backdoors compiled into Release** — CONFIRMED. `AuthService.enterUITestMode()` (grants `.pro`) and `ModerationStore.init` (`-uiTesting` auto-accepts the UGC terms gate) are not under `#if DEBUG` (unlike `AppHTTP`). Offline "demo mode" (`client == nil`) signs in **any** credentials as `.premium` (`AuthService:77-88`, `41-52`) if Supabase config is ever missing/placeholder.
- **M6 UI premium ignores expiry** — CONFIRMED. `SubscriptionTier.isPremium = self != .free`, `syncEntitlements` uses it; server gates check expiry → UI/server disagree after a missed EXPIRATION webhook.
- **M7 Client AI counter undercounts** — CONFIRMED. `recordAIMessage()` only in `AssistantChatView`; `Insights`, `Behavior`, `PhotoAnalyzer` also hit `ai-chat` and burn the same 15/day server quota → "X remaining" is wrong.
- **M8 Data-layer smells** — `DiscussionsStore` fetches *all* `discussion_messages` unbounded (PostgREST row cap silently truncates); `CommunityStore`/`DiscussionsStore` build a **new `SupabaseClient` per access** (wasteful; concurrent refresh-token rotation race is a hypothesis).
- **M9 Expo `onAuthStateChange` awaits Supabase calls inside the callback** (`auth.tsx:66-76`) — known supabase-js deadlock pitfall; PLAUSIBLE.

## Low
- **CI is red on `main` and on this PR — at the `npm audit --omit=dev --audit-level=high` step** (47 vulns: 21 high, 2 critical; e.g. `hono <=4.13.15`, `tar`, `shell-quote`, `undici`, `ws`). Verified from the PR job log: this is the last step, so lint/typecheck/security:check passed in CI. The base commit's workflow run is also red (its log has expired, so its failing step is unverified; advisories are time-dependent). *Correction:* an earlier draft of this report blamed lint; a local `expo lint` run did report 12 errors / 70 warnings, but that is not what fails CI (unexplained local-vs-CI difference). No CI at all for the Swift app.
- `expo/purrly-simulator.tar.gz` (32 MB build artifact) is tracked.
- Legacy `expo/backend/hono.ts`: dead RevenueCat handler writing to a non-existent `users` table; rate limiter keyed on spoofable `X-Forwarded-For`; `/trpc/*` middleware vs `endpoint: "/api/trpc"` mismatch; `create-context.ts` builds a **service-role** client, so with no token every `publicProcedure` runs with RLS bypassed (latent footgun; only `hello` is public today).

## Proposed Act order (needs your go-ahead — see notes)
1. **C1** token refresh (Swift) — biggest user-facing bug.
2. **Verify C2/C3 read-only** on the live project, then decide remediation (migration + remove client-side tier writes in Expo).
3. **H1–H5** honest UGC: real report pipeline (table + edge function/email), id-based blocking, remove sample fallback, drop fake DMs or implement them, idempotent likes (table keyed `(post_id,user_id)`).
4. **M1–M2** edge functions: validate-then-count (or refund), role allow-list, size caps.
5. **M5** gate debug paths with `#if DEBUG`.
6. Cheap wins: lint errors → CI green, drop tarball, delete dead `hono.ts` webhook.
