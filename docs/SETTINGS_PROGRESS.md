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
Phase 2 done: components/settings/profile.tsx, components/settings/security.tsx, components/settings/verification.tsx, app/(app)/settings/page.tsx; REAL: name, username, password change, email change; COMING SOON: avatar upload, bio, location, social links, active sessions signout, mobile OTP, 2FA setup
