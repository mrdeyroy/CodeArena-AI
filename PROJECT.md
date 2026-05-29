# CodeArena AI — Project Documentation

> **AI-powered competitive programming & interview preparation platform.**
> Tracks skill mastery across a dynamic prerequisite graph, generates adaptive learning paths, runs AI mock interviews, and provides a personal AI coding mentor that diagnoses *why* you're stuck.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Core Engines & Services](#core-engines--services)
9. [AI Agents](#ai-agents)
10. [State Management (Frontend)](#state-management-frontend)
11. [Frontend Routes & Pages](#frontend-routes--pages)
12. [Data Pipeline: Problems & Recommendations](#data-pipeline-problems--recommendations)
13. [Seeding Problems from LeetCode](#seeding-problems-from-leetcode)
14. [Submission Status Persistence](#submission-status-persistence)
15. [Environment Variables](#environment-variables)
16. [Running the Project](#running-the-project)
17. [Competitive Analysis](#competitive-analysis)

---

## Project Overview

CodeArena AI goes beyond traditional coding platforms. Most platforms only answer
*"Was the solution correct?"* — CodeArena answers:

- **Why did the student fail?**
- **What concept is weak?**
- **What should they practice next?**
- **How interview-ready are they?**
- **What learning path should they follow?**

The platform combines a **dynamic skill graph engine**, **AI mentor agents**, **deterministic readiness scoring**, **code execution sandbox**, and **mock interview system** into a unified developer growth operating system.

---

## Tech Stack

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Language | Python | 3.12+ |
| Framework | FastAPI | 0.115+ |
| Server | Uvicorn (standa rd) | 0.30+ |
| Validation | Pydantic | v2 |
| Settings | pydantic-settings | 2.0+ |
| Database | Supabase (PostgreSQL) | 2.0+ |
| AI/LLM | OpenAI SDK (provider-agnostic) | 1.0+ |
| HTTP Client | httpx (async) | 0.27+ |
| Package Manager | uv (with pip fallback) | — |
| Build System | hatchling | — |

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| State Management | Zustand | 5.0.14 |
| Data Fetching | TanStack React Query | 5.100.14 |
| Code Editor | Monaco Editor (@monaco-editor/react) | 4.7.0 |
| Graph Viz | @xyflow/react | 12.10.2 |
| Charts | Recharts | 3.8.1 |
| Animation | Framer Motion | 12.40.0 |
| Forms | React Hook Form + Zod | 7.76.1 / 4.4.3 |
| Icons | Lucide React | 1.17.0 |
| Linting | ESLint (next/core-web-vitals + typescript) | 9.x |

### Infrastructure

| Category | Technology |
|----------|-----------|
| Database | Supabase (Auth, DB, Storage) |
| Code Execution | Piston API (default public; self-hostable) |
| AI Provider | OpenAI-compatible (OpenAI, OpenRouter, Groq, Together, DeepInfra) |

---

## Repository Structure

```
CodeArena-AI/
│
├── PROJECT.md                  ← This file
├── comparision.md              ← Competitive analysis matrix
│
├── backend/                    ← FastAPI backend
│   ├── .env                    ← Environment (gitignored)
│   ├── .env.example            ← Environment template
│   ├── pyproject.toml          ← Python project config (incl. html2text)
│   ├── requirements.txt        ← Pip fallback deps
│   ├── uv.lock                 ← uv lockfile
│   ├── README.md               ← Backend-specific readme
│   ├── PROMPT.md               ← Original architecture spec prompt
│   │
│   ├── scripts/                ← Utility and seed scripts
│   │   ├── seed_problems.py    ← Fetches 100 problems from LeetCode → Supabase
│   │   ├── leetcode_cache.json ← Cache of fetched problem list (auto-generated)
│   │   └── leetcode_details_cache.json ← Per-problem detail cache (auto-generated)
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py             ← FastAPI entry point
│       ├── config.py           ← Pydantic Settings (env vars)
│       │
│       ├── api/                ← FastAPI route handlers
│       │   ├── ai.py           → /ai/*
│       │   ├── analytics.py    → /analytics/*
│       │   ├── auth.py         → /auth/*
│       │   ├── coach.py        → /coach/*
│       │   ├── contests.py     → /contests/*
│       │   ├── execute.py      → /execute
│       │   ├── graph.py        → /graph
│       │   ├── interview.py    → /interview/*
│       │   ├── problems.py     → /problems/*  (list, detail, run, submit)
│       │   ├── readiness.py    → /readiness
│       │   ├── speech.py       → /speech/*
│       │   ├── submissions.py  → /submissions/status (NEW — lightweight sync)
│       │   └── telemetry.py    → /telemetry
│       │
│       ├── ai/                 ← AI agent implementations
│       │   └── agents.py       → Hint, Explain, Coach, Roadmap, Recommend, Plagiarism
│       │
│       ├── graph/              ← Skill prerequisite DAG engine
│       │   └── engine.py       → SkillGraphService
│       │
│       ├── telemetry/          ← Mastery + struggle scoring
│       │   └── engine.py       → TelemetryEngine
│       │
│       ├── readiness/          ← Interview readiness (deterministic, no AI)
│       │   └── engine.py       → ReadinessEngine
│       │
│       ├── services/           ← External service integrations
│       │   ├── piston.py       → PistonService (code execution)
│       │   ├── interview.py    → InterviewService (AI question gen + eval)
│       │   └── speech.py       → SpeechService (STT/TTS abstraction)
│       │
│       ├── schemas/            ← Pydantic v2 request/response models
│       │   └── schemas.py      → All data models (enums, requests, responses)
│       │
│       ├── db/                 ← Supabase integration
│       │   ├── supabase.py     → Supabase client singleton
│       │   ├── operations.py   → Reusable DB helpers (fetch_problems, insert_submission, etc.)
│       │   ├── init.sql        → Full DDL (11 tables + indexes + user_problem_status)
│       │   └── mock-data.json  → Fallback metadata for 5 seed problems
│       │
│       ├── auth/               ← Auth module (Supabase JWT)
│       │   └── auth.py         → require_user / optional_user dependencies
│       │
│       ├── models/             ← ORM-style models (placeholder)
│       │   └── __init__.py
│       │
│       └── utils/              ← Shared utilities (placeholder)
│           └── __init__.py
│
└── frontend/                   ← Next.js frontend
    ├── package.json            ← Node dependencies
    ├── tsconfig.json           ← TypeScript config
    ├── next.config.ts          ← Next.js config
    ├── postcss.config.mjs      ← PostCSS (Tailwind v4)
    ├── eslint.config.mjs       ← ESLint flat config
    ├── AGENTS.md               ← Agent guardrails
    ├── CLAUDE.md               ← Points to AGENTS.md
    ├── backend.md              ← Backend API architecture spec (253 lines)
    ├── README.md
    │
    ├── public/                 ← Static assets
    │   └── *.svg               → file, globe, next, vercel, window icons
    │
    └── src/
        ├── app/
        │   ├── layout.tsx      ← Root layout (dark theme, Geist fonts)
        │   ├── globals.css     ← Global styles
        │   ├── favicon.ico
        │   │
        │   ├── (marketing)/    ← Landing page route group
        │   │   ├── layout.tsx
        │   │   └── page.tsx    ← Full landing page (430 lines)
        │   │
        │   ├── (auth)/         ← Auth route group
        │   │   ├── layout.tsx
        │   │   ├── login/
        │   │   └── register/
        │   │
        │   └── (app)/          ← Authenticated app route group
        │       ├── layout.tsx  ← Shell layout (sidebar + navbar + AI panel, fetches problems on mount)
        │       ├── providers.tsx ← QueryClientProvider for React Query (NEW)
        │       ├── dashboard/
        │       ├── practice/
        │       │   ├── page.tsx           ← Explorer with filters (reads from store, not mock data)
        │       │   └── [problemId]/page.tsx ← Full coding workspace (Monaco editor, run/submit via API)
        │       ├── graph/
        │       ├── coach/
        │       ├── interview/
        │       ├── contests/
        │       ├── leaderboards/
        │       ├── analytics/
        │       ├── certifications/
        │       ├── community/
        │       ├── profile/
        │       └── settings/
        │
        ├── components/
        │   ├── layout/         ← App shell components
        │   │   ├── sidebar.tsx
        │   │   ├── navbar.tsx
        │   │   ├── ai-panel.tsx
        │   │   └── mobile-nav.tsx
        │   │
        │   └── ui/             ← Primitive design system components
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── input.tsx
        │       ├── modal.tsx
        │       ├── progress.tsx
        │       └── tabs.tsx
        │
        ├── lib/                ← Shared TypeScript utilities
        │   ├── api.ts          ← Full API client (problems, run/submit, graph, coach, interviews, submissions)
        │   ├── hooks/
        │   │   └── use-problems.ts ← React Query hooks (useProblems, useProblem) (NEW)
        │   ├── types.ts        ← All TypeScript interfaces (278 lines)
        │   └── mock-data.ts    ← Mock data for landing page + fallback (768 lines)
        │
        └── store/              ← Zustand state stores
            ├── ui-store.ts     ← UI state (sidebar, panels, theme)
            └── user-store.ts   ← User, problems, submissions (persists status to backend)
```

---

## Backend Architecture

### Application Flow

```
Frontend (Next.js)
      │
      ▼
FastAPI (app/main.py) ── CORS (all origins)
      │
      ▼
API Routers (app/api/*.py)
      │
      ├──▶ AI Orchestration (app/ai/agents.py)
      │    └── OpenAI-compatible API (configurable provider)
      │
      ├──▶ Business Logic Engines
      │    ├── SkillGraphService   (app/graph/engine.py)
      │    ├── TelemetryEngine     (app/telemetry/engine.py)
      │    └── ReadinessEngine     (app/readiness/engine.py)
      │
      ├──▶ External Services
      │    ├── PistonService       (code execution sandbox)
      │    ├── InterviewService    (AI question gen + evaluation)
      │    └── SpeechService       (STT/TTS — placeholder)
      │
      └──▶ Supabase
           ├── Auth (Supabase Auth)
           ├── Database (PostgreSQL)
           └── Storage
```

### Key Design Decisions

- **AI Provider Agnosticism**: All LLM calls use the OpenAI SDK with configurable `OPENAI_BASE_URL`. Works with OpenAI, OpenRouter, Groq, Together, and DeepInfra without code changes.
- **Deterministic Readiness**: Interview readiness scores use mathematical formulas, not AI — ensuring consistent, reproducible results.
- **Structured AI Outputs**: All AI agents return structured JSON (never raw text), validated through Pydantic models.
- **Piston over Judge0**: Code execution uses [Piston](https://github.com/engineer-man/piston) per project taste preference (free public API, self-hostable).

---

## Frontend Architecture

### Route Groups

| Group | Layout | Purpose |
|-------|--------|---------|
| `(marketing)` | Landing layout | Public landing page |
| `(auth)` | Auth layout | Login / Register pages |
| `(app)` | App shell layout | Authenticated app with sidebar + navbar + AI panel |

### App Shell Layout

```
┌──────────────────────────────────────────────────────┐
│  Sidebar  │  Navbar                          │  AI   │
│  (64px)   │                                   │ Panel │
│           │                                   │(320px)│
│  - Dash   │  ┌──────────────────────────────┐ │       │
│  - Practice│  │                              │ │       │
│  - Graph  │  │    Page Content               │ │       │
│  - Coach  │  │    (dynamic route)            │ │       │
│  - Contest│  │                              │ │       │
│  - ...    │  └──────────────────────────────┘ │       │
│           │                                   │       │
├───────────┤  ┌──────────────────────────────┐ │       │
│ Mobile Nav │  │  Mobile Bottom Nav (md:hidden) │───────│
└──────────────────────────────────────────────────────┘
```

### Component Tree

```
RootLayout (app/layout.tsx)
├── (marketing)/layout.tsx → Landing Page
│   └── page.tsx (LandingPage) — Hero, Features, Stats, Timeline, Testimonials
│
├── (auth)/layout.tsx → Auth Pages
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (app)/layout.tsx → AppLayout (route-protected)
    ├── <Sidebar /> — Navigation sidebar
    ├── <Navbar /> — Top bar with search, notifications
    ├── <AIPanel /> — Right-side AI assistant drawer
    ├── <MobileNav /> — Bottom nav (mobile only)
    └── {children} — Route-specific page content
```

### State Management (Zustand)

**UI Store** (`ui-store.ts`):

- `sidebarOpen` — sidebar collapsed/expanded
- `aiPanelOpen` — AI assistant panel visibility
- `notificationsOpen` — notifications dropdown
- `searchOpen` — search modal
- `theme` — dark/light (dark-first design)

**User Store** (`user-store.ts`):

- `user` — current user profile
- `problems` — problem list with status tracking
- `submissions` — coding submission history
- `isLoggedIn` — auth state (defaults to true for MVP UX)
- `submitCode()` — records submissions and auto-updates problem status + user stats
- `updateProblemStatus()` — manual status updates

---

## Database Schema

All tables live in Supabase PostgreSQL. Full DDL at `backend/app/db/init.sql`.

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User profiles | id, email, full_name, created_at |
| `skills` | Skill graph nodes | id, name, description, category |
| `skill_dependencies` | Graph edges (prereqs) | source_skill → target_skill, weight |
| `problems` | Coding problems | id, title, **slug**, difficulty, description, constraints, examples (JSONB), concepts[], **acceptance_rate**, **estimated_time**, **companies** (JSONB), **starter_code** (JSONB), **hints** (JSONB), **editorial**, **source_url**, created_at |
| `submissions` | Code submission history | user_id → problem_id, language, code, status, runtime, memory |
| `telemetry_events` | Learning behavior data | user_id → problem_id, time_taken, attempts, hints_used, confidence, correct |
| `skill_states` | Per-user skill mastery | user_id → skill_id, mastery, struggle_score (UNIQUE constraint) |
| `user_problem_status` | Lightweight solved/attempted tracking | user_id → problem_id, status, updated_at (UNIQUE) |
| `interviews` | Mock interview sessions | user_id, interview_type, overall_score |
| `interview_responses` | Individual Q&A pairs | interview_id, question, answer, evaluation (JSONB) |
| `contests` | Coding competitions | title, start_time, end_time, problem_ids[] |
| `contest_submissions` | Contest submission links | contest_id → user_id → problem_id → submission_id |

### Indexes

- `submissions(user_id)`, `submissions(problem_id)`
- `telemetry_events(user_id)`
- `skill_states(user_id)`, `skill_states(skill_id)`
- `interviews(user_id)`

---

## API Reference

Base URL: `http://localhost:8000`

Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

### Code Execution

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| `POST` | `/execute` | `{language, code, stdin?}` | `{status, stdout, stderr, runtime, memory}` |

Supported languages via Piston: Python 3.10, C++ 10.2, Java 15.0.2

### Skill Graph

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/graph` | Full skill prerequisite DAG (nodes + edges) |

Graph includes 16 skills from fundamentals (Variables & Types) to advanced (Greedy Algorithms) with 15 dependency edges.

### Telemetry

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| `POST` | `/telemetry` | `{user_id, problem_id, time_taken, attempts, hints_used, confidence, correct}` | `{mastery, struggle_score}` |

Mastery formula weights: correctness (30%), attempts (20%), confidence (20%), time (15%), hints (15%).

### Readiness

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/readiness?user_id=...` | Interview readiness across DSA, problem solving, communication, system design |

Formula: `overall = dsa*0.4 + communication*0.2 + problem_solving*0.2 + system_design*0.2` — purely deterministic.

### AI Agents

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/ai/hint` | Context-aware hint (no spoilers, mastery-adaptive) |
| `POST` | `/ai/explain` | Solution walkthrough + time/space complexity |
| `POST` | `/ai/coach` | Root cause diagnosis + personalized recommendations |
| `POST` | `/ai/roadmap` | Adaptive learning path to target skill |
| `POST` | `/ai/recommend` | Next problem recommendations (5 by default) |
| `POST` | `/ai/plagiarism` | Code similarity analysis (0-100 score, low/medium/high risk) |

All agents use structured JSON output with Pydantic response models.

### Mock Interviews

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/interview/start` | Generate questions (DSA, startup, behavioral, system_design) |
| `POST` | `/interview/evaluate` | Score answer on technical accuracy, communication, depth (0-1 scale) |

### Contests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/contests` | List contests |
| `GET` | `/contests/{id}` | Contest details |
| `GET` | `/contests/{id}/leaderboard` | Leaderboard |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analytics/overview?user_id=...` | Dashboard: solved, streak, acceptance rate, readiness |
| `GET` | `/analytics/skills?user_id=...` | Per-skill mastery breakdown |
| `GET` | `/analytics/progress?user_id=...` | Day-by-day progress timeline |

### Speech (Abstraction)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/speech/transcribe` | Speech-to-text (placeholder — provider swappable) |
| `POST` | `/speech/speak` | Text-to-speech (placeholder — provider swappable) |

### Submission Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/submissions/status?problem_id=X` | Get solved/attempted status for one problem (requires auth) |
| `GET` | `/submissions/status` | Get all statuses for the authenticated user |
| `POST` | `/submissions/status?problem_id=X&status=solved` | Upsert submission status (requires auth) |

---

## Core Engines & Services

### SkillGraphService (`backend/app/graph/engine.py`)

Manages the skill prerequisite directed acyclic graph (DAG).

- **`build_graph(nodes, edges)`** — Builds adjacency list + reverse adjacency map
- **`find_weak_prerequisites(graph, skill_id, mastery_map, threshold=0.5)`** — DFS backward walk to find prerequisites below mastery threshold
- **`generate_recommendations(graph, user_skill_states, top_n=5)`** — Prioritized skill list based on prerequisite chain weakness

### TelemetryEngine (`backend/app/telemetry/engine.py`)

Calculates mastery and struggle scores from telemetry events.

- **`compute_mastery(event)`** — Weighted scoring (0-1) across time, attempts, hints, confidence, correctness
- **`compute_struggle(event)`** — Struggle score (0-1) penalizing slow time, multiple attempts, hint usage, and incorrect answers
- **`update_mastery_ewma(current, new, alpha=0.3)`** — Exponentially weighted moving average for smooth mastery progression

### ReadinessEngine (`backend/app/readiness/engine.py`)

Deterministic interview readiness scoring — **no AI involved**.

- **`assess(skill_states, total_problems_solved, acceptance_rate, interview_history)`** — Returns `ReadinessReport` with 5 scores + weak/strong areas
- Categorizes skills into DSA vs non-DSA dynamically using keyword matching
- Communication score derived from interview history evaluations

### PistonService (`backend/app/services/piston.py`)

Async wrapper around the Piston code execution API.

- Maps CodeArena language enums to Piston language/version pairs
- Handles compile errors, timeouts (exit 124), memory limits (exit 137), runtime errors
- 30-second compile + run timeout, 60-second HTTP timeout

### InterviewService (`backend/app/services/interview.py`)

AI-powered mock interview generation and evaluation.

- **`generate_questions(interview_type, count=3)`** — Generates questions using LLM, typed by interview category (DSA, startup, behavioral, system_design)
- **`evaluate_answer(question, answer, interview_type)`** — LLM evaluates on technical accuracy, communication, depth (normalized to 0-1)

### SpeechService (`backend/app/services/speech.py`)

Abstraction layer for STT/TTS — placeholder implementation ready for provider swap (OpenAI Whisper, Deepgram, ElevenLabs, etc.).

---

## AI Agents

All agents live in `backend/app/ai/agents.py` and share common patterns:

- System prompt: "You are CodeArena AI, an expert coding mentor. Always respond with valid JSON exactly matching the requested schema."
- Provider-agnostic via `OPENAI_BASE_URL` config
- Structured JSON output (never raw text)

| Agent | Temperature | Key Input | Output Schema |
|-------|------------|-----------|---------------|
| **Hint** | 0.7 | Problem + concepts + mastery map | `{hint: string}` |
| **Explain** | 0.3 | Problem + code + language | `{explanation, time_complexity, space_complexity}` |
| **Coach** | 0.5 | Weak topics + failures + mastery + telemetry | `{root_cause, weak_skills[], recommendations[]}` |
| **Roadmap** | 0.4 | Target skill + mastery + weak skills | `{roadmap: [{step, skill, reason}]}` |
| **Recommend** | 0.5 | Mastery + weak topics + available problems | `{recommended_problems: [{problem_id, title, reason}]}` |
| **Plagiarism** | 0.2 | Two code samples + language | `{similarity: 0-100, risk: low/medium/high}` |

---

## Frontend Routes & Pages

### App Pages (authenticated)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Overview with stats, activity, skill summary |
| `/practice` | Practice | Problem list with filters (difficulty, topic, company, status) |
| `/practice/[slug]` | Problem Detail | Monaco editor, submissions, AI hints |
| `/graph` | Skill Graph | Interactive @xyflow/react DAG visualization |
| `/coach` | AI Coach | Chat interface with mentor agent |
| `/interview` | Mock Interview | Interview room with question/answer/evaluation flow |
| `/contests` | Contests | Contest listing (upcoming, live, ended) |
| `/leaderboards` | Leaderboards | Global ranking |
| `/analytics` | Analytics | Charts: rating trend, topic mastery, accuracy, activity heatmap |
| `/certifications` | Certifications | Earned and in-progress certifications |
| `/community` | Community | Discussion posts, questions, study groups |
| `/profile` | Profile | User profile, stats, socials |
| `/settings` | Settings | Account configuration |

---

## Data Pipeline: Problems & Recommendations

### Data Flow

```
LeetCode GraphQL API
    │
    ▼
Seed Script (backend/scripts/seed_problems.py)
    │  └─ Fetches ~100 problems via problemsetQuestionList query
    │  └─ Caches to leetcode_cache.json (resumable)
    │  └─ Fetches per-problem details (hints, code snippets, companies, editorial)
    │  └─ Converts HTML → Markdown via html2text
    │  └─ Filters starter code: Python, C, C++, Java only
    │
    ▼
Supabase (problems table)
    │
    ├──▶ GET /problems?difficulty=&topic=&search=  →  Frontend practice explorer
    │      └─ Computes status from user_problem_status + submissions tables
    │      └─ Computes is_ai_recommended from skill_states (mastery < 50%)
    │
    ├──▶ GET /problems/{slug}  →  Frontend coding workspace
    │      └─ Full problem detail: description, examples, hints, editorial, starter code
    │
    ├──▶ POST /problems/{id}/run     →  Piston code execution
    ├──▶ POST /problems/{id}/submit  →  Piston + telemetry + skill state update
    │
    └──▶ POST /ai/recommend  →  Uses real Supabase data (not hardcoded stubs)
           └─ Feeds available problems to AI for personalized recommendations
```

### Recommendation Signals

- **Concept mastery gap**: If a user's mastery for a concept is < 50%, problems tagged with that concept get higher priority
- **Submission history**: Failed problems get re-prioritized
- **Difficulty appropriateness**: Matched to user's average mastery level
- **Diversity**: Avoids over-recommending the same topic

### Database Tables Involved

| Table | Role |
|-------|------|
| `problems` | All problem data (title, description, examples, hints, starter code, etc.) |
| `user_problem_status` | Per-user solved/attempted/unsolved tracking |
| `submissions` | Full submission history (used for detailed analytics) |
| `skill_states` | Per-user mastery scores per concept |
| `skills` | Skill graph nodes (maps to problem concepts) |

---

## Seeding Problems from LeetCode

### Seed Script

**File**: `backend/scripts/seed_problems.py`

Fetches real coding problems from LeetCode's public GraphQL API and inserts them into Supabase.

**Features**:
- Fetches 100 problems in batches of 20 (5 pages)
- Caches raw responses to `backend/scripts/leetcode_cache.json` for resumability
- Fetches per-problem details (hints, code snippets via `codeSnippets`, company tags via `companyTagStats`, editorial)
- Converts HTML descriptions to clean Markdown via `html2text`
- Filters starter code to 4 languages: **Python**, **C**, **C++**, **Java**
- Estimates solve time based on difficulty + acceptance rate
- Ensures difficulty diversity (~40 easy, ~40 medium, ~20 hard)
- Skips insert if problems already exist (idempotent)

**Run**:
```bash
cd backend
python -m scripts.seed_problems
```

**Cache files** (created in `backend/scripts/`):
- `leetcode_cache.json` — raw fetched problem list (avoids re-fetching on retry)
- `leetcode_details_cache.json` — per-problem detail responses

### Dependencies

Added `html2text>=2024.2.0` to `pyproject.toml` for HTML→Markdown conversion in the seed script.

### Schema Changes

Updated `backend/app/db/init.sql` with new columns on `problems` table + new `user_problem_status` table:

```sql
-- New columns added to problems
slug TEXT UNIQUE NOT NULL,
acceptance_rate FLOAT DEFAULT 0.0,
estimated_time TEXT DEFAULT '',
companies JSONB DEFAULT '[]',
starter_code JSONB DEFAULT '{}',
hints JSONB DEFAULT '[]',
editorial TEXT,
source_url TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()

-- New table
CREATE TABLE user_problem_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'unsolved',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, problem_id)
);
```

---

## Submission Status Persistence

### Sync Mechanism

Previously, submission status (Solved / Attempted / Unsolved) was stored only in browser memory via Zustand and reset on refresh. Now it persists to Supabase.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/submissions/status?problem_id=X` | Get status for a specific problem |
| `GET` | `/submissions/status` | Get all statuses for a user (hydration) |
| `POST` | `/submissions/status?problem_id=X&status=solved` | Upsert status |

### Flow

1. User submits code → frontend calls `POST /submissions/status` with `solved` or `attempted`
2. On page load → `GET /submissions/status` fetches all statuses
3. Store merges server statuses with local problem data
4. Status survives page refresh and works across devices

### Frontend

- New API functions in `src/lib/api.ts`: `fetchSubmissionStatus()`, `fetchAllSubmissionStatuses()`, `updateSubmissionStatus()`
- Store `addSubmission` and `submitCode` both call `updateSubmissionStatus()` after updating local state
- React Query infrastructure added: `src/app/providers.tsx` wraps app with `QueryClientProvider`
- Custom hooks: `src/lib/hooks/use-problems.ts` with `useProblems()` and `useProblem()`

### Public Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing page with hero, features, stats, testimonials |
| `/login` | Login | Authentication |
| `/register` | Register | Account creation |

---

## Environment Variables

### Backend (`.env`)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI-compatible API
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o

# Piston (code execution engine)
# Defaults to public API. Set to self-hosted instance if desired.
PISTON_API_URL=https://emkc.org/api/v2/piston
```

### Multi-Provider AI Support

Change `OPENAI_BASE_URL` to switch providers without code changes:

| Provider | Base URL |
|----------|----------|
| OpenAI | `https://api.openai.com/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| Groq | `https://api.groq.com/openai/v1` |
| Together AI | `https://api.together.xyz/v1` |
| DeepInfra | `https://api.deepinfra.com/v1/openai` |

---

## Running the Project

### Backend

```bash
cd backend

# Install dependencies
uv sync

# Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase + OpenAI keys

# Set up database (run init.sql in Supabase SQL Editor)
# See backend/app/db/init.sql

# Start server
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App available at `http://localhost:3000`

### Prerequisites

- Python 3.12+
- Node.js 20+
- Supabase project (free tier works)
- OpenAI-compatible API key
- Piston (public API used by default — no setup required)

---

## Competitive Analysis

CodeArena AI differentiates through AI-native features that traditional platforms lack:

| Feature | LeetCode | GeeksforGeeks | HackerRank | **CodeArena AI** |
|---------|----------|---------------|------------|-------------------|
| Coding Problems | ✅ | ✅ | ✅ | ✅ |
| Online Judge | ✅ | ✅ | ✅ | ✅ |
| Contests | ✅ | ✅ | ✅ | ✅ |
| Multi-language | ✅ | ✅ | ✅ | ✅ |
| AI Hints | Limited | ❌ | Limited | ✅ **Advanced** |
| Personalized Learning Path | ❌ | Partial | ❌ | ✅ |
| Weakness Detection | ❌ | ❌ | ❌ | ✅ |
| Skill Graph | ❌ | ❌ | ❌ | ✅ |
| AI Mentor | ❌ | ❌ | ❌ | ✅ |
| Interview Readiness Score | ❌ | ❌ | ❌ | ✅ |
| AI Mock Interview | ❌ | ❌ | Partial | ✅ |
| Communication Analysis | ❌ | ❌ | ❌ | ✅ |
| Learning Roadmap Generation | ❌ | ❌ | ❌ | ✅ |
| Dynamic Recommendations | ❌ | ❌ | ❌ | ✅ |
| Certification System | Limited | Partial | Partial | ✅ |
| Career Readiness Tracking | ❌ | ❌ | ❌ | ✅ |

---

## Data Flow Summary

```
User writes code in Monaco Editor (frontend)
    │
    ▼
POST /execute → PistonService → sandboxed execution → results returned
    │
    ▼
POST /telemetry → TelemetryEngine → mastery + struggle scores
    │                                         │
    │                                         ▼
    │                              skill_states table updated (EWMA)
    │
    ▼
POST /ai/coach → AI analyzes weak topics, failures, telemetry
    │
    ▼
CoachResponse: root cause + weak skills + recommendations
    │
    ▼
GET /readiness → ReadinessEngine → deterministic readiness scores
    │
    ▼
POST /ai/roadmap → AI generates adaptive learning path
    │
    ▼
POST /ai/recommend → AI recommends next problems based on mastery gaps
```

---

*Last updated: 2026-05-29*
