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

1. **Reconcile product requirements.** Review the PRD/TRD DOCX documents, `docs/PROMPT.md`, settings prompt/progress/phases, `AGENTS.md`, routes, migrations and Vercel config. Summarize the DOCX requirements because `docs/_prd_extract` was empty. Align the stale Next.js 14 guidance with the pinned Next.js 16.2.9 version.
2. **Record the engineering baseline.** Record branch, working-tree status, target release and Node/npm versions. Run lint, TypeScript, build and available tests; separate old failures from new ones. Add a test command and CI gate before broad launch.
3. **Audit Supabase without changing Production.** Inspect live columns, constraints, indexes, RLS policies, functions/triggers, Storage, Auth providers, callbacks, email/password settings and advisors. Compare with migrations. Use staging for changes and do not run guessed SQL against Production.

The three steps above are preparation. They are followed by five implementation phases with points 4–21. The same point numbers are used in both production-readiness documents.

**Exit check:** Product requirements, code baseline, live Supabase findings, unresolved questions and rollback owner are documented. No production migration is applied just to complete the audit.

## Phase 1: Make Appearance and accessibility work (points 4–6)

**Goal:** A saved preference changes the whole app, not only the Settings preview.

4. **Choose the supported theme options.** Implement Dark, Light and System because all three appear in Settings, or disable unsupported choices and mark them Coming Soon.
5. **Apply theme and accessibility styles globally.** Replace hard-coded colors with semantic CSS tokens on auth, dashboard, practice, progress, scenario and settings routes. Wire System mode, accent color, density, font size, high contrast and reduced motion to actual behavior.
6. **Make preference state reliable.** Validate/version saved values, merge defaults for old data, avoid a hydration flash, support reset, and decide which preferences should sync across a user's devices.

**Exit check:** All supported themes and accessibility choices work on every route, survive reload, and remain readable and usable.

## Phase 2: Secure profile, preferences and database policies (points 7–10)

**Goal:** Each account's profile, avatar and preferences have a verified schema and correct owner-only access.

7. **Align profile fields and username rules.** Compare profile fields with the live `public.users` schema; add only missing fields through reviewed migrations. Preserve Auth-managed passwords and lowercase case-insensitive username uniqueness, including profile edits and concurrent signup conflicts.
8. **Secure avatar storage.** Verify the bucket and owner-scoped policies, file limits and object paths. Test upload, replace, remove and cross-user isolation.
9. **Choose preference persistence.** If preferences should follow accounts across devices, add `user_settings` linked to Auth with validated data, timestamps and owner-only RLS. Migrate local data safely; never trust a client-supplied user ID.
10. **Review and fix database permissions.** Remediate the six missing-policy findings with least-privilege rules. Inspect `rls_auto_enable()` grants and add indexes only after checking existing indexes and query patterns.

**Exit check:** Anonymous access and two-user tests prove intended behavior; user A cannot access user B's profile, recordings or progress; required profile fields and avatars work.

## Phase 3: Make account, security and privacy settings truthful (points 11-14)

**Goal:** No interface reports a security or data operation as successful unless it really completed.

11. **Complete real email, password and MFA flows.** Read verification from Supabase Auth, show pending email changes, and test password changes plus TOTP enforcement at a fresh login.
12. **Make security controls honest.** Remove sample sessions. Implement supported session revocation or label it Coming Soon. Keep SMS unavailable until a provider and safeguards are ready; keep paid plans and unsupported integrations disabled.
13. **Implement user-scoped data actions.** Build export, Clear History and Delete Account with authenticated server routes, ownership checks, re-authentication/confirmation, safe deletion order, storage cleanup and failure handling.
14. **Make consent effective.** Default analytics/AI-training consent off, persist and honor choices, and remove or clarify controls that do not affect real behavior.

**Exit check:** Test accounts A and B prove actions affect only the requesting user. Pending confirmations remain pending; errors never show success.

## Phase 4: Secure the core product and operations (points 15-18)

**Goal:** Protect user data, control Groq costs, and make practice history and scheduled jobs dependable.

15. **Protect pages and APIs.** Decide guest access, protect every private page/API independently, and derive identity from a verified session. Middleware alone is not authorization.
16. **Validate requests and control AI costs.** Bound audio, transcript, token and concurrency use; add production-safe per-user/IP rate limits and clear provider errors. Never present heuristic fallback as live AI feedback.
17. **Make history, progress and plan limits real.** Reconcile duplicate persistence paths, make writes retry-safe, use owner-scoped data, and enforce displayed Free limits or remove inaccurate claims.
18. **Complete jobs and data lifecycle.** Implement authorized, idempotent cron jobs or remove placeholder schedules. Define audio/transcript consent, retention, deletion, backups and third-party processing.

**Exit check:** Cross-user access, malformed/abusive requests, provider failure, retries and cron authorization are tested. Product claims match real behavior.

## Phase 5: Test, deploy and operate (points 19-21)

**Goal:** Prove the release works and can be supported, monitored and recovered.

19. **Add automated tests.** Cover authentication/MFA, themes/settings, usernames, RLS, practice failures, data actions, rate limits and cron authorization; require checks in CI.
20. **Run manual and browser tests.** Test responsive layouts, accessibility, the full practice loop and two-account data isolation; record evidence for launch claims.
21. **Configure and release safely.** Separate local/Preview/Production settings, protect server secrets, test migrations in staging, verify Preview, then promote with backups, monitoring, rollback and sign-off.

**Exit check:** CI and release tests pass; security/privacy blockers are resolved or explicitly accepted by an accountable owner; Preview is approved; operational recovery has been demonstrated.

## Out of scope for this release

- No Stripe/Razorpay or purchasable paid tiers.
- No SMS verification until an SMS provider, supported regions, costs and abuse safeguards are approved.
- No fake session revocation, API key generation, or third-party integrations.
- Only translated languages should be selectable. Hindi-English coaching should not be advertised until the full feature works and is tested.

## Go/no-go rule

Do not call SpeakUp production-ready until every phase has evidence, an owner and an explicit disposition for remaining risks. Revisit this roadmap after changes to authentication, AI providers, storage, database policies or scheduled jobs.
