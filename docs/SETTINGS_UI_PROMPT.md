NOTE: This file is an instruction prompt, NOT product documentation.
Ignore it when searching for product features, plans or limits.

Product docs to read first (source of truth for the product):
- docs/PROMPT.md
- docs/_prd_extract/ (extracted text of the PRD)
- docs/SpeakUp_PRD_v1.0.docx, docs/SpeakUp_PRD_V1_1.docx, docs/SpeakUp_TRD_v1.0.docx  Che
- docs/SETTINGS_PHASES.md
- AGENTS.md and CLAUDE.md in the project root

--------------------------------------------------------

I want you to implement a complete, polished SETTINGS SYSTEM for my existing website.

IMPORTANT:
- I am currently using the FREE version of Antigravity.
- I have limited tokens, so be efficient.
- Do NOT waste tokens explaining what you are going to do.
- First inspect the existing project structure and understand the current UI/UX, components, styling system, routes, authentication structure, database/schema if present, and reusable components.
- BEFORE implementing anything, search the entire repository for relevant .md files, documentation, README files, PRDs, feature descriptions, and existing code that explains my website/product idea.
- Use those existing documents as the source of truth for product-specific features.
- Do NOT replace my existing architecture unnecessarily.
- Do NOT create duplicate components when reusable components already exist.
- Do NOT modify unrelated parts of the website.

I have attached a screenshot named "Screenshot 2026-09-19 152015.png" showing the current dark-themed sidebar design. Analyze it carefully and verbatim (layout, spacing, icon style, colors, typography, borders, hover states) and use it as the visual reference for the settings entry point and for the overall look of the Settings experience.

==================================================
CURRENT SIDEBAR REQUIREMENT
==================================================

At the bottom of the sidebar there is currently something similar to:

[ Avatar ]
aryan_12
Free Plan                         [Logout]

I want a SETTINGS/Gear button added beside the logout button (immediately to the LEFT of the existing Logout button).

The bottom area should become something like:

[ Avatar ]  aryan_12
            Free Plan       [⚙ Settings] [Logout]

The settings icon (gear / <Settings /> from the existing icon library) must visually match the existing sidebar icon style.

When the user clicks the Settings button:
- Open a beautiful dedicated Settings experience.
- Prefer a dedicated `/settings` route/page if that matches the current architecture.
- Otherwise use the existing navigation/modal pattern of the project. If a modal/overlay is used, make it a spacious centered modal (or sleek slide-over panel) with a frosted glassmorphism backdrop and a smooth fade + scale entrance/exit.
- Do NOT break the sidebar.
- The transition should feel smooth and professional.

==================================================
MAIN SETTINGS EXPERIENCE
==================================================

Create a modern, premium-quality Settings interface.

The Settings page should have a 2-column layout:

LEFT SIDE:
A settings navigation menu with the different sections (tab navigation with an animated active-state indicator/slider).

RIGHT SIDE:
The selected settings section and its controls (dynamic content container that transitions smoothly when the selected section changes, with Save / Cancel controls where applicable).

On mobile:
- Make the settings navigation responsive.
- It can become a dropdown, horizontal scroll menu, drawer, or other appropriate responsive solution.
- The experience must remain easy to use.

The design should feel like a real production SaaS application, not a basic student dashboard.

Use:
- Clean spacing
- Strong visual hierarchy
- Beautiful cards
- Subtle borders and smooth shadows
- Proper hover states
- Smooth transitions
- Good, high-quality typography
- Consistent iconography
- Proper empty states
- Confirmation dialogs where necessary
- Toast notifications for successful actions (e.g. when clicking "Save Changes")
- Loading states where appropriate
- Skeletons where useful
- Responsive design
- Accessibility-friendly controls
- Clear visual feedback on input focus

Use animations ONLY where they improve UX.
Do not over-animate everything.

==================================================
SETTINGS SECTIONS
==================================================

Create AT LEAST these 10 sections (this prompt defines 12; build all of them, adapting or omitting only what clearly does not fit my product per the repository documentation).

1. PROFILE

This section should allow the user to manage their public profile.

Include:

- Profile photo/avatar (circular, with an "Edit/Upload" hover overlay)
- Upload profile photo
- Change profile photo
- Remove profile photo
- Profile name (First / Last name if it fits the existing profile structure)
- Username
- Bio
- Email display information if appropriate
- Mobile number display if appropriate
- Location
- Website/portfolio URL
- Social links: Website, GitHub, Twitter/X, LinkedIn (only if they fit the product)
- Skills
- Interests
- Profile visibility
- Account status: account creation date ("Member since") and an active status tag
- Preview profile button
- "Save Changes" button

Username:
- Show current username.
- Add an Edit button.
- If appropriate, show username availability checking UI.
- Prevent obviously invalid usernames.

Profile photo:
- Show current avatar.
- Upload/change/remove options.
- Beautiful image preview UI.
- If the project already has an image upload system, reuse it.

Bio:
- Editable textarea.
- Character count.
- Save / Cancel behavior.

IMPORTANT:
Follow the existing profile structure from my project.
Do not invent fields that conflict with my existing product idea.

--------------------------------------------------
2. ACCOUNT & SECURITY
--------------------------------------------------

Create a proper account security section.

Include:

- Change password
- Current password
- New password
- Confirm new password
- Password strength indicator
- Show/hide password
- Forgot password flow if already supported
- Active sessions/devices ("View Active Sessions")
- Sign out of other sessions
- Last login information if available
- Account status

For dangerous actions:
Use confirmation dialogs.

Example:
"Sign out of all other devices?"

Do not implement fake security functionality if the backend/auth system does not support it.

If backend support is missing:
- Build the complete UI
- Clearly structure it so real backend functionality can be connected later
- Do not pretend a security action actually happened

--------------------------------------------------
3. VERIFICATION
--------------------------------------------------

Create a dedicated Verification section (Email, Mobile, 2FA).

Include:

EMAIL:
- Current email
- Email verification status
- Verified badge/status (green "Verified" badge)
- Send / Resend verification email (verification link)
- Change email ("Change Email" button)
- New email input
- Confirmation flow

MOBILE:
- Current mobile number
- Mobile verification status
- Add mobile number ("Add/Verify Number")
- Change mobile number
- Send OTP
- OTP input (OTP verification modal)
- Resend OTP
- Countdown timer
- Verification success state

TWO-STEP VERIFICATION / 2FA:
- Enable/disable 2-step verification (toggle switch)
- Explain why it improves account security
- OTP/authenticator option if compatible with existing architecture
- Setup guide modal with QR code placeholder (clearly marked as a placeholder if the backend is missing)
- Backup/recovery codes UI if appropriate
- Confirmation before disabling 2FA

IMPORTANT:
Do not fake actual OTP/email verification if backend functionality does not exist.

Build the UI and integration points cleanly.
If authentication infrastructure already exists, integrate with it rather than creating another auth system.

--------------------------------------------------
4. SUBSCRIPTION / PLAN
--------------------------------------------------

Create a beautiful subscription section (title e.g. "Subscription & Plans").

IMPORTANT:
This is currently ONLY FOR UI/PRODUCT PREPARATION (mockup mode).

There is NO REAL PAYMENT SYSTEM yet.

Nobody should be able to actually purchase a plan.

The default current plan MUST be:

FREE PLAN

Create these plans:

FREE
PLUS
PRO

The plan structure should be based on the features and product idea already documented in my repository `.md` files.

First inspect those files and existing product documentation.
If existing plan specs exist in the repo, use them to automatically populate the tier features.

Do not blindly invent random limits.

If the documentation does not specify exact limits, create sensible placeholder limits while keeping them clearly configurable.

Example structure:

FREE
- Basic access / core features
- Limited daily usage (basic daily token/usage limits)
- Basic profile
- Basic conversation/practice features
- Basic progress/history
- Community support
- etc.

PLUS
- Everything in Free
- Higher/increased limits
- Faster response times
- Priority access
- More advanced features
- etc.

PRO
- Everything in Plus
- Highest limits / unlimited usage where the product allows
- Priority models
- Advanced features
- Dedicated support
- Custom integrations
- etc.

Placeholder pricing (must live in config, easy to change, currency configurable):
- FREE: ₹0 (or $0/mo)
- PLUS: placeholder e.g. $9.99/mo
- PRO: placeholder e.g. $19.99/mo
Show pricing as "Coming Soon" wherever paid plans are not purchasable.

IMPORTANT:
Do NOT implement Stripe/Razorpay/payment processing right now.

Instead:

- Show "Current Plan: Free"
- Show "Free" as active (Active tier card with an "Active" badge)
- Show Plus and Pro as upgrade options
- Buttons can say:
  "Coming Soon"
  or
  "Upgrade — Coming Soon"
- Upgrade buttons must be styled nicely but DISABLED (visual/placeholder only, no payment logic)
- Clearly indicate that paid plans are not available yet.

Add a beautiful plan comparison UI (pricing cards + feature comparison matrix/grid).

For example:

CURRENT PLAN
FREE
₹0
Current Plan

PLUS
Coming Soon
[Upgrade — Coming Soon]

PRO
Coming Soon
[Upgrade — Coming Soon]

Also include a Billing Details placeholder area:
- Billing history (empty state)
- Payment methods (empty state, "No payment method needed on the Free plan")

Make the cards visually attractive.

Do NOT allow the user to accidentally purchase anything.

Make the subscription architecture easy to connect to a real payment system later.

--------------------------------------------------
5. NOTIFICATIONS
--------------------------------------------------

Create notification settings.

Include:

- Email notifications
- In-app notifications
- Push notifications
- SMS notifications (only if appropriate / clearly marked coming soon if no SMS backend)
- Security alerts
- Account activity
- Product updates
- New feature announcements
- Newsletter
- Reminders
- Marketing/promotional notifications if relevant
- In-app extras: notification sounds, toast popups, desktop notifications
- Notification preferences

Use clean toggle switches.

Group related notification settings.

Example:

SECURITY
✓ Login alerts
✓ Security notifications

PRODUCT
✓ Product updates
✓ New features

--------------------------------------------------
6. PRIVACY & SAFETY
--------------------------------------------------

Create privacy controls.

Include appropriate options such as:

- Profile visibility
- Who can view profile
- Who can contact the user
- Activity visibility
- Online status if applicable
- Data sharing preferences (usage analytics sharing)
- AI model training / data-improvement consent (if the product uses AI)
- Personalization settings
- Blocked users if relevant
- Report/safety options if relevant

Follow the actual product concept found in my documentation.

Do not add unnecessary social-media features if they don't fit the website.

--------------------------------------------------
7. APPEARANCE
--------------------------------------------------

Create appearance settings.

Include:

- Theme (selectable cards with previews)
  - Dark
  - Light
  - System
- Accent color (circles/swatches: Purple, Blue, Emerald, Rose) if the existing design system supports it
- Font size and UI density: Compact / Normal (Comfortable) / Relaxed
- Animation preferences
- Compact/comfortable layout if appropriate

IMPORTANT:
Respect the existing theme system.

Do not create a second independent theme system.

If my website is intentionally dark-only, preserve that design and adapt this section accordingly rather than forcing a light theme.

--------------------------------------------------
8. LANGUAGE & REGION
--------------------------------------------------

Create:

- Language (Display Language: English, Spanish, French, German, etc. — only those the app can actually support or clearly mark others as coming soon)
- Time zone (auto-detect or manual selection)
- Locale/Date format
- Time format
- Default AI model / voice selector for daily conversations (ONLY if it fits the product per the docs)

Only include options that make sense for the current application.

Use dropdown/select components with good UX.

--------------------------------------------------
9. DATA & ACCOUNT
--------------------------------------------------

Create a section for account/data management.

Include:

- Download/export personal data (personal usage history and profile data as JSON, request/download button — "Export My Data")
- Data usage information
- Clear history where applicable
- Delete account
- Deactivate account if appropriate
- Danger Zone: a distinct, red-highlighted area at the bottom with a clear warning

Dangerous actions should use a strong confirmation flow.

Example:

Delete Account

"This action may permanently delete your account and associated data."

[Cancel]
[Delete Account]

Do NOT actually permanently delete data unless the existing backend supports it safely.

If it does not:
Create the UI and appropriate integration placeholder.

--------------------------------------------------
10. HELP & ABOUT
--------------------------------------------------

Create:

- Help Center
- Contact Support
- Report a Problem
- FAQ
- Terms of Service
- Privacy Policy
- About the application
- Version number (displayed subtly at the bottom)

Reuse existing links/content if they already exist.

--------------------------------------------------
11. API & INTEGRATIONS (only if it fits the product; otherwise build as clean Coming Soon)
--------------------------------------------------

Include:

API KEYS:
- View (masked) / copy user API keys
- Generate new key
- Revoke existing keys
- Empty state when no keys exist

CONNECTED SERVICES:
- List of integrations: Google, GitHub, Discord (proper logos/icons)
- Connect / Disconnect buttons or toggles with connected/not-connected status

IMPORTANT:
Do not fake API key generation or OAuth connections. If backend/OAuth support does not exist, build the full UI, mark it "Coming Soon", and structure it for later integration. If the project already has OAuth providers (e.g. Supabase auth providers), reuse them for real connect/disconnect.

--------------------------------------------------
12. ACCESSIBILITY
--------------------------------------------------

Include:

- Reduce Motion toggle (must actually disable/reduce the app's animations, and respect `prefers-reduced-motion`)
- High Contrast Mode toggle
- Font Size slider (can share state with the Appearance font size/density setting — do not duplicate the logic)

Make these real and persisted wherever it is safely possible (e.g. via CSS variables/classes and localStorage or the user's settings record).

==================================================
SETTINGS HOME / OVERVIEW
==================================================

When `/settings` is opened, initially show a Settings Overview.

Example:

Settings

Manage your account, security, preferences and subscription.

Profile
Manage your personal information and public profile.

Security
Protect your account and manage login settings.

Verification
Verify your email and mobile number.

Subscription
Manage your current plan.

Notifications
Control how you receive notifications.

Privacy & Safety
Manage visibility and privacy.

Appearance
Customize your experience.

Language & Region
Manage language and regional preferences.

Data & Account
Manage your data and account.

Help & About
Get help and view application information.

API & Integrations
Manage API keys and connected services.

Accessibility
Adjust motion, contrast and text size.

Each card should be clickable.

==================================================
DESIGN DIRECTION
==================================================

The existing website already has a dark modern interface.

Maintain the existing visual language.

The UI should feel:

- Modern
- Premium
- Minimal
- Elegant
- Professional
- Student-friendly
- SaaS-quality
- Consistent with the existing application
- Dark-mode optimized, matching the sidebar in the screenshot

Use the current project's colors, fonts, spacing, buttons, cards, shadows, borders and design tokens wherever possible.

DO NOT randomly introduce a completely new color palette.

If the project already has a component library/design system:
USE IT.

If icons are already installed:
USE THEM.

Do not add another icon library unnecessarily.

==================================================
ANIMATIONS
==================================================

Use subtle animations where they improve UX.

Examples:

- Settings page/modal entrance animation (fade + scale)
- Sidebar settings button hover
- Card hover
- Tab/section transitions (animated active-tab indicator, smooth content cross-fade)
- Toggle animation
- Modal entrance/exit
- Toast animation
- Profile image hover overlay
- Plan card interaction
- Button micro-interactions on hover and tap
- Input focus feedback

Keep animations fast and smooth (buttery, Framer Motion style).

Use Framer Motion ONLY if it is already installed in the project. Otherwise use the existing animation solution or plain CSS transitions. Do not install heavy animation libraries.

Avoid:
- Excessive bouncing
- Constant floating elements
- Distracting animations
- Heavy animation libraries if they are not already installed

Prefer the existing animation solution in the project.

Respect the Reduce Motion setting and `prefers-reduced-motion`.

==================================================
UX DETAILS
==================================================

Make sure every interactive element has:

- Hover state
- Focus state
- Disabled state
- Loading state where needed
- Success feedback
- Error feedback

Forms should have:

- Validation
- Clear labels
- Helpful error messages
- Save
- Cancel
- Unsaved changes handling where appropriate

If the user changes something and navigates away:
show an "Unsaved changes" confirmation if appropriate.

==================================================
BACKEND / DATA SAFETY
==================================================

VERY IMPORTANT:

First inspect the current backend and database.

If Supabase/auth/database already exists:
reuse the existing implementation.

Do not create a second authentication system.

Do not create duplicate user tables.

Do not expose sensitive user information.

For settings that require backend support but don't currently exist:

Build the UI and structure it for future implementation.

Clearly separate:

REAL FUNCTIONALITY
from
MOCK / COMING SOON FUNCTIONALITY.

Do not pretend that fake OTP, fake email verification, fake payments, or fake security operations are real.

==================================================
SUBSCRIPTION LOGIC
==================================================

Create a clean plan configuration structure so the plans can easily be changed later.

For example, conceptually:

FREE
PLUS
PRO

The user's initial/default plan must be FREE.

The UI should be driven by plan configuration rather than hardcoding the same information in multiple components.

Make it easy for me to later connect:

- Stripe
- Razorpay
- another payment provider

But DO NOT install or implement payment processing now unless the project already has it.

==================================================
RESPONSIVENESS
==================================================

The entire settings system must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Pay special attention to:

- Sidebar
- Settings navigation
- Forms
- Plan cards
- Modals
- Profile editing
- Verification forms
- API key lists and integration rows

No horizontal overflow.

==================================================
ACCESSIBILITY (IMPLEMENTATION REQUIREMENTS)
==================================================

Use:

- Semantic HTML
- Proper labels
- Keyboard navigation
- Visible focus states
- Accessible buttons
- Accessible dialogs (focus trap, Esc to close, return focus)
- Good color contrast
- ARIA only where needed

==================================================
CODE QUALITY
==================================================

Follow the project's existing coding conventions.

Keep components modular.

For example, use reusable components conceptually like:

SettingsLayout
SettingsSidebar
SettingsSection
SettingsCard
SettingsHeader
ProfileSettings
SecuritySettings
VerificationSettings
SubscriptionSettings
NotificationSettings
PrivacySettings
AppearanceSettings
LanguageSettings
DataSettings
HelpSettings
IntegrationsSettings
AccessibilitySettings

(Naming such as Profile.tsx, Security.tsx, Subscription.tsx, Appearance.tsx, Notifications.tsx, Integrations.tsx, Privacy.tsx, Preferences.tsx is equally fine — follow the project's existing naming pattern.)

BUT:
Do not create all of these blindly if the project architecture uses another pattern.

Reuse existing components whenever possible.

Avoid one giant settings component.

Keep the code maintainable.

==================================================
COMPLETENESS CONSTRAINTS
==================================================

- The code must be complete, responsive and ready to render.
- Build the actual inputs, toggles, sliders, dropdowns, cards, modals and lists. Do NOT leave empty placeholder boxes or "TODO" UI.
- Where backend support is missing, the UI itself must still be fully built and interactive (local state, validation, toasts), with clearly labeled Coming Soon / integration points instead of fake success.

==================================================
VERY IMPORTANT: BEFORE CODING
==================================================

Follow this process:

STEP 1
Inspect the project.

STEP 2
Find and read relevant `.md`, README, PRD, documentation and feature files.

STEP 3
Understand the existing product idea and existing features.

STEP 4
Inspect the current sidebar shown in the attached screenshot ("Screenshot 2026-09-19 152015.png") and find the actual sidebar component.

STEP 5
Inspect the existing user/profile/auth/subscription-related code.

STEP 6
Create a concise implementation plan internally.

STEP 7
Implement the settings system.

STEP 8
Run the project/build/lint/type checking if available.

STEP 9
Fix any errors you introduced.

STEP 10
Verify that existing functionality still works.

==================================================
IMPORTANT TOKEN / ANTIGRAVITY INSTRUCTION
==================================================

I am using the FREE version of Antigravity and currently have limited tokens.

Therefore:

- Be efficient.
- Do not repeatedly scan the same files unnecessarily.
- Do not generate huge explanations.
- Do not rewrite working code without reason.
- Do not install unnecessary dependencies.
- Reuse existing components.
- Reuse existing CSS/design tokens.
- Make focused changes.
- Do not refactor unrelated code.
- Prioritize implementation over explaining every step.

If you discover that a requested feature already exists partially:
EXTEND IT instead of rebuilding it.

==================================================
FINAL QUALITY BAR
==================================================

The final result should look like a real production SaaS settings system.

It should NOT look like:

- A basic HTML settings page
- A generic template
- A collection of random forms
- An unfinished dashboard
- A UI generated without understanding the existing project

It should feel like it belongs naturally inside my existing application.

The settings button in the sidebar should feel like it was always part of the product.

The Settings page should have excellent UI/UX, spacing, hierarchy, responsiveness, animations and interaction states.

MOST IMPORTANT:

Do not only create the visual UI.

Connect every setting that can safely be connected to the existing application.

For functionality that requires infrastructure that does not yet exist, create a clean "Coming Soon" / integration-ready implementation instead of fake functionality.

After implementation, give me ONLY a concise summary containing:

1. What you changed
2. Which settings sections were added
3. Which features are actually functional
4. Which features are UI/Coming Soon
5. Any important files/components created or modified
6. Any errors that still need my attention
7. Need to add api or need to improve backend for verification purpose 
8. Needed to add something in project for safety purpose 