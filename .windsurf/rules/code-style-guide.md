# Workspace Rules — Ukepenger project

## Project structure (DO NOT change)
- Next.js App Router lives in `/app`
- Supabase migrations live in `/supabase/migrations`
- Shared utilities live in `/lib`
Do not create alternative routing roots like `src/app` or new app directories.

## Database & migrations
- Never edit old migration files already run in Supabase.
- Schema changes must be done only by creating a NEW migration file.
- If a migration is needed, name it with date prefix: `YYYYMMDD_description.sql`.

## Auth
- Keep auth flows consistent.
- OAuth redirect must use: `${window.location.origin}/auth/callback`
- Never store service role keys in client components.

## Environment Variables
- Client safe: `NEXT_PUBLIC_*`
- Server only: `SUPABASE_SERVICE_ROLE_KEY`
Never paste secrets into code or commits.

## Vercel deployment expectations
- Vercel must deploy from branch: `main`
- Root directory should be project root `./`
- Deployment must show correct landing page and routes.

## Kids UI style
- Kids pages should be simple, colorful, big touch targets.
- Avoid dense tables.
- Prefer cards, icons, playful micro-feedback (sent state, progress, confetti-lite).

