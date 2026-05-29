from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class SubmissionStatus(str, Enum):
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    RUNTIME_ERROR = "runtime_error"
    COMPILE_ERROR = "compile_error"
    PENDING = "pending"
    PROCESSING = "processing"


class Language(str, Enum):
    PYTHON = "python"
    CPP = "cpp"
    JAVA = "java"


class InterviewType(str, Enum):
    DSA = "dsa"
    STARTUP = "startup"
    BEHAVIORAL = "behavioral"
    SYSTEM_DESIGN = "system_design"


# ── User ───────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime


# ── Skill ──────────────────────────────────────────────────────

class SkillNode(BaseModel):
    id: str
    name: str
    description: str
    category: str


class SkillEdge(BaseModel):
    id: str | None = None
    source_skill: str
    target_skill: str
    weight: float = 1.0


class SkillState(BaseModel):
    id: str | None = None
    user_id: str
    skill_id: str
    mastery: float = 0.0
    struggle_score: float = 0.0
    updated_at: datetime | None = None


# ── Problem ────────────────────────────────────────────────────

class Problem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: Difficulty
    description: str
    constraints: str | None = None
    examples: list[dict] | None = None
    concepts: list[str] | None = None
    acceptance_rate: float = 0.0
    estimated_time: str = ""
    companies: list[str] | None = None
    starter_code: dict[str, str] | None = None
    hints: list[str] | None = None
    editorial: str | None = None


class ProblemListItem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: Difficulty
    acceptance_rate: float = 0.0
    estimated_time: str = ""
    concepts: list[str] | None = None
    companies: list[str] | None = None
    status: str = "Unsolved"
    is_ai_recommended: bool = False


# ── Submission ─────────────────────────────────────────────────

class SubmissionRequest(BaseModel):
    user_id: str
    problem_id: str
    language: Language
    code: str


class SubmissionResult(BaseModel):
    id: str | None = None
    user_id: str
    problem_id: str
    language: str
    code: str
    status: SubmissionStatus
    runtime: float | None = None
    memory: float | None = None
    stdout: str | None = None
    stderr: str | None = None
    created_at: datetime | None = None


class ExecuteRequest(BaseModel):
    language: Language
    code: str
    stdin: str | None = None


class ExecuteResponse(BaseModel):
    status: SubmissionStatus
    stdout: str | None = None
    stderr: str | None = None
    runtime: float | None = None
    memory: float | None = None


# ── Telemetry ──────────────────────────────────────────────────

class TelemetryEvent(BaseModel):
    id: str | None = None
    user_id: str
    problem_id: str
    time_taken: float
    attempts: int
    hints_used: int
    confidence: int = Field(ge=1, le=5)
    correct: bool
    created_at: datetime | None = None


class TelemetryInput(BaseModel):
    user_id: str
    problem_id: str
    time_taken: float
    attempts: int
    hints_used: int
    confidence: int = Field(ge=1, le=5)
    correct: bool


# ── Skill Graph ────────────────────────────────────────────────

class GraphResponse(BaseModel):
    nodes: list[SkillNode]
    edges: list[SkillEdge]


class RecommendationNode(BaseModel):
    skill_id: str
    skill_name: str
    priority: float


# ── Readiness ──────────────────────────────────────────────────

class ReadinessReport(BaseModel):
    dsa_readiness: float
    problem_solving: float
    communication: float
    system_design: float
    overall_readiness: float
    weak_areas: list[str]
    strong_areas: list[str]


# ── AI ─────────────────────────────────────────────────────────

class HintRequest(BaseModel):
    problem_title: str
    problem_description: str
    concepts: list[str]
    mastery: dict[str, float] = Field(default_factory=dict)


class HintResponse(BaseModel):
    hint: str


class ExplainRequest(BaseModel):
    problem_title: str
    problem_description: str
    solution_code: str
    language: str


class ExplainResponse(BaseModel):
    explanation: str
    time_complexity: str
    space_complexity: str


class CoachRequest(BaseModel):
    user_id: str
    weak_topics: list[str]
    recent_failures: list[str] = Field(default_factory=list)
    mastery: dict[str, float] = Field(default_factory=dict)
    telemetry_summary: str = ""


class CoachResponse(BaseModel):
    root_cause: str
    weak_skills: list[str]
    recommendations: list[str]


class RoadmapRequest(BaseModel):
    target_skill: str
    current_mastery: dict[str, float] = Field(default_factory=dict)
    weak_skills: list[str] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    roadmap: list[dict]


class RecommendRequest(BaseModel):
    user_id: str
    current_mastery: dict[str, float] = Field(default_factory=dict)
    weak_topics: list[str] = Field(default_factory=list)
    recent_problem_ids: list[str] = Field(default_factory=list)
    count: int = 5


class RecommendResponse(BaseModel):
    recommended_problems: list[dict]


class PlagiarismRequest(BaseModel):
    code_a: str
    code_b: str
    language: str


class PlagiarismResponse(BaseModel):
    similarity: float
    risk: str


# ── Interview ──────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    user_id: str
    interview_type: InterviewType


class InterviewStartResponse(BaseModel):
    interview_id: str
    questions: list[dict]


class InterviewEvaluateRequest(BaseModel):
    interview_id: str
    question: str
    answer: str
    question_number: int = 0


class InterviewEvaluateResponse(BaseModel):
    technical_accuracy: float
    communication: float
    depth: float
    feedback: str


class InterviewResult(BaseModel):
    id: str
    user_id: str
    interview_type: str
    overall_score: float
    created_at: datetime


# ── Contest ──────────────────────────────────────────────────

class Contest(BaseModel):
    id: str
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    problem_ids: list[str]


class LeaderboardEntry(BaseModel):
    user_id: str
    user_name: str
    score: int
    problems_solved: int
    total_time: float


# ── Analytics ──────────────────────────────────────────────────

class AnalyticsOverview(BaseModel):
    total_problems_solved: int
    total_submissions: int
    acceptance_rate: float
    current_streak: int
    overall_readiness: float
    active_days: int


class SkillAnalytics(BaseModel):
    skill_name: str
    mastery: float
    problems_attempted: int
    problems_solved: int
    avg_time: float


class ProgressEntry(BaseModel):
    date: str
    problems_solved: int
    avg_mastery: float
    readiness: float


# ── Auth ───────────────────────────────────────────────────────

class AuthRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    refresh_token: str


# ── Problem Run / Submit ───────────────────────────────────────

class ProblemRunRequest(BaseModel):
    language: Language
    code: str
    stdin: str | None = None


class ProblemSubmitRequest(BaseModel):
    language: Language
    code: str


class ProblemRunResult(BaseModel):
    status: SubmissionStatus
    stdout: str | None = None
    stderr: str | None = None
    runtime: float | None = None
    memory: float | None = None


class ProblemSubmitResult(BaseModel):
    submission_id: str
    status: SubmissionStatus
    passed_tests: int
    total_tests: int
    runtime: float | None = None
    memory: float | None = None


# ── Coach ──────────────────────────────────────────────────────

class CoachChatRequest(BaseModel):
    message: str


class CoachChatResponse(BaseModel):
    reply: str


class WeaknessItem(BaseModel):
    skill_name: str
    mastery: float


# ── Graph Insights ─────────────────────────────────────────────

class GraphNodeInsights(BaseModel):
    ai_insight: str
    recommended_problems: list[str]


# ── Interview (additional) ─────────────────────────────────────

class InterviewSessionRequest(BaseModel):
    interview_type: InterviewType
    duration_limit: int = 30


class InterviewSessionResponse(BaseModel):
    session_id: str
    questions: list[dict]


class InterviewResponseRequest(BaseModel):
    candidate_answer: str


class InterviewFinalizeResponse(BaseModel):
    interview_id: str
    overall_score: float
    technical_accuracy: float
    communication: float
    depth: float
    strengths: list[str]
    weaknesses: list[str]


# ── Speech (abstraction) ───────────────────────────────────────

class TranscribeRequest(BaseModel):
    audio_url: str


class TranscribeResponse(BaseModel):
    text: str


class SpeakRequest(BaseModel):
    text: str


class SpeakResponse(BaseModel):
    audio_url: str
