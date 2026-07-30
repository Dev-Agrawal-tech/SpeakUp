<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# SpeakUp — AI Agent Instructions

## Product
AI communication coach for Indian students.
Core loop: scenario → speak → AI feedback → retry

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (DB + Auth + Storage)
- Groq (Whisper STT + LLaMA feedback)
- Vercel deployment

## Folder Structure
- app/(auth)/ → login, signup, onboarding
- app/(app)/ → practice, progress, scenarios
- app/api/ → backend routes
- components/audio/ → recorder
- components/feedback/ → feedback UI
- lib/supabase/ → database client
- lib/groq/ → AI client

## Design Rules
- Dark theme #0A0A0A
- Blue accent #2563EB
- Mobile first
- shadcn/ui components only

## Code Rules
- TypeScript always
- Error handling in every function
- Loading states in every component
- Server components for data fetching
- Client components for interactivity only

## Database Tables
- users, scenarios, sessions, scores, 
  feedback_items, streaks, scenario_completions

## Current Features Done
- Auth (Google + Magic Link)
- Practice page with recorder
- Groq AI feedback
- Progress page
- Vercel deployment

## Next Features to Build
- Session history with replay
- 30 seed scenarios
- Real data in progress dashboard
- Daily challenge
- Design overhaul
- Hindi-English mode

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
