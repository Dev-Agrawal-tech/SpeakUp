# SpeakUp Production Readiness Roadmap

**Status:** Working plan based on repository review and Supabase checks on 2026-10-02. This is a roadmap, not a claim that the listed work has passed.

## Goal

Prepare SpeakUp as a dependable AI communication coach for Indian students. A production release must protect accounts and recordings, deliver the practice loop reliably, control provider costs, and advertise only features that work end to end.

## Current findings

- The project uses Next.js 16.2.9, React 19, TypeScript, Supabase and Groq according to `package.json`. `AGENTS.md` still says Next.js 14; update project guidance after checking the installed Next.js documentation.
- `package.json` has lint and build scripts, but no test script. The repository review found no checked-in test files.
- Middleware matches `/dashboard/:path*` and `/settings/:path*`; every private API and other protected page still needs its own authorization check.
- `/api/analyze-speech` can use heuristic feedback if `GROQ_API_KEY` is missing. Production must not present fallback output as live AI analysis.
- `vercel.json` schedules daily challenge, audio cleanup and reminders. The inspected daily-challenge and cleanup handlers returned configuration acknowledgements rather than doing the named work.
- The Settings progress document says all phases are done, but code review found several mock or incomplete behaviors: theme controls do not style the whole app; settings are localStorage-only; email Verified state is hard-coded; active sessions are example data; Clear History and Delete Account do not perform their advertised operations; some notification/privacy toggles do not affect downstream behavior.

## Supabase snapshot

The Supabase MCP `list_tables` call reported these `public` tables on 2026-10-02. RLS is enabled on all seven. Row counts below are the tool's reported counts at inspection time.

| Table | RLS enabled | Rows reported |
| --- | --- | ---: |
| `public.users` | Yes | 5 |
| `public.scenarios` | Yes | 0 |
| `public.sessions` | Yes | 0 |
| `public.scores` | Yes | 0 |
| `public.feedback_items` | Yes | 0 |
| `public.streaks` | Yes | 0 |
| `public.scenario_completions` | Yes | 0 |

The security advisor reported six tables with RLS enabled but no policies: `feedback_items`, `scenario_completions`, `scenarios`, `scores`, `sessions`, and `streaks`. RLS with no policies generally blocks `anon` and `authenticated` client access; it is not a reason to make tables public. Determine the app's required actions and create least-privilege policies, then test with anonymous access and two separate users. See [Supabase RLS advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The security advisor also reported that `public.rls_auto_enable()` is a `SECURITY DEFINER` function executable by `anon` and `authenticated`, and that leaked-password protection is disabled. A SECURITY DEFINER function runs with its owner's permissions; inspect its body and grants before changing it. References: [anon execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

The performance advisor reported seven foreign keys without covering indexes and a `public.users` RLS policy that can avoid repeated auth checks with `(select auth.uid())`. References: [unindexed foreign keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [RLS init-plan guidance](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan).

The MCP check did not verify full column definitions, policy expressions, storage buckets/policies, Auth/OAuth/email configuration, or migrations in detail. Verify these before making schema changes. Advisor results can change; run them again after remediation. No Supabase changes were made during this inspection.

## Phase 0: Confirm requirements and the baseline

**Goal:** Know what SpeakUp promises, what the code currently does, and what the live database contains before changing anything.

- Review the PRD/TRD DOCX documents, `docs/PROMPT.md`, settings prompt/progress/phases, `AGENTS.md`, actual routes, migrations and Vercel config. `docs/_prd_extract` was empty during review, so summarize the DOCX requirements and resolve conflicts. Align the stale Next.js 14 guidance with the pinned Next.js 16.2.9 version.
- Record branch, working-tree status and target release. Run lint, TypeScript checking, build and available tests. Separate existing failures from new failures. Add a test command and CI gate before broad launch.
- Inspect Supabase columns, constraints, indexes, RLS policies, functions/triggers and Storage. Inspect Auth provider, callback, email and password settings. Compare live state with migrations; do not run guessed SQL against Production.
- Record features as Works, Needs backend work, or Coming Soon. Paid plans remain disabled; SMS and unsupported integrations stay Coming Soon.

**Exit check:** Product requirements, code baseline, live Supabase findings, unresolved questions and rollback owner are documented. No production migration is applied just to complete the audit.

## Phase 1: Make Appearance and accessibility work

**Goal:** A saved preference changes the whole app, not only the Settings preview.

- Decide whether Dark, Light and System are supported. Since all three appear in Settings, the recommended choice is to implement them; otherwise disable unsupported selections and mark them Coming Soon.
- Replace hard-coded page, card, text, border and field colors with shared semantic CSS tokens across auth, dashboard, practice, progress, scenario and settings routes.
- Wire System mode to the operating-system theme. Make accent color, density, font size, high contrast and reduced motion affect actual CSS and JavaScript behavior.
- Keep one validated/versioned settings store, safely merge defaults for old data, prevent a hydration flash, and decide which values should sync to the signed-in user's other devices.

**Exit check:** All supported themes and accessibility choices work on every route, survive reload, and remain readable and usable.

## Phase 2: Secure profile, preferences and database policies

**Goal:** Each account's profile, avatar and preferences have a verified schema and correct owner-only access.

- Compare fields used by `components/settings/profile.tsx` with the live `public.users` schema. Add only genuinely missing fields through reviewed additive migrations. Passwords remain in Supabase Auth, never in `public.users`.
- Preserve lowercase, case-insensitive username uniqueness. Add availability validation to profile edits and handle unique-index conflicts caused by simultaneous requests.
- Verify the `avatars` bucket and its policies. Restrict file type/size and user-owned paths; test upload, replace, remove and cross-user isolation.
- If settings should follow a user across devices, add a `user_settings` table with an Auth user foreign key, validated JSON settings, timestamps and owner-only RLS. Migrate local settings without trusting client-supplied user IDs.
- Review and safely remediate the six missing-policy findings. Give scenarios only the public access they need; keep user records private. Inspect and restrict `rls_auto_enable()` if clients do not need to execute it. Add indexes only after checking query patterns and existing indexes.

**Exit check:** Anonymous access and two-user tests prove intended behavior; user A cannot access user B's profile, recordings or progress; required profile fields and avatars work.

## Phase 3: Make account, security and privacy settings truthful

**Goal:** No interface reports a security or data operation as successful unless it really completed.

- Derive email verification state from Supabase Auth. Show email changes as pending until confirmed. Test password changes and TOTP enrollment, challenge, disable and fresh-login enforcement.
- Remove sample device/session data. Implement supported session revocation or label it Coming Soon. Keep mobile/SMS verification unavailable until a provider and safeguards are configured.
- Implement user-scoped export, Clear History and Delete Account. Use authenticated server routes and server-only service-role credentials where required. Confirm ownership, safe deletion order, re-authentication, storage cleanup and failure recovery.
- Default analytics/AI-training consent to off and make downstream processing honor it. Remove or clarify controls that do not affect actual behavior.
- Keep paid plan buttons disabled. Do not fake API key creation or connected services.

**Exit check:** Test accounts A and B prove actions affect only the requesting user. Pending confirmations remain pending; errors never show success.

## Phase 4: Secure the core product and operations

**Goal:** Protect user data, control Groq costs, and make practice history and scheduled jobs dependable.

- Decide guest versus signed-in access. Protect every private page and API independently; middleware alone is not authorization. Derive user identity from a verified session.
- Validate API inputs and AI output. Bound audio size/duration, transcript length, model tokens, concurrency, timeouts and retries. Add production-safe per-user/IP limits to costly AI endpoints. Missing Groq configuration must fail clearly, not silently masquerade as AI feedback.
- Reconcile duplicate history paths (`sessions`/`scores`/`feedback_items` versus `user_attempts`/`attempt_feedback`). Make writes consistent and retry-safe; drive history and progress from real, owner-scoped data.
- Enforce displayed Free limits server-side or remove inaccurate plan claims. Implement cron jobs with authorization, idempotency and monitoring, or remove placeholder schedules.
- Define consent, retention and deletion for audio/transcripts. Include backups, logs, third-party processing and Vercel/Supabase/Groq spending alerts.

**Exit check:** Cross-user access, malformed/abusive requests, provider failure, retries and cron authorization are tested. Product claims match real behavior.

## Phase 5: Test, deploy and operate

**Goal:** Prove the release works and can be supported, monitored and recovered.

- Add automated and browser tests for authentication/MFA, themes/settings, username uniqueness, RLS, practice failures, export/delete, rate limits and cron authorization.
- Test desktop/tablet/mobile, keyboard/screen reader, focus/Escape, reduced motion, contrast, empty/loading/error states and the complete practice loop. Use two accounts to verify data isolation.
- Configure separate local, Preview and Production settings. Keep service-role and Groq secrets server-only. Configure OAuth redirects, confirmation/reset email SMTP, password protection and cron/rate-limit settings only for enabled features.
- Apply reviewed migrations to staging first, verify RLS/storage/advisors, run Preview smoke tests, then deploy Production with backup, rollback, monitoring and support plans.

**Exit check:** CI and release tests pass; security/privacy blockers are resolved or explicitly accepted by an accountable owner; Preview is approved; operational recovery has been demonstrated.

## Out of scope for this release

- No Stripe/Razorpay or purchasable paid tiers.
- No SMS verification until an SMS provider, supported regions, costs and abuse safeguards are approved.
- No fake session revocation, API key generation, or third-party integrations.
- Only translated languages should be selectable. Hindi-English coaching should not be advertised until the full feature works and is tested.

## Go/no-go rule

Do not call SpeakUp production-ready until every phase has evidence, an owner and an explicit disposition for remaining risks. Revisit this roadmap after changes to authentication, AI providers, storage, database policies or scheduled jobs.
