# Settings Progress

## Project Summary
- **Stack**: Next.js 14 App Router + TypeScript, Tailwind CSS v4, Supabase (Auth+DB), Groq (Whisper+LLaMA), Vercel
- **Design tokens**: CSS vars in globals.css — `--background: #0A0A0A`, `--accent: #2563EB`, `--surface`, `--border`; Tailwind v4 `@theme inline`
- **Icon lib**: lucide-react
- **Animation lib**: framer-motion (installed, minimal usage)
- **UI lib**: No shadcn/ui components installed yet (components/ui is empty); all UI is hand-built Tailwind
- **Toast**: None exists — need to create
- **Backend**: Supabase Auth (Google OAuth + email/password), DB tables: users, scenarios, sessions, scores, feedback_items, streaks, scenario_completions
- **Auth**: Middleware protects `/dashboard/*` only; client-side redirect on other (app) pages
- **Sidebar**: Inline in dashboard/page.tsx only (not shared component); has avatar, username, "Free Plan", logout button
- **Routes**: (app)/dashboard, practice, progress, scenarios, scenario, settings (empty); (auth)/login, signup, onboarding, reset-password
- **Product**: AI communication coach for Indian students. Scenario→speak→AI feedback→retry loop
- **State management**: zustand installed but not used for global state yet
- **Forms**: react-hook-form + zod installed

Phase 1 done: app/(app)/dashboard/page.tsx, app/(app)/settings/page.tsx, components/settings/primitives.tsx, components/ui/confirm-dialog.tsx, components/ui/toast.tsx, components/ui/toggle.tsx, lib/config/plans.ts, lib/hooks/use-unsaved-changes.ts, middleware.ts, docs/SETTINGS_PROGRESS.md
## Phase 2 Status: Done (Updated with Real Avatar Storage, Extended Profile Fields & Real 2FA TOTP)
- Files built:
  - `components/settings/profile.tsx`
  - `components/settings/security.tsx`
  - `components/settings/verification.tsx`
- REAL backend connected:
  - Profile load and save (name, username, bio, location, website, linkedin, skills, show_email) to `public.users`
  - Avatar image upload directly to Supabase `avatars` bucket with public URL persistence
  - Password change via `supabase.auth.updateUser`
  - Email change initiation via `supabase.auth.updateUser`
  - Two-Step Verification (2FA / TOTP) via `supabase.auth.mfa.enroll`, QR code generation, manual key copy, and code verification
- COMING SOON / UNWIRED:
  - Mobile SMS verification (Free-tier friendly mock, ready for Twilio provider config)
  - Active sessions remote revoke (Mock UI until service role API route is added)

## Phase 3 Status: Done
- Files built:
  - `lib/hooks/use-settings-store.ts` (localStorage store)
  - `components/settings/subscription.tsx` (UI with `plans.ts` data)
  - `components/settings/notifications.tsx`
  - `components/settings/privacy.tsx`
- REAL backend connected:
  - Settings persisted via localStorage for Notifications and Privacy
- COMING SOON / MOCK:
  - Subscriptions/Payments (fully disabled "Upgrade" buttons per prompt)
  - Report / Safety flows (currently mock buttons)

## Phase 4 Status: Done
- Files built:
  - `components/settings/appearance.tsx`
  - `components/settings/language.tsx`
  - `components/settings/accessibility.tsx`
- Updates made:
  - Expanded `lib/hooks/use-settings-store.ts` to cover Appearance, Language, and Accessibility fields.
  - Wired new components into `app/(app)/settings/page.tsx`.
  - Added global DOM initialization in `app/layout.tsx` to read the localStorage store before hydration to prevent a flash of unstyled content or wrong themes.

## Phase 5 Status: Done
- Files built:
  - `components/settings/data.tsx`
  - `components/settings/help.tsx`
  - `components/settings/integrations.tsx`
- Updates made:
  - Wired Data, Help, and Integrations into `app/(app)/settings/page.tsx`.
- REAL:
  - Export My Data (downloads a placeholder JSON).
  - Clear History and Delete Account (UI + confirm flows with validation).
  - Help Center, Contact Support, Report a Problem, Terms of Service, Privacy Policy, About section.
  - Version number.
- COMING SOON:
  - API Keys (generation/revocation/view).
  - Connected Services (Google, GitHub, Discord).

## Phase 6 Status: Done
- Checked responsive behavior, focus trapping, and Esc functionality across all modals.
- Verified all 12 sections navigate correctly from Overview and Sidebar.
- Fixed Data modals to properly trap focus and respond to Esc.
- Build, lint, and typecheck verified.
