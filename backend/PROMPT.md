# Backend Architecture Agent Prompt — CodeArena AI

You are a Senior Backend Architect, AI Systems Engineer, and FastAPI Expert.

Your objective is to build the complete backend architecture for **CodeArena AI**, an AI-powered competitive programming and interview preparation platform.

This is a hackathon MVP, but the architecture should feel production-ready, modular, and scalable.

The backend should NOT be a simple CRUD application.

The platform's core innovation is:

* Dynamic Skill Graph
* AI Mentor Agent
* Adaptive Learning Paths
* Interview Readiness Engine
* AI Mock Interviews
* Personalized Coding Guidance

---

# Tech Stack

Use ONLY:

## Backend

* FastAPI
* Python 3.12+
* Pydantic v2
* Async APIs

---

## Database

Use:

* Supabase

Directly.

Do NOT create a separate PostgreSQL setup.

Use Supabase for:

* Authentication
* User Profiles
* Storage
* Database

---

## AI Layer

Use OpenAI-compatible APIs.

Backend should support:

```python
from openai import OpenAI
```

Configurable via:

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

Must work with:

* OpenRouter
* Groq
* Together
* DeepInfra
* OpenAI

without code changes.

---

## Code Execution

Use Judge0 API.

Backend should act as a wrapper around Judge0.

Supported Languages:

* Python
* C++
* Java

---

# Core Product Vision

Most coding platforms only answer:

"Was the solution correct?"

CodeArena AI should answer:

* Why did the student fail?
* What concept is weak?
* What should they practice next?
* How interview-ready are they?
* What learning path should they follow?

The backend must be designed around this philosophy.

---

# Architecture

```text
Frontend
    ↓
FastAPI
    ↓
Business Logic Layer
    ↓
AI Orchestration Layer
    ↓
Supabase
```

Organize code into:

```text
app/

├── api/
├── services/
├── ai/
├── graph/
├── readiness/
├── telemetry/
├── models/
├── schemas/
├── db/
├── utils/
└── main.py
```

---

# Database Schema

Create Supabase tables.

---

## users

Stores profile data.

Fields:

```sql
id
email
full_name
created_at
```

---

## skills

Represents graph nodes.

Examples:

* Arrays
* Trees
* Graphs
* DFS
* BFS
* DP
* Recursion

Fields:

```sql
id
name
description
category
```

---

## skill_dependencies

Graph edges.

Fields:

```sql
id
source_skill
target_skill
weight
```

Example:

```text
Recursion -> Trees
Trees -> DFS
DFS -> Graphs
Graphs -> DP
```

---

## problems

Coding problems.

Fields:

```sql
id
title
difficulty
description
constraints
examples
concepts[]
```

---

## submissions

Stores coding attempts.

Fields:

```sql
id
user_id
problem_id
language
code
status
runtime
memory
created_at
```

---

## telemetry_events

Stores learning telemetry.

Fields:

```sql
id
user_id
problem_id
time_taken
attempts
hints_used
confidence
correct
created_at
```

---

## skill_states

Stores user mastery.

Fields:

```sql
id
user_id
skill_id
mastery
struggle_score
updated_at
```

---

## interviews

Stores mock interview sessions.

Fields:

```sql
id
user_id
interview_type
overall_score
created_at
```

---

## interview_responses

Fields:

```sql
id
interview_id
question
answer
evaluation
```

---

# Skill Graph Engine

Implement graph logic.

Purpose:

Track learning progression.

Example:

```text
Recursion
 ↓
Trees
 ↓
DFS
 ↓
Graphs
 ↓
DP
```

---

Responsibilities:

* Load graph
* Update mastery
* Calculate weak nodes
* Find prerequisite weaknesses
* Generate recommendations

---

API:

```http
GET /graph
```

Returns:

```json
{
  "nodes": [],
  "edges": []
}
```

---

# Telemetry Engine

Purpose:

Track learning behavior.

Input:

```json
{
  "time_taken": 120,
  "attempts": 2,
  "hints_used": 1,
  "confidence": 4,
  "correct": true
}
```

---

Calculates:

```text
Mastery Score
Struggle Score
```

---

Updates:

```text
skill_states
```

---

API:

```http
POST /telemetry
```

---

# Interview Readiness Engine

Purpose:

Generate readiness scores.

Scores:

* DSA Readiness
* Problem Solving
* Communication
* System Design
* Overall Readiness

Use deterministic formulas.

Do NOT use AI.

Example:

```python
overall = (
    dsa * 0.4 +
    communication * 0.2 +
    problem_solving * 0.2 +
    system_design * 0.2
)
```

---

API:

```http
GET /readiness
```

---

# Judge0 Integration

API:

```http
POST /execute
```

Responsibilities:

* Submit code
* Poll results
* Return execution output

Supported:

* Python
* C++
* Java

---

# AI Layer

The AI layer is the product differentiator.

Create a reusable AI service.

All AI calls should use structured JSON outputs.

Never return raw text.

---

# AI Hint Agent

API:

```http
POST /ai/hint
```

Purpose:

Provide hints without revealing solutions.

Input:

* problem
* concepts
* mastery

Output:

```json
{
  "hint": ""
}
```

---

# AI Explanation Agent

API:

```http
POST /ai/explain
```

Purpose:

Explain accepted solutions.

Output:

```json
{
  "explanation": "",
  "time_complexity": "",
  "space_complexity": ""
}
```

---

# AI Mentor Agent

One of the flagship features.

API:

```http
POST /ai/coach
```

Input:

* weak_topics
* recent_failures
* mastery
* telemetry

Purpose:

Determine:

* root cause
* weak prerequisites
* learning recommendations

Output:

```json
{
  "root_cause": "",
  "weak_skills": [],
  "recommendations": []
}
```

---

# AI Learning Path Agent

API:

```http
POST /ai/roadmap
```

Purpose:

Generate adaptive learning paths.

Output:

```json
{
  "roadmap": []
}
```

Example:

```text
DFS
↓
Graph Traversal
↓
Shortest Path
```

---

# AI Problem Recommendation Agent

API:

```http
POST /ai/recommend
```

Purpose:

Recommend next problems.

Uses:

* mastery
* weak topics
* solved history

Output:

```json
{
  "recommended_problems": []
}
```

---

# AI Mock Interview System

This is a flagship feature.

---

## Interview Generation

API:

```http
POST /interview/start
```

Generates:

* DSA questions
* Startup questions
* Behavioral questions
* System Design questions

---

## Interview Evaluation

API:

```http
POST /interview/evaluate
```

Input:

```json
{
  "question": "",
  "answer": ""
}
```

Output:

```json
{
  "technical_accuracy": 0,
  "communication": 0,
  "depth": 0,
  "feedback": ""
}
```

---

## Voice Support

Design backend support for:

```text
Speech-to-Text
Text-to-Speech
```

Create abstraction layer:

```python
SpeechService
```

Methods:

```python
transcribe()
speak()
```

Provider implementation can be swapped later.

---

# Contest System

APIs:

```http
GET /contests
GET /contest/{id}
GET /leaderboard
```

Simple implementation.

Required only for challenge compliance.

---

# Plagiarism Analysis

API:

```http
POST /ai/plagiarism
```

Pipeline:

```text
AST Similarity
+
AI Analysis
```

Output:

```json
{
  "similarity": 82,
  "risk": "medium"
}
```

---

# Analytics APIs

Create:

```http
GET /analytics/overview
GET /analytics/skills
GET /analytics/progress
```

Return dashboard metrics.

Examples:

* problems solved
* mastery distribution
* readiness score
* weak skills
* activity history

---

# API Documentation

All endpoints must:

* use Pydantic schemas
* generate OpenAPI docs
* include examples
* include response models

---

# Development Priority

Build in this order:

1. Supabase Integration
2. Database Models
3. Judge0 Wrapper
4. Telemetry Engine
5. Skill Graph Engine
6. Readiness Engine
7. AI Hint Agent
8. AI Coach Agent
9. Learning Path Agent
10. Mock Interview System
11. Contest APIs
12. Analytics APIs

---

# Success Criteria

The final backend should make it possible to demonstrate:

* Coding Practice
* Code Execution
* AI Hints
* AI Explanations
* AI Mentor
* Personalized Learning Paths
* Skill Graph Tracking
* Mock Interviews
* Interview Readiness
* Contests
* Analytics

The system should feel like a personal AI coding mentor rather than a simple coding platform.
