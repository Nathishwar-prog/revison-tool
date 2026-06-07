 KnowGrow Platform (plos-b) — Reviewer Summary

## Overview
A Next.js app (App Router) that helps learners capture knowledge, schedule revisions with adaptive spaced repetition, and personalize study with AI. It uses Neon Postgres via Drizzle ORM, JWT auth, and optional AI providers (OpenRouter, Gemini) with a server proxy fallback.

## Core Features
- Knowledge library: CRUD for concepts with definition, simple explanation, code, mistakes, tags.
- Revision mode: Due queue, confidence logging, next due calculation, session UX.
- Dashboard: Daily progress, heatmap, quick tabs (due soon, mastered, struggling).
- AI assistance: Personalized summaries, quizzes, weak-area explanations, daily plan, study buddy chat.
- Collections: Associate knowledge with collections.
- Auth: Register/Login via JWT; protected APIs require `Authorization: Bearer <token>`.

## Architecture
- Frontend: Next.js 15 app in `src/app/*` with client components and pages.
- API routes: `/api/*` under `src/app/api/*` (Next Server Actions style) using Drizzle + Postgres.
- Data layer: Fetch via `ApiAdapter` and repository pattern (`src/data/repositories/*`).
- Domain logic: Revision policy, memory-decay metrics in `src/domain/revision/*`.
- AI layer: Providers + prompts in `src/ai/*`; runtime selection via localStorage or server proxy.
- Config: Tuning knobs in `src/config/app.config.ts`.

## Data Model (Drizzle / Postgres)
Defined in [src/lib/schema.ts](../src/lib/schema.ts).
- `users`: id, name, email, passwordHash, dailyRevisionTarget.
- `knowledge`: id, userId, title, type, domain, technology, difficulty, content (jsonb), tags (jsonb), confidenceLevel, revision (jsonb), createdAt.
- `revisionHistory`: id, knowledgeId, userId, confidenceGiven, revisedAt, timeTakenSeconds.
- `confidenceHistory`: id, knowledgeId, userId, confidence, recordedAt.
- `collections` + `collectionKnowledge`: group knowledge items.
- `chatSessions`, `chatMessages`, `aiSettings`: optional AI/chat persistence.

## Key Flows
- Authentication
  - POST `/api/auth/register` → create user, return JWT.
  - POST `/api/auth/login` → verify, return JWT.
  - GET `/api/auth/me` → resolve user via `Authorization` header.
- Knowledge
  - GET `/api/knowledge` → list user’s items with collections.
  - POST `/api/knowledge` → validate, insert; set initial `revision` (today, count 0).
  - GET `/api/knowledge/[id]`, PUT `/api/knowledge/[id]`, DELETE `/api/knowledge/[id]`.
- Revision
  - GET `/api/revision` → returns due queue: items with `revision.nextRevision` ≤ today or missing.
  - POST `/api/revision` → transactional write: `revisionHistory`, `confidenceHistory`, update `knowledge` (`revision`, `confidenceLevel`).
  - GET `/api/revision/history` → list history; filterable by `knowledgeId`.
- Dashboard
  - GET `/api/dashboard/daily-progress` → count today’s revisions vs `users.dailyRevisionTarget`.
  - GET `/api/dashboard/heatmap` → per-day revision counts for 6 months.
  - GET `/api/dashboard/knowledge-tabs` → dueSoon/mastered/struggling lists.
- AI
  - POST `/api/ai/proxy` → uses server `.env` keys to call OpenRouter, then Gemini; returns `AIResponse`.
  - GET/PUT `/api/ai/settings` → per-user provider config.

## Revision Logic
Implemented in [src/domain/revision/revision.engine.ts](../src/domain/revision/revision.engine.ts).
- Base intervals from confidence (1→1d, 2→2d, 3→4d, 4→7d, 5→14d) defined in `AppConfig.revision.baseIntervals`.
- Adaptive interval applies consistency boost and forget-rate penalty derived from history metrics in [memoryDecay.model.ts](../src/domain/revision/memoryDecay.model.ts).
- `processRevision(currentRevision, confidence)` → new `{ lastRevised, revisionCount, nextRevision }`.

## Frontend UX
- Dashboard ([src/app/page.tsx](../src/app/page.tsx))
  - Loads knowledge via `useKnowledge()` and stats via `/api/dashboard/*`.
  - Shows daily ring, streak, heatmap, and knowledge tabs.
- Knowledge
  - List ([src/app/knowledge/page.tsx](../src/app/knowledge/page.tsx)) with search/filter/sort.
  - Detail ([src/app/knowledge/[id]/page.tsx](../src/app/knowledge/%5Bid%5D/page.tsx)): actions (Ask AI, Revise, Edit, Delete), content sections.
  - Add ([src/app/knowledge/add/page.tsx](../src/app/knowledge/add/page.tsx)): `KnowledgeForm` posts to `/api/knowledge`.
- Revision ([src/app/revision/page.tsx](../src/app/revision/page.tsx))
  - Fetches due queue from `/api/revision`.
  - Flip card, set confidence (1–5), Submit → persists revision, advances queue.
  - Voice toggle (speech synthesis), keyboard shortcuts, confetti completion.

## AI Integration
- Client keys (optional) saved via `localStorage` in [src/ai/storage.ts](../src/ai/storage.ts).
- Provider selection: OpenRouter primary, Gemini fallback; otherwise server proxy or mock.
- Prompts: Summary/Quiz/Explain Weakness/Daily Plan/Chat builders in `src/ai/*` and `src/ai/prompts/*`.
- Server proxy uses `.env` keys (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`) to avoid exposing secrets to the client.

## Security & Environment
- Secrets in `.env`: `DATABASE_URL`, `JWT_SECRET`, AI keys.
- Ensure `.env` is excluded from VCS; rotate any leaked keys immediately.
- Auth tokens stored in `localStorage` for client requests; APIs validate `Authorization` header with JWT.
- Server DB connection in [src/lib/db.ts](../src/lib/db.ts) requires `DATABASE_URL`.

## Setup & Run
1. Environment
   - Create `.env.local` with:
     - `DATABASE_URL=postgresql://...` (Neon Postgres)
     - `JWT_SECRET=...` (rotate regularly)
     - `OPENROUTER_API_KEY=...` (optional)
     - `GEMINI_API_KEY=...` (optional)
2. Install & dev
   ```bash
   npm install
   npm run dev
   ```
   - App runs at http://localhost:3000
3. Build & start
   ```bash
   npm run build
   npm run start
   ```

## Testing & Validation (MVP)
- Manual flows: Register/Login, add knowledge, run revision, inspect dashboard.
- API smoke checks with curl/Postman for `/api/auth/*`, `/api/knowledge*`, `/api/revision*`.
- Drizzle schema aligns with Neon; ensure migrations (if any) are applied.

## Limitations & Next Steps
- Client-side token storage (localStorage) is simple but not the most secure.
- AI responses are plain text; consider structured validation and UI renderers.
- Add rate limiting and input sanitation on API routes.
- Add Drizzle migrations and seed scripts.
- Expand test coverage and error handling.
