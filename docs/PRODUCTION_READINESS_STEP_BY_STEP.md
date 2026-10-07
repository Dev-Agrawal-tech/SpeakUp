# SpeakUp Production Readiness: Step by Step

Use this guide with the [production-readiness roadmap](PRODUCTION_READINESS_ROADMAP.md). It describes work to do; an unchecked item is not evidence that the work has passed.

## How to learn from this guide

Work on one numbered step at a time. Before starting a step, ask for: why it matters, what access/information you need, what to do in order, and how to verify the result. Save evidence such as command output, screenshots, passing tests or Supabase results. If a check fails, pause and understand why before moving ahead. Do not make a production database change while learning it; test migrations in a branch/staging project first. Never paste passwords, service-role keys, Groq keys or other secrets into chat or documentation.

## Shared phase and point sequence

This is the canonical sequence shared with the roadmap. It has Phase 0 for preparation, followed by five implementation phases. There are exactly 21 numbered points. The supporting checklists below give additional details for the matching points; they are not a separate sequence.

### Phase 0: Prepare and inspect (points 1-3)

1. **Establish a safe baseline.** Record branch, working changes, runtime versions, deployment target and current lint/type/build/test results. See the supporting baseline checklist.
2. **Confirm product requirements.** Review the PRD/TRD and repository guidance, reconcile stale Next.js references, and label features Works, Needs Work or Coming Soon. See the launch-scope checklist.
3. **Inspect Supabase read-only.** Compare live tables, columns, RLS policies, functions, storage and Auth settings with migrations. Record advisor results before planning database changes. See the Supabase checklist below and the dated snapshot in this file.

### Phase 1: Appearance and accessibility (points 4-6)

4. **Choose the theme promise.** Implement Dark, Light and System, or disable unsupported choices rather than letting a nonworking option be selected.
5. **Apply visual settings globally.** Use shared CSS tokens across auth, dashboard, practice, progress, scenarios and settings; wire accent, density, font size, contrast and motion choices to real behavior.
6. **Make preference state reliable.** Validate/version values, safely merge defaults, avoid theme flashes, and decide which choices are device-only versus synced to the account.

### Phase 2: Profile and database safety (points 7-10)

7. **Align profile data.** Verify profile columns and case-insensitive username rules; add only missing schema through reviewed migrations.
8. **Secure avatars.** Verify bucket policies, file limits, owner paths, replacement/removal and cross-user access.
9. **Choose settings persistence.** If preferences should follow the account, use a user-owned `user_settings` record with validation and RLS; migrate local values safely.
10. **Review database permissions.** Design least-privilege RLS for each required action, inspect the SECURITY DEFINER function's body/grants, and review indexes. Do not make all tables public to clear an advisor warning.

### Phase 3: Account, security and privacy (points 11-14)

11. **Finish real Auth flows.** Show real email-confirmation state and verify password change, email change and TOTP challenge behavior.
12. **Make security controls honest.** Use real supported session actions; keep unsupported session revocation, SMS and integrations Coming Soon.
13. **Implement data actions.** Export, clear history and delete accounts only through owner-checked operations, with confirmation, safe cleanup and truthful success/error states.
14. **Honor privacy choices.** Default optional analytics/AI-training consent off and ensure the product honors saved choices; remove or clarify controls that have no effect.

### Phase 4: Core operations and cost safety (points 15-18)

15. **Protect pages and APIs.** Define guest access and check authentication/ownership on every private route; middleware alone is not enough.
16. **Validate requests and limit AI use.** Bound audio/transcript/token use, add rate limits and handle provider errors without disguising fallbacks as live AI.
17. **Make history, progress and limits accurate.** Choose one persistence path, make writes retry-safe, use real user-owned data, and enforce or remove displayed plan limits.
18. **Finish scheduled jobs and data lifecycle.** Implement authorized/idempotent crons or remove schedules. Define recording consent, retention, deletion, backups and provider handling.

### Phase 5: Tests and release (points 19-21)

19. **Add automated tests.** Cover Auth/MFA, settings, usernames, RLS, AI failures, data actions, rate limits and cron authorization; make them CI gates.
20. **Run manual and browser tests.** Test responsive/accessibility behavior, the complete practice loop and two-account isolation; save evidence.
21. **Configure and release safely.** Separate environment settings, protect secrets, test migrations in staging, approve Preview, then deploy Production with monitoring, backups and rollback.

## Supporting detailed checklists

The checklists below contain deeper actions and pass criteria. Use them as references for the numbered points above, not as a second numbered plan.

### Baseline checklist (supports Point 1)

**Why:** You need to know what already works and avoid confusing old problems with new ones.

**Before you start:** Open the repository in VS Code. Know the intended release branch. Do not discard or overwrite uncommitted work.

**Do this:**

- [ ] Record the branch, latest commit, and any existing working-tree changes.
- [ ] Record the installed Node.js and npm versions and the intended deployment target.
- [ ] On a clean checkout, install from the lockfile with `npm ci` when appropriate.
- [ ] Run these checks and save their output:

  ```powershell
  npm run lint
  npx tsc --noEmit
  npm run build
  ```

- [ ] Check whether tests exist. At review time, `package.json` had no test script and no test files were found. Add a test command and CI gate before broad launch.
- [ ] Update project guidance that says Next.js 14; `package.json` pins Next.js 16.2.9. Use the installed Next.js documentation for framework behavior.

**How to verify:** A clean install reproduces the lint, TypeScript and build results in CI. Record old failures separately from failures caused by later changes. Record the release commit and a rollback owner.

### Launch-scope checklist (supports Point 2)

**Why:** UI progress labels are not proof that features work. The product must not promise a placeholder as a working feature.

**Before you start:** Have the PRD/TRD DOCX documents, `docs/PROMPT.md`, `AGENTS.md`, and settings UI/progress/phases documents available. The `docs/_prd_extract` folder was empty during review.

**Do this:**

- [ ] Review and summarize PRD/TRD requirements and compare them with actual routes and code.
- [ ] Make a feature table with three statuses: Works now, Needs real backend work, and Coming Soon.
- [ ] Correct stale Next.js/product descriptions in project guidance.
- [ ] Keep payments disabled as the settings requirements say. Keep SMS and unsupported integrations Coming Soon. Advertise only features tested end to end.

**How to verify:** Product and engineering agree on the launch feature list. Every visible setting is classified honestly, and unfinished features are disabled or clearly marked.

### Supabase inspection checklist (supports Points 3 and 10)

**Why:** A migration or policy can block sign-in/data access or expose private user records. Check the real database first.

**Before you start:** Select the correct SpeakUp project in Supabase. Prefer a branch/staging database for experiments. Do not paste secrets into this guide.

**Live snapshot (2026-10-02):** The Supabase MCP `list_tables` tool reported seven `public` tables, all with RLS enabled: `users` (5 rows reported), `scenarios` (0), `sessions` (0), `scores` (0), `feedback_items` (0), `streaks` (0), and `scenario_completions` (0). Counts are the tool's report at inspection time and may change.

The Security Advisor reported no policies on six RLS-enabled tables: `feedback_items`, `scenario_completions`, `scenarios`, `scores`, `sessions`, and `streaks`. No policy usually means `anon` and `authenticated` API requests are denied by RLS. Do not fix this by making every table public. Create a policy only for a documented action, and test it. See [Supabase's RLS advisor guide](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The advisor also reported that `public.rls_auto_enable()` is a SECURITY DEFINER function callable by `anon` and `authenticated`, and that leaked-password protection is disabled. SECURITY DEFINER runs with the function owner's privileges, so inspect the function body, callers and execute grants before changing it. References: [anon function grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated function grants](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), and [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

The Performance Advisor reported seven foreign keys without covering indexes and a `public.users` RLS policy that can use `(select auth.uid())` to avoid repeated evaluation. References: [unindexed foreign keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys) and [RLS init-plan](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan).

**Do this:**

- [ ] List columns, types, nullability, defaults, keys and indexes for each table. Compare them with `supabase/migrations` and code queries.
- [ ] Inspect policy expressions and test select/insert/update/delete as anonymous, user A, user B and trusted server role as appropriate.
- [ ] Inspect function body/grants, Auth providers/redirects/email/password settings, and Storage buckets/policies.
- [ ] The October 2 inspection did not verify full column definitions, exact policy expressions, Storage or Auth configuration. Do not assume those are safe or configured; inspect them before migrations.
- [ ] Re-run security/performance advisors after fixes. Use additive reviewed migrations, test in staging, then apply to production only after review.

**How to verify:** User A cannot access user B's profile, session, score, feedback or file. Anonymous access is limited to intended public content. Needed app operations still work. Record migration versions and advisor results. No schema change was made by the inspection above.

### Appearance checklist (supports Points 4-6)

**Why:** A theme card that only changes local state is misleading. Every selected preference should be visible throughout the product.

**Before you start:** Decide whether Light is supported. Since Dark, Light and System are currently presented, implementing all three is recommended. If Light is not in scope, disable it and mark it Coming Soon.

**Do this:**

- [ ] Create shared semantic CSS tokens for page/background, text, muted text, cards, borders, inputs, overlays and accent colors.
- [ ] Replace hard-coded dark colors on login/signup, dashboard, practice, progress, scenario and settings pages.
- [ ] Implement Dark, Light and System; System should follow OS preference and react to changes.
- [ ] Connect accent swatches, UI density, font size and high contrast to real CSS values/classes.
- [ ] Make Reduce Motion affect CSS and Framer Motion and respect the OS reduced-motion preference.
- [ ] Validate/version settings data, merge defaults safely for older saved data, prevent a wrong-theme flash, and decide whether settings sync to the user's other devices.

**How to verify:** Change each option, save, navigate through the listed pages, reload, and verify the selection still has a visible effect. Test OS theme changes, keyboard focus, readable contrast and reduced motion.

### Profile checklist (supports Points 7-9)

**Why:** Profile fields must exist in the database, usernames must be unique, and files/preferences must not cross between accounts.

**Before you start:** Compare `components/settings/profile.tsx` with live `public.users` columns and verify Storage. The profile component uses name, username, bio, location, website, LinkedIn, skills, show-email and avatar URL. Do not assume every field or bucket exists just because the UI references it.

**Do this:**

- [ ] Add only missing profile columns through a reviewed additive migration. Preserve the Auth-to-profile trigger if it is present and correct.
- [ ] Keep password credentials in Supabase Auth; do not create a password column in `public.users`.
- [ ] Keep username normalization case-insensitive. Enforce uniqueness in the database and show the conflict message if two simultaneous requests race.
- [ ] Add availability checking to profile username edits, not only signup.
- [ ] Verify the `avatars` bucket and narrow owner-scoped read/write/delete policies. Limit image types and size; use user-owned object paths; remove replaced files safely.
- [ ] Decide which preferences should sync to a signed-in user's other devices. If required, create a `user_settings` table with an Auth user foreign key, validated/versioned JSON, timestamps and owner-only RLS. Do not trust a browser-supplied user ID.

**How to verify:** Save/reload each field, try a duplicate username, and upload/replace/remove an avatar. Repeat with accounts A and B; B must not be able to access or change A's private values/files.

### Account, security and privacy checklist (supports Points 11, 12 and 14)

**Why:** A false "success" for verification, MFA, session revocation or account deletion can leave the user's account less safe than the interface suggests.

**Do this:**

- [ ] Display email verification using actual Auth data. Show email changes as pending until confirmed.
- [ ] Test password changes through Supabase Auth with validation and real loading/error states.
- [ ] Test TOTP enroll, QR/code verify, cancel and disable. Then sign in again and confirm MFA is challenged; enrollment alone does not prove enforcement.
- [ ] Remove fictional active-device rows. Implement session revocation only if supported; otherwise clearly label it Coming Soon.
- [ ] Keep mobile/SMS verification unavailable until an SMS provider, supported regions, abuse limits and consent are decided.
- [ ] Default analytics/AI-training consent to off. Make the app honor saved consent or remove/reword the toggle if the described processing does not exist.
- [ ] Keep Plus/Pro upgrades disabled. Never fake API key generation or connected-service status.

**How to verify:** Test a fresh and returning account; check pending email confirmation, MFA challenge and error states. Confirm no unsupported action reports success.

### Data-action checklist (supports Point 13)

**Why:** Users must be able to obtain or delete their own information without affecting another account or leaving copies behind.

**Before you start:** Decide which data is exported, what "clear history" deletes, and what account deletion removes. Review foreign keys, storage paths and retention requirements first.

**Do this:**

- [ ] Export only the requesting user's profile, sessions, transcripts, scores, feedback and agreed related metadata. Do not expose service-role credentials in the browser.
- [ ] Implement Clear History as real owner-scoped deletes in safe dependency order, or use verified cascading rules. Do not show success before every requested delete succeeds.
- [ ] Implement account deletion in an authenticated server route. Verify identity/recent authentication where possible; require clear confirmation; use service role only on the server; remove related rows and owned Storage objects.
- [ ] Make partial failures observable and retryable. A sign-out is not account deletion.
- [ ] Test each operation with two test accounts and retain evidence without using real student recordings.

**How to verify:** Export A's data and confirm it contains only A's rows. Clear/delete A and verify B's records remain unchanged. Confirm all expected files are removed and failure states are honest.

### API and AI-cost checklist (supports Points 15-16)

**Why:** Public or weakly protected APIs can expose data or let repeated requests create unbounded Groq charges.

**Do this:**

- [ ] Inventory every `app/api` route as public, authenticated or service-to-service. Decide whether guests may practice.
- [ ] Verify each private API route's session and ownership checks; derive user identity from the verified Supabase session, never a request-supplied owner ID.
- [ ] Validate scenario ID, transcript, duration and guest feedback data at the boundary. Set maximum JSON/audio sizes, recording duration, MIME types, transcript size and model token usage.
- [ ] Add production-compatible per-user/IP rate limits to costly AI and upload routes. In serverless hosting, do not rely on an in-memory counter that disappears between requests.
- [ ] Return safe status codes/errors; keep diagnostic detail in server logs without secrets, raw audio or unnecessary transcript contents.
- [ ] Handle provider timeout/429/5xx, invalid model output and database failure. Make writes idempotent/retry-safe to avoid duplicate sessions.
- [ ] Keep Supabase service-role and Groq keys server-only. Rotate credentials if they were ever committed or exposed.

**How to verify:** Test unauthenticated calls, account A/B isolation, oversized and malformed requests, repeated calls and provider failures. Confirm rejected requests do not leak secrets or trigger unlimited cost.

### Scheduled jobs and audio-lifecycle checklist (supports Point 18)

**Why:** A Vercel schedule that returns "configured" is not a working job. Audio retention and deletion must match what users were told.

**Do this:**

- [ ] For each cron in `vercel.json`, specify purpose, timezone, expected run time, retries and owner. Implement its work or remove the schedule while it is a placeholder.
- [ ] Require the platform-supported cron secret/header. Make jobs bounded, idempotent and safe to retry; prevent duplicate reminders or premature deletion.
- [ ] Test authorized and unauthorized calls plus empty, success, failure and retry cases in staging.
- [ ] Document what is recorded, transcribed, sent to Groq, retained, logged and backed up. Define retention periods and get appropriate consent.
- [ ] Verify Storage visibility, upload authorization, signed URL expiry, file validation and user isolation. Include backups and third-party processors in the retention plan.

**How to verify:** Direct unauthorized cron calls fail; scheduled operations perform real work once; alerts detect failures; an account's audio/transcript can be traced through retention and deletion.

### Core-practice checklist (supports Points 17 and 20)

**Why:** Users need a complete scenario-to-speak-to-feedback-to-retry journey, not screens that only look complete.

**Do this:**

- [ ] Test signup/confirmation, login, onboarding, scenario selection, recording, upload/transcription, AI feedback, retry and persistence into history/progress.
- [ ] Test microphone denied, no/short speech, interrupted recording, upload/transcription failure, AI timeout, invalid AI output, database failure and retry.
- [ ] Verify scenario catalogue quantity/quality and seed process before promising 30 scenarios; `AGENTS.md` lists that as a future feature.
- [ ] Verify history/replay, progress, daily challenge, reminders and Hindi-English mode against real data before advertising them.
- [ ] Test current desktop/mobile browsers, keyboard/screen reader labels, focus, contrast, reduced motion, empty/loading/error states and audio controls.
- [ ] Ensure any Free plan daily/session/history limits shown in `lib/config/plans.ts` are enforced server-side or remove inaccurate claims.
- [ ] Have product/support review AI, recording, privacy and availability wording.

**How to verify:** Fresh and returning test accounts complete every advertised flow and recover cleanly from failures. No placeholder data is presented as real.

### Operations checklist (supports Points 19 and 21)

**Why:** When production fails, the team needs enough safe information to detect, diagnose, communicate and recover.

**Do this:**

- [ ] Add structured, privacy-conscious logs and request IDs across web/API, Supabase, Groq, Storage and jobs.
- [ ] Alert on sign-in failures, recording/transcription/feedback failures, latency, persistence errors, cron failures and provider quota limits.
- [ ] Set Vercel, Supabase and Groq usage/spend budgets with an action plan for thresholds.
- [ ] Verify backup coverage and perform a restore drill in non-production. Document migration rollback or forward-recovery.
- [ ] Write incident procedures for leaked credentials, data exposure/loss, provider outage and recording/privacy complaints. Assign response owners and support/privacy contacts.
- [ ] Run a staging incident drill and record detection, mitigation, recovery and user communication.

**How to verify:** A simulated incident generates an alert and the team can follow the runbook to restore service and communicate accurately.

### Deployment checklist (supports Point 21)

**Why:** Localhost success does not prove the deployed app has valid credentials, email links, OAuth redirects, cron authorization, backups or support.

**Do this:**

- [ ] Configure separate local, Vercel Preview and Production values for `NEXT_PUBLIC_SUPABASE_URL`, the public anon/publishable key, server-only `SUPABASE_SERVICE_ROLE_KEY` only if needed, `GROQ_API_KEY`, `CRON_SECRET` if jobs remain, and selected rate-limit/email provider values. Never put server secrets in a `NEXT_PUBLIC_` variable.
- [ ] Configure Supabase production Site URL and app callback allowlist; Google OAuth client origins/provider callback; confirmation/reset SMTP sender/domain; email confirmation and leaked-password protection.
- [ ] Apply reviewed migrations to staging/branch first. Verify schema, RLS, storage and advisors, run smoke tests and create rollback notes before Production migration.
- [ ] Deploy a Vercel Preview and verify auth, AI, settings, data writes, cron authorization, logs and error handling. Promote only after checks pass.
- [ ] In production monitor health, auth/AI errors, email delivery, database advisors, cron outcomes and spending. Keep a rollback path and support contact.
- [ ] Review all pass criteria and link evidence. List unresolved issues with severity, owner, due date and launch decision. Obtain engineering/product/privacy sign-off.

**Go only when:** Security/privacy blockers are closed or explicitly accepted by accountable owners, the core loop works, monitoring/recovery has been demonstrated, and every advertised feature is real.

## Supabase terms used in this guide

- **RLS:** Row Level Security; database rules that decide which rows each role/user can read or change.
- **Policy:** A specific RLS permission, such as allowing a signed-in user to read only a row whose `user_id` equals their own Auth ID.
- **Migration:** A reviewed, versioned SQL file that changes database tables, indexes, functions or policies.
- **SECURITY DEFINER:** A database function that runs using its owner's permissions; exposed execution grants require careful review.
- **Service role:** A powerful Supabase credential for trusted server-side work. Never expose it to browser code.
- **Preview deployment:** A test deployment used to verify changes before Production.
- **Smoke test:** A short end-to-end test of the main user journey after deployment.

## Verification limits

The October 2 Supabase snapshot listed tables and advisors, but did not verify full column definitions, every policy expression, Storage bucket/policies, or Auth/OAuth/email configuration. The Supabase row counts can change. Complete those inspections in Step 3 before making database changes. The roadmap and checklist are plans, not evidence that any unchecked item has passed.
