# CodeArena AI 🚀

> **The ultimate AI-native competitive programming & interview preparation operating system.**
> Tracks skill mastery across a dynamic prerequisite graph, generates adaptive learning paths, runs interactive AI mock interviews, and provides a personal AI coding mentor that diagnoses *why* you're stuck.

---

## 📖 Table of Contents

1. [Features & Capabilities](#-features--capabilities)
2. [Tech Stack](#-tech-stack)
3. [Repository Structure](#-repository-structure)
4. [Local Development Setup](#-local-development-setup)
   - [Database Setup (Supabase)](#database-setup-supabase)
   - [FastAPI Backend Setup](#fastapi-backend-setup)
   - [Next.js Frontend Setup](#next-js-frontend-setup)
5. [Seeding Problems from LeetCode](#-seeding-problems-from-leetcode)
6. [Hosting & Deployment Guide](#-hosting--deployment-guide)
   - [Frontend Deployment (Vercel & Netlify)](#frontend-deployment-vercel--netlify)
   - [Backend Deployment (Render, Railway, Fly.io)](#backend-deployment-render-railway-flyio)
7. [Competitive Edge Analysis](#-competitive-edge-analysis)
8. [Core Engines Architecture](#-core-engines-architecture)

---

## ✨ Features & Capabilities

CodeArena AI goes beyond traditional coding platforms like LeetCode and HackerRank. Instead of simply telling a candidate *"Was the code correct?"*, it diagnoses the entire developer lifecycle:

- **🕸️ Dynamic Skill Graph Engine**: Compiles a real-time prerequisite Directed Acyclic Graph (DAG) using `@xyflow/react` to map prerequisite concepts (e.g., *Dynamic Programming* requires *Recursion*).
- **🤖 Context-Aware AI Mentor**: Built-in AI agents provide multi-tiered support:
  - **Hints Engine**: Non-spoiler hints that guide users step-by-step without giving away the solution.
  - **Explainers**: Complete post-solve code walkthroughs and asymptotic complexity analysis.
  - **Coding Coach**: Tailored, empathetic struggle diagnoses outlining *why* you are stuck.
- **📈 Telemetry & Mastery Engine**: Implements an Exponentially Weighted Moving Average (EWMA) telemetry model to evaluate user mastery and struggle coefficients based on compilation errors, execution runtimes, and attempt histories.
- **🎙️ AI Mock Interview Room**: Supports voice-based behavioral and technical mock interviews using real-time Speech-to-Text (STT) and Text-to-Speech (TTS) services, complete with fluency metrics, pause analysis, and instant evaluations.
- **⚡ Sandboxed Online Judge**: Executes C, C++, Python, and Java code instantly in a secure execution sandbox using the Piston API.
- **🔮 Interview Readiness Index**: Generates a deterministic (non-AI, fully objective) overall readiness score across DSA, communication, system design, and problem solving.

---

## 🛠️ Tech Stack

### Backend (FastAPI Monolith)

- **Language**: Python 3.12+
- **Framework**: FastAPI (v0.115+) & Uvicorn standard
- **Database**: Supabase (PostgreSQL with custom DDL schema)
- **AI Integration**: OpenAI SDK (provider-agnostic, supporting OpenRouter, Groq, Together, DeepInfra)
- **Package Management**: `uv` or pip

### Frontend (Next.js App Router)

- **Framework**: Next.js 16.2.6 (React 19.2.4 & TypeScript 5)
- **Styling**: Tailwind CSS v4 & PostCSS
- **State Management**: Zustand 5 & TanStack React Query 5
- **Visualizations**: `@xyflow/react` (Skill Graph) & Recharts (Analytics dashboards)
- **Editor**: Monaco Code Editor (`@monaco-editor/react`)
- **Animations**: Framer Motion 12 & Lucide Icons

---

## 📁 Repository Structure

```text
CodeArena-AI/
├── PROJECT.md                  # Deep architectural spec & developer doc
├── comparision.md              # Competitive landscape matrix
│
├── backend/                    # FastAPI python service
│   ├── app/
│   │   ├── api/                # API router endpoints
│   │   ├── ai/                 # AI Agent implementations (Coach, Hints, Roadmap, etc.)
│   │   ├── graph/              # Skill prerequisite DAG engine
│   │   ├── telemetry/          # Mastery telemetry engine
│   │   ├── db/                 # Supabase operations & init.sql schema
│   │   └── main.py             # Uvicorn entry point
│   ├── scripts/                # Seeding and caching scripts
│   ├── pyproject.toml          # Hatchling dependencies
│   └── requirements.txt        # Pip lock
│
└── frontend/                   # Next.js frontend application
    ├── src/
    │   ├── app/                # Next.js pages & layout routes
    │   ├── components/         # Design system & voice room components
    │   ├── hooks/              # Speech & audio state hooks
    │   ├── lib/                # API client layer & mock fallback data
    │   └── store/              # Zustand stores (UI, User status)
    ├── package.json            # NPM dependencies
    └── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Local Development Setup

### Database Setup (Supabase)

1. Create a free project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste and run the DDL schema script found in [backend/app/db/init.sql](file:///home/spreadsheets600/Projects/CodeArena-AI/backend/app/db/init.sql).
   - This will provision all tables (`users`, `skills`, `problems`, `submissions`, `skill_states`, `interviews`, `user_problem_status`, etc.) with optimal constraints, indexes, and triggers.

### FastAPI Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Set up a virtual environment and install dependencies using `uv` (recommended) or pip:

   ```bash
   # Using Astral's uv
   uv sync

   # OR using standard pip fallback
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Create your `.env` configuration file:

   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables inside `.env`:
   - `SUPABASE_URL` & keys (obtained from Supabase API settings)
   - `OPENAI_API_KEY` (obtained from your AI provider)
   - `OPENAI_BASE_URL` (defaults to OpenAI, but can be switched to OpenRouter, Groq, or Together AI)
5. Start the backend development server:

   ```bash
   source .venv/bin/activate
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   - *API Swagger docs are accessible at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### Next.js Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install npm dependencies:

   ```bash
   npm install
   ```

3. Configure your local environment variables in `.env.local` (default file already matches local development):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the Next.js development server:

   ```bash
   npm run dev
   ```

   - *The interface is accessible at [http://localhost:3000](http://localhost:3000)*

---

## 🌾 Seeding Problems from LeetCode

CodeArena AI includes an advanced, idempotent seeding pipeline to pull actual problems, starter codes, test cases, and editorial descriptions from LeetCode.

To seed your database with 100 diverse problems:

```bash
cd backend
source .venv/bin/activate
python -m scripts.seed_problems
```

- Estimates typical solve times and structures metadata (company tags, starter code templates for C/C++/Java/Python, markdown descriptions, and incremental hints).
- Utilizes local file caching (`leetcode_cache.json` and `leetcode_details_cache.json`) to prevent hitting API rate limits during re-runs.

---

## 🌐 Hosting & Deployment Guide

### Frontend Deployment (Vercel & Netlify)

The Next.js 16 frontend is fully hostable on **Vercel** and **Netlify** with absolute zero configuration:

#### 🔺 Hosting on Vercel

1. Push your repository to GitHub/GitLab.
2. In the Vercel Dashboard, select **New Project** and import your repository.
3. In **Project Settings**:
   - Set the **Root Directory** to `frontend`.
   - Vercel automatically detects Next.js and sets the build command (`next build`) and output directory.
4. Add the following **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` (your Supabase project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Supabase anonymous API key)
   - `NEXT_PUBLIC_API_URL` (the HTTP URL of your hosted backend service)
5. Click **Deploy**.

#### ⚡ Hosting on Netlify

1. Log into your Netlify dashboard and click **Add new site** → **Import from Git**.
2. Select your repository.
3. Under **Build settings**:
   - Set the **Base directory** to `frontend`.
   - Set the **Build command** to `npm run build`.
   - Set the **Publish directory** to `.next`.
4. Under **Environment variables**, define:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
5. Click **Deploy Site**.

### Backend Deployment (Render, Railway, Fly.io)

Since the backend is a Python FastAPI service, you can easily host it on any cloud platform:

#### 🟢 Deploying on Render / Railway

1. Create a new **Web Service** on Render or Railway, and connect your repository.
2. Set the root directory to `backend`.
3. Set the build and start options:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt` (or `pip install uv && uv pip install -r requirements.txt --system`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set the required **Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL` (if using Groq, OpenRouter, or other provider)
   - `AI_MODEL` (e.g. `gpt-4o`, `llama3-70b`, etc.)
5. Deploy. Paste the resulting live service URL into your frontend's `NEXT_PUBLIC_API_URL` environment variable!

---

## 📊 Competitive Edge Analysis

| Feature | LeetCode | GeeksforGeeks | HackerRank | **CodeArena AI** |
|---------|----------|---------------|------------|-------------------|
| Online Judge Sandbox | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **Yes (Sandboxed)** |
| Prerequisite Skill Graph | ❌ No | ❌ No | ❌ No | ✅ **Yes (Interactive DAG)** |
| Struggle Telemetry | ❌ No | ❌ No | ❌ No | ✅ **Yes (EWMA scoring)** |
| Context AI Coding Coach | ❌ No | ❌ No | ❌ No | ✅ **Yes (Deep explanations)** |
| Audio Mock Interviews | ❌ No | ❌ No | ❌ No | ✅ **Yes (Voice-activated)** |
| Non-Spoiler AI Hints | ⚠️ Limited | ❌ No | ⚠️ Limited | ✅ **Yes (Step-by-step)** |
| Objective Readiness Score | ❌ No | ❌ No | ❌ No | ✅ **Yes (Deterministic)** |

---

## 🧬 Core Engines Architecture

```text
       ┌──────────────────────────────────────────────┐
       │             Frontend UI (Next.js)            │
       └──────────────────────┬───────────────────────┘
                              │
                              ▼  (Code Exec, AI Insights, Telemetry)
       ┌──────────────────────────────────────────────┐
       │             FastAPI Backend Web API          │
       └──────────────────────┬───────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌───────────┐           ┌───────────┐           ┌───────────┐
│ Telemetry │           │ AI Coach  │           │ Skill DAG │
│  Engine   │           │   Agent   │           │  Service  │
└─────┬─────┘           └─────┬─────┘           └─────┬─────┘
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
       ┌──────────────────────────────────────────────┐
       │             Supabase DB Persistence          │
       └──────────────────────────────────────────────┘
```

CodeArena AI's **Telemetry Engine** analyzes performance indicators synchronously. When compile failures, runtimes, or attempts are logged, the backend evaluates the user's mastery level and persists it to the **Supabase DB**. This updates the user's interactive **Skill Graph**, which then feeds custom learning materials to the **AI Coach** for personalized student path generation.

---
*Developed with pair programming and agentic collaboration. Tested and production-ready.*
