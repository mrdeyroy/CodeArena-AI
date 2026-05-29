from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, analytics, auth, coach, contests, execute, graph, interview, problems, readiness, speech, submissions, telemetry

app = FastAPI(
    title="CodeArena AI",
    description="AI-powered competitive programming and interview preparation platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────
app.include_router(ai.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(coach.router)
app.include_router(contests.router)
app.include_router(execute.router)
app.include_router(graph.router)
app.include_router(interview.router)
app.include_router(problems.router)
app.include_router(readiness.router)
app.include_router(speech.router)
app.include_router(submissions.router)
app.include_router(telemetry.router)


@app.get("/")
async def root():
    return {"name": "CodeArena AI", "status": "operational", "version": "0.1.0"}
