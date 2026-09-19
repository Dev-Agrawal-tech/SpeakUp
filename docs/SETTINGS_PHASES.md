NOTE: This file is an instruction prompt, NOT product documentation.
Ignore it when searching for product features, plans or limits.

GLOBAL RULES (apply to every phase):
Before building anything, also read these sections of docs/SETTINGS_UI_PROMPT.md and follow them throughout: Design Direction, Animations, UX Details, Backend / Data Safety, Responsiveness, Accessibility (Implementation Requirements), Code Quality, Completeness Constraints.

# PHASE 1

RULES (apply to every phase):
- Free-tier, limited tokens: be efficient, no long explanations, no unnecessary dependencies.
- Full spec is in `docs/SETTINGS_UI_PROMPT.md` (an instruction file, NOT product docs). Read only the parts for THIS phase.
- Reuse existing components, design tokens, icon library, animation solution and auth/backend. Don't touch unrelated code. Don't create a second auth or theme system.
- Never fake OTP, email verification, payments or security actions. Mark unsupported things "Coming Soon".
- If `docs/SETTINGS_PROGRESS.md` exists, read it first and do NOT rebuild finished work.

PHASE 1 TASK:
1. Inspect the project once: structure, styling system, routes, auth, sidebar component (see screenshot "Screenshot 2026-09-19 152015.png"), and product .md/README/PRD files (ignore the `prompts/` folder). Write a 15-line summary to `docs/SETTINGS_PROGRESS.md` (stack, design tokens, icon lib, animation lib, backend, product concept) so later phases skip re-scanning.
2. Sidebar: add a Settings gear button immediately LEFT of Logout, matching the existing icon style, with hover/focus states. Do not break the sidebar.
3. Create the `/settings` route (or the project's existing modal pattern if a route doesn't fit) with a smooth entrance animation.
4. Build: SettingsLayout (2-column: left nav with animated active indicator, right content that cross-fades; mobile = dropdown/horizontal scroll/drawer), SettingsHeader, SettingsSection, SettingsCard, reusable Toggle, Modal/ConfirmDialog (focus trap, Esc, return focus), and toast usage (reuse existing toast if any).
5. Settings Overview page: clickable cards for all 12 sections (Profile, Security, Verification, Subscription, Notifications, Privacy & Safety, Appearance, Language & Region, Data & Account, Help & About, API & Integrations, Accessibility) with one-line descriptions. Section pages can be empty stubs for now.
6. Create the plan config file (FREE/PLUS/PRO: name, price placeholder, currency configurable, features, limits, `available` flag; PLUS/PRO not available). Base features on product docs.
7. Add unsaved-changes guard utility (hook) for later forms.
8. Run build/lint/typecheck, fix errors you introduced. Append "Phase 1 done: <files>" to `docs/SETTINGS_PROGRESS.md`. Stop.
Final reply: max 8 lines.

# PHASE 2

RULES: same as Phase 1 (efficient, reuse everything, no fake functionality, read `docs/SETTINGS_PROGRESS.md` first, don't rebuild finished work, don't rescan the repo). Detailed spec: `docs/SETTINGS_UI_PROMPT.md` sections 1, 2, 3 only.

PHASE 2 TASK: build sections Profile, Account & Security, Verification inside the existing settings layout.

PROFILE: circular avatar with hover overlay (upload/change/remove, image preview, reuse existing upload system if any); first/last name (only if it fits the existing profile structure); username with Edit button, format validation and availability-check UI; bio textarea with character count and Save/Cancel; location; website; social links (Website, GitHub, X, LinkedIn if they fit the product); skills; interests; profile visibility; email/mobile display; "Member since" + active status tag; Preview profile button; Save Changes. Follow the existing profile structure, don't invent conflicting fields.

ACCOUNT & SECURITY: change password (current/new/confirm, strength indicator, show/hide); forgot password link if supported; active sessions/devices view; sign out other sessions (confirm dialog); last login; account status.

VERIFICATION: Email (current, green Verified badge, resend link, change email with new-email input + confirmation flow). Mobile (add/change number, send OTP, OTP input modal, resend with countdown, success state). 2FA (toggle, explanation of benefits, setup modal with QR placeholder, recovery codes UI, confirm before disabling).

Wire to the existing auth/backend ONLY where it already supports it (profile load/save, password change, email flow). Everything else: fully built interactive UI, clearly labeled Coming Soon, no fake success. Validation, loading, error/success toasts, unsaved-changes guard on all forms. Fully responsive.
Run build/lint/typecheck, fix your errors. Append "Phase 2 done: <files>; REAL: <list>; COMING SOON: <list>" to `docs/SETTINGS_PROGRESS.md`. Stop. Final reply: max 8 lines.

# PHASE 3 

RULES: same as Phase 1 (efficient, reuse everything, no fake functionality, read `docs/SETTINGS_PROGRESS.md` first, don't rebuild finished work, don't rescan the repo). Detailed spec: `docs/SETTINGS_UI_PROMPT.md` sections 4, 5, 6 only.

PHASE 3 TASK:

SUBSCRIPTION (UI-only, NO payments, nothing purchasable): driven entirely by the plan config file from Phase 1. Active-plan card "Current Plan: Free" with Active badge (default FREE). Pricing cards for FREE, PLUS, PRO plus a feature comparison matrix. PLUS/PRO buttons say "Upgrade — Coming Soon", styled nicely but DISABLED, with a clear note that paid plans aren't available yet. Billing Details placeholder: billing history empty state, payment methods empty state ("No payment method needed on the Free plan"). Don't install Stripe/Razorpay or write payment logic.

NOTIFICATIONS: grouped toggles. Security (login alerts, security notifications), Account activity, Product (updates, new features, newsletter), Reminders, Marketing (if relevant), Channels (email, in-app, push, SMS marked Coming Soon if no SMS backend), In-app extras (sounds, toast popups, desktop notifications). Save with toast, unsaved-changes guard.

PRIVACY & SAFETY: profile visibility, who can view profile, who can contact me, activity visibility, online status (if applicable), analytics sharing, AI training/data-improvement consent (only if product uses AI), personalization, blocked users and report/safety only if they fit the product. Follow the product docs; no unnecessary social features.

Persist to existing backend/settings storage if available, otherwise localStorage behind a small settings-store abstraction so a DB can replace it later. Fully responsive, accessible.
Run build/lint/typecheck, fix your errors. Append "Phase 3 done: <files>; REAL: <list>; COMING SOON: <list>" to `docs/SETTINGS_PROGRESS.md`. Stop. Final reply: max 8 lines.

# PHASE 4

RULES: same as Phase 1 (efficient, reuse everything, no fake functionality, read `docs/SETTINGS_PROGRESS.md` first, don't rebuild finished work, don't rescan the repo). Detailed spec: `docs/SETTINGS_UI_PROMPT.md` sections 7, 8, 12 only.

PHASE 4 TASK (make these REAL, not mock):

APPEARANCE: use the EXISTING theme system only. Theme cards with previews (Dark/Light/System); if the site is intentionally dark-only, preserve that and adapt the section. Accent color swatches (Purple, Blue, Emerald, Rose) only if the design tokens support it (apply via CSS variables). UI density Compact/Normal/Relaxed. Animation preference.

LANGUAGE & REGION: display language (only languages the app supports, others marked Coming Soon), time zone (auto-detect or manual), date format, time format, default AI model/voice selector ONLY if it fits the product per the docs. Good searchable select UX.

ACCESSIBILITY: Reduce Motion toggle (must actually reduce/disable app animations and respect `prefers-reduced-motion`), High Contrast toggle, Font Size slider. Font size/density share ONE state with Appearance, no duplicated logic.

Apply all settings globally on load (CSS classes/variables on the root element), persisted via existing backend settings or localStorage (with no flash of wrong theme on load). Keep everything in one shared settings store/hook. Responsive and keyboard accessible.
Run build/lint/typecheck, fix your errors. Verify the rest of the app still looks correct in every theme/density. Append "Phase 4 done: <files>" to `docs/SETTINGS_PROGRESS.md`. Stop. Final reply: max 8 lines.

# PHASE 5

RULES: same as Phase 1 (efficient, reuse everything, no fake functionality, read `docs/SETTINGS_PROGRESS.md` first, don't rebuild finished work, don't rescan the repo). Detailed spec: `docs/SETTINGS_UI_PROMPT.md` sections 9, 10, 11 only.

PHASE 5 TASK:

DATA & ACCOUNT: "Export My Data" (profile + usage history as JSON; if the backend supports it, generate a real download of the user's own data, otherwise UI + integration placeholder), data usage information, clear history (only where it exists, with confirm), deactivate account (confirm), delete account. Danger Zone: red-highlighted section with a clear warning and a strong confirmation flow (type "DELETE" to confirm, Cancel/Delete buttons). Do NOT actually delete data unless the existing backend supports it safely.

HELP & ABOUT: Help Center, Contact Support, Report a Problem, FAQ, Terms of Service, Privacy Policy, About the app (from product docs), version number shown subtly at the bottom (read from package.json/env). Reuse existing links/pages if present.

API & INTEGRATIONS (only if it fits the product, else clean Coming Soon): API keys list (masked, copy, generate, revoke, empty state). Connected services Google, GitHub, Discord with proper logos and connected/not-connected status. If the project already has OAuth providers, wire real connect/disconnect (never allow unlinking the last login method). Otherwise mark "Coming Soon". Never fake key generation.

Loading states, error/success toasts, confirm dialogs, fully responsive (no horizontal overflow on API key and integration rows).
Run build/lint/typecheck, fix your errors. Append "Phase 5 done: <files>; REAL: <list>; COMING SOON: <list>" to `docs/SETTINGS_PROGRESS.md`. Stop. Final reply: max 8 lines.

# PHASE 6

RULES: efficient, no long explanations, don't add dependencies, don't rewrite working code. Read `docs/SETTINGS_PROGRESS.md` first.

PHASE 6 TASK (verification only):
1. Run build, lint and typecheck. Fix every error and warning related to the settings work.
2. Check all 12 sections open from both the Overview cards and the left nav, on desktop, tablet and mobile widths: no horizontal overflow, mobile nav works.
3. Check every interactive element has hover, focus, disabled, loading, success and error states; dialogs trap focus and close on Esc; unsaved-changes guard works.
4. Confirm the sidebar gear button looks native, and that existing features (sidebar navigation, logout, other pages) still work.
5. Confirm no fake success anywhere: unsupported features are labeled Coming Soon, and PLUS/PRO upgrade buttons are disabled.
6. Fix issues found, minimal edits only.

FINAL REPLY (concise only):
1. What you changed
2. Settings sections added
3. Features that are actually functional
4. Features that are UI / Coming Soon
5. Important files created or modified
6. Errors that still need my attention