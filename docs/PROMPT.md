# SpeakUp — Master Prompt

## Product
AI communication coach for Indian students, job seekers, 
and aspiring founders.

## Core Loop
Scenario → User speaks → Groq Whisper (STT) → 
Groq LLaMA (feedback) → Score → Retry

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (DB + Auth + Storage)
- Groq API (Whisper + LLaMA)
- Vercel deployment

## Live URL
https://speak-up-pi.vercel.app

## Supabase Project
https://rdehxlgrqpbvlknbzkwy.supabase.co

## Folder Structure
app/(auth)/login → /login
app/(auth)/signup → /signup
app/(auth)/onboarding → /onboarding
app/(app)/practice → /practice
app/(app)/progress → /progress
app/(app)/scenarios → /scenarios
app/(app)/settings → /settings
app/api/analyze → AI feedback endpoint
app/api/auth/callback → Auth callback

## Database Tables
users, scenarios, sessions, scores, 
feedback_items, streaks, scenario_completions

## Features Done
✅ Landing page
✅ Google Auth + Magic Link
✅ Onboarding page
✅ Practice page with recorder
✅ Groq Whisper STT
✅ Groq LLaMA AI feedback
✅ Score breakdown
✅ Progress page (basic)
✅ Vercel deployment

## Features To Build
❌ Session history with replay
❌ 30 seed scenarios in database
❌ Real data in progress dashboard
❌ Daily challenge feature
❌ Design overhaul
❌ Hindi-English mode
❌ Staged feedback (2-3 issues only)
❌ Improvement tracking attempt vs attempt
❌ Email automation (Resend)
❌ Analytics (PostHog)

## Design Rules
- Background: #0A0A0A
- Primary: #2563EB
- Text: white
- Mobile first
- Dark theme always
- shadcn/ui components

## Code Rules
- TypeScript always
- Error handling in every function
- Loading states in every component
- Server components for data fetching
- Client components only for interactivity
- Never expose API keys in frontend