# CodeArena AI — Backend

AI-powered competitive programming and interview preparation platform. Tracks skill mastery across a dynamic prerequisite graph, generates adaptive learning paths, runs mock interviews, and provides an AI mentor that diagnoses **why** you're stuck.

## Prerequisites

- Python **3.12+**
- [uv](https://docs.astral.sh/uv/) (recommended) or pip
- A [Supabase](https://supabase.com) project (free tier works)
- An OpenAI-compatible API key ([OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai), [Groq](https://groq.com), [Together](https://together.ai), or [DeepInfra](https://deepinfra.com))

Code execution runs on the [Piston](https://github.com/engineer-man/piston) public API by default — no setup required.

## Quick Start

```bash
# 1. Clone and enter the backend directory
cd backend

# 2. Create a virtual environment and install dependencies
uv sync

# 3. Copy the example environment and fill in your keys
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
# PISTON_API_URL=https://emkc.org/api/v2/piston  (optional — public API is the default)
```

## Database Setup

Run the schema from `app/db/init.sql` in your Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Paste the contents of `app/db/init.sql`
4. Click **Run**

This creates all tables (`users`, `skills`, `skill_dependencies`, `problems`, `submissions`, `telemetry_events`, `skill_states`, `interviews`, `interview_responses`, `contests`, `contest_submissions`) with proper indexes.

## Run

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

## API Reference

### Code Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/execute` | Run Python/C++/Java code via Piston |

### Skill Graph

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/graph` | Full skill prerequisite DAG (nodes + edges) |

### Telemetry

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/telemetry` | Submit a learning event → mastery + struggle scores |

### Readiness

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/readiness?user_id=...` | Interview readiness across DSA, problem solving, communication, system design |

### AI Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/hint` | Context-aware hint (no spoilers) |
| `POST` | `/ai/explain` | Solution walkthrough + complexity analysis |
| `POST` | `/ai/coach` | Root cause diagnosis + personalized recommendations |
| `POST` | `/ai/roadmap` | Adaptive learning path to a target skill |
| `POST` | `/ai/recommend` | Next problem recommendations |
| `POST` | `/ai/plagiarism` | Code similarity analysis |

### Mock Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/interview/start` | Generate DSA/behavioral/system design questions |
| `POST` | `/interview/evaluate` | Score an answer on technical accuracy, communication, depth |

### Contests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/contests` | List contests |
| `GET`  | `/contests/{id}` | Contest details |
| `GET`  | `/contests/{id}/leaderboard` | Leaderboard |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/analytics/overview` | Dashboard: solved, streak, acceptance rate, readiness |
| `GET`  | `/analytics/skills` | Per-skill mastery breakdown |
| `GET`  | `/analytics/progress` | Day-by-day progress timeline |

### Speech (Abstraction)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/speech/transcribe` | Speech-to-text (provider swappable) |
| `POST` | `/speech/speak` | Text-to-speech (provider swappable) |

## Architecture

```
Frontend
    ↓
FastAPI (app/main.py)
    ↓
Business Logic Layer
    ├── app/graph/      → Skill prerequisite DAG engine
    ├── app/telemetry/  → Mastery + struggle scoring
    ├── app/readiness/  → Interview readiness (deterministic)
    └── app/services/   → Piston, Interview, Speech
    ↓
AI Orchestration (app/ai/)
    ├── Hint, Explain, Coach, Roadmap, Recommend, Plagiarism
    └── OpenAI-compatible (works with any provider)
    ↓
Supabase
    ├── Auth, Database, Storage
    └── Schema: app/db/init.sql
```

## Switching AI Providers

Backend supports any OpenAI-compatible API. Change two env vars:

```env
# OpenAI
OPENAI_BASE_URL=https://api.openai.com/v1

# OpenRouter
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Groq
OPENAI_BASE_URL=https://api.groq.com/openai/v1

# Together AI
OPENAI_BASE_URL=https://api.together.xyz/v1

# DeepInfra
OPENAI_BASE_URL=https://api.deepinfra.com/v1/openai
```

## Self-Hosted Piston

If you're running Piston locally, set the URL:

```env
PISTON_API_URL=http://localhost:2000/api/v2/piston
```

## Project Structure

```
backend/
├── app/
│   ├── api/           # FastAPI routers
│   │   ├── ai.py          → /ai/*
│   │   ├── analytics.py   → /analytics/*
│   │   ├── contests.py    → /contests/*
│   │   ├── execute.py     → /execute
│   │   ├── graph.py       → /graph
│   │   ├── interview.py   → /interview/*
│   │   ├── readiness.py   → /readiness
│   │   ├── speech.py      → /speech/*
│   │   └── telemetry.py   → /telemetry
│   ├── ai/            # AI agent implementations
│   ├── graph/         # Skill graph engine
│   ├── telemetry/     # Mastery scoring engine
│   ├── readiness/     # Readiness scoring engine
│   ├── services/      # Piston, Interview, Speech
│   ├── schemas/       # Pydantic v2 models
│   ├── db/            # Supabase client + SQL schema
│   └── main.py        # Application entry point
├── .env.example
├── pyproject.toml
├── requirements.txt
└── README.md
```
