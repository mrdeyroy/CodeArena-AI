# Plan: Seed 100 Real Problems + Basic Recommendation System

## Overview

Source ~100 real coding problems from LeetCode's public GraphQL API, insert into Supabase, wire them through the full stack (backend API → frontend), add lightweight submission status persistence, and build a rule-based recommendation system.

---

## Design Decisions (from user feedback)

- **Starter languages**: Python, C, C++, Java only
- **Status persistence**: Add lightweight `POST/PATCH /submissions/status` endpoint (DB-backed)
- **HTML content**: Convert LeetCode HTML descriptions to clean Markdown via `html2text`
- **Rate limits**: Cache fetched problems to local JSON for resumable seeding
- **Recommendation**: Rule-based scoring engine (concept mastery gaps + failed attempts)

---

## File Change List

### Step 1: Update DB Schema

**File: `backend/app/db/init.sql`**
- Add to `problems` table: `slug TEXT UNIQUE NOT NULL`, `acceptance_rate FLOAT DEFAULT 0.0`, `estimated_time TEXT DEFAULT ''`, `companies JSONB DEFAULT '[]'`, `starter_code JSONB DEFAULT '{}'`, `hints JSONB DEFAULT '[]'`, `editorial TEXT`, `source_url TEXT`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- Add `idx_problems_slug` index
- Create `user_problem_status` table: `id UUID PK`, `user_id UUID NOT NULL REFERENCES users`, `problem_id UUID NOT NULL REFERENCES problems`, `status TEXT NOT NULL (solved/attempted/unsolved)`, `updated_at TIMESTAMPTZ DEFAULT now()`, `UNIQUE(user_id, problem_id)`

### Step 2: Create Seed Script

**File: `backend/scripts/seed_problems.py`** (NEW)
- Fetch 100 problems from LeetCode GraphQL API in batches of 20
- Cache responses locally to `backend/scripts/leetcode_cache.json` for resumability
- Filter for difficulty diversity (~40 easy, ~40 medium, ~20 hard)
- Fetch per-problem details (hints, code snippets, companies, editorial)
- Convert HTML descriptions to Markdown via `html2text`
- Starter code: use LeetCode's provided snippets, filter to Python/C/C++/Java only
- Bulk-insert into Supabase

**File: `backend/pyproject.toml`** — add `html2text` dependency

### Step 3: Create Submission Status API

**File: `backend/app/api/submissions.py`** (NEW router)
- `GET /submissions/status?user_id=X&problem_id=Y` — fetch status for one problem
- `GET /submissions/status?user_id=X` — fetch all statuses for a user (for hydration)
- `POST /submissions/status` — upsert `{user_id, problem_id, status}`

Update `backend/app/main.py` to include the new router.

### Step 4: Update Pydantic Schemas

**File: `backend/app/schemas/schemas.py`**
- Add `UserProblemStatus` model
- Add `StatusUpdateRequest` and `StatusUpdateResponse`

### Step 5: Create Recommendation Engine

**File: `backend/app/recommendation/engine.py`** (NEW directory + file)
- `RecommendationEngine` class with:
  - `score_problem(problem, user_data)` — returns float score based on concept mastery gaps + failed attempts + difficulty appropriateness + novelty
  - `recommend(problems, user_data, n=5)` — scores all problems, returns top N with scores and reasons
  - `flag_recommended(problems, user_data)` — adds `is_ai_recommended` boolean to problem list

### Step 6: Create Problems API Endpoints

**File: `backend/app/api/problems.py`** (NEW router)
- `GET /problems` — list problems with filter params (difficulty, topic, company, search, user_id) and computed `status` + `is_ai_recommended`
- `GET /problems/{slug}` — full problem detail

Update `backend/app/main.py` to include the new router.

### Step 7: Update AI Recommend Endpoint

**File: `backend/app/api/ai.py`**
- Replace 8 hardcoded problem stubs in `/ai/recommend` with real data from Supabase

### Step 8: Create Frontend API Client

**File: `frontend/src/lib/api-client.ts`** (NEW)
- `fetchProblems(filters?)` — calls `GET /problems`
- `fetchProblemBySlug(slug)` — calls `GET /problems/{slug}`
- `fetchProblemStatus(userId)` — calls `GET /submissions/status`
- `updateProblemStatus(userId, problemId, status)` — calls `POST /submissions/status`

### Step 9: Create React Query Hooks

**File: `frontend/src/lib/hooks/use-problems.ts`** (NEW)
- `useProblems(filters?)` — React Query hook
- `useProblem(slug)` — React Query hook
- `useProblemStatus(userId)` — React Query hook for hydration

### Step 10: Add QueryClientProvider

**File: `frontend/src/app/providers.tsx`** (NEW)
- Wrap with `<QueryClientProvider>`

**File: `frontend/src/app/layout.tsx`**
- Wrap root layout children with `<Providers>`

### Step 11: Update Frontend Store

**File: `frontend/src/store/user-store.ts`**
- Add `setProblems(problems)` and `setSubmissions(submissions)` actions
- Remove hardcoded `mockProblems` import; state initializes as empty arrays
- `submitCode` still works in-memory but also calls `POST /submissions/status`
- On app load, hydration component fetches statuses via React Query and dispatches to store

### Step 12: Update Problem Pages

**File: `frontend/src/app/(app)/practice/page.tsx`**
- Replace direct `problems` from store with `useProblems(filters)` hook
- Pass filters from search/UI state to hook
- Map API response + local statuses from store

**File: `frontend/src/app/(app)/practice/[problemId]/page.tsx`**
- Replace store lookup with `useProblem(slug)` hook
- All data (description, examples, starter code, hints, editorial) from API

---

## Order of Implementation

1. DB schema update (`init.sql`)
2. Pydantic schema additions (status models)
3. Submission status API router
4. Main.py — register new routers
5. Seed script + run it
6. Recommendation engine
7. Problems API router
8. AI recommend endpoint update
9. Frontend API client
10. React Query hooks
11. Providers
12. Store updates
13. Problem page updates

---

## Verification

1. Run `python -m scripts.seed_problems` — confirms 100 problems inserted into Supabase with no errors
2. `GET /problems` returns ~100 problems with all fields
3. `GET /problems/two-sum` returns full problem detail including starter code (4 languages) + hints
4. `POST /submissions/status` stores status; `GET /submissions/status?user_id=X` returns it
5. Frontend loads problems from API (not mock data)
6. Status persists across page refresh (hydration from API on mount)
7. `GET /problems?user_id=X` returns `is_ai_recommended` flag on top recommendations
8. `POST /ai/recommend` uses real problem data, not stubs
