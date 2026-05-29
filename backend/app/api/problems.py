"""Problems router: list, detail, run, and submit coding problems."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.auth import optional_user, require_user
from app.db.operations import (
    fetch_problems,
    fetch_problem_by_slug,
    fetch_problem_by_id,
    insert_submission,
    upsert_skill_state,
    fetch_skill_by_name,
    fetch_user_skill_state,
)
from app.schemas.schemas import (
    Problem,
    ProblemListItem,
    Language,
    ProblemRunRequest,
    ProblemSubmitRequest,
    ProblemRunResult,
    ProblemSubmitResult,
    ExecuteRequest,
    SubmissionStatus,
)
from app.services.piston import PistonService
from app.telemetry.engine import telemetry_engine
from app.db.supabase import get_supabase

router = APIRouter(prefix="/problems", tags=["problems"])
piston = PistonService()


@router.get("", response_model=list[ProblemListItem])
async def list_problems(
    difficulty: str | None = Query(None),
    topic: str | None = Query(None),
    company: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    user: dict | None = Depends(optional_user),
):
    filters: dict = {}
    if difficulty:
        filters["difficulty"] = difficulty
    if topic:
        filters["concept"] = topic
    if search:
        filters["search"] = search

    problems = fetch_problems(filters)

    items: list[ProblemListItem] = []
    for p in problems:
        problem_status = "Unsolved"
        is_ai_recommended = False

        if user:
            supabase = get_supabase()
            sub_resp = supabase.from_("submissions").select("status").eq("user_id", user["sub"]).eq("problem_id", p["id"]).execute()
            subs = sub_resp.data or []
            if any(s["status"] == "accepted" for s in subs):
                problem_status = "Solved"
            elif subs:
                problem_status = "Attempted"

            concepts = p.get("concepts") or []
            if concepts:
                concept = concepts[0]
                skill = fetch_skill_by_name(concept)
                if skill:
                    state = fetch_user_skill_state(user["sub"], skill["id"])
                    if state and state.get("mastery", 0) < 0.5:
                        is_ai_recommended = True

        items.append(ProblemListItem(
            id=p["id"],
            title=p["title"],
            slug=p.get("slug", ""),
            difficulty=p["difficulty"],
            acceptance_rate=round(p.get("acceptance_rate", 0), 1) if p.get("acceptance_rate") else 0.0,
            estimated_time=p.get("estimated_time", ""),
            concepts=p.get("concepts") or [],
            companies=p.get("companies") or [],
            status=problem_status,
            is_ai_recommended=is_ai_recommended,
        ))

    return items


@router.get("/{slug:path}", response_model=Problem)
async def get_problem(slug: str):
    problem = fetch_problem_by_slug(slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return Problem(
        id=problem["id"],
        title=problem["title"],
        slug=problem.get("slug", ""),
        difficulty=problem["difficulty"],
        description=problem.get("description", ""),
        constraints=problem.get("constraints"),
        examples=problem.get("examples") or [],
        concepts=problem.get("concepts") or [],
        acceptance_rate=round(problem.get("acceptance_rate", 0), 1) if problem.get("acceptance_rate") else 0.0,
        estimated_time=problem.get("estimated_time", ""),
        companies=problem.get("companies") or [],
        starter_code=problem.get("starter_code") or {},
        hints=problem.get("hints") or [],
        editorial=problem.get("editorial"),
    )


@router.post("/{problem_id}/run", response_model=ProblemRunResult)
async def run_problem(
    problem_id: str,
    request: ProblemRunRequest,
    user: dict = Depends(require_user),
):
    result = await piston.execute(ExecuteRequest(
        language=request.language,
        code=request.code,
        stdin=request.stdin or "",
    ))
    return ProblemRunResult(
        status=result.status,
        stdout=result.stdout,
        stderr=result.stderr,
        runtime=result.runtime,
        memory=result.memory,
    )


@router.post("/{problem_id}/submit", response_model=ProblemSubmitResult)
async def submit_problem(
    problem_id: str,
    request: ProblemSubmitRequest,
    user: dict = Depends(require_user),
):
    problem = fetch_problem_by_id(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    examples = problem.get("examples") or []
    if not examples:
        raise HTTPException(status_code=400, detail="Problem has no test cases")

    passed = 0
    total = len(examples)
    last_status = SubmissionStatus.ACCEPTED
    last_runtime: float | None = None
    last_memory: float | None = None

    for ex in examples:
        inp = ex.get("input", "")
        expected_output = ex.get("output", "").strip()

        result = await piston.execute(ExecuteRequest(
            language=request.language,
            code=request.code,
            stdin=inp,
        ))
        last_runtime = result.runtime
        last_memory = result.memory

        if result.status != SubmissionStatus.ACCEPTED:
            last_status = result.status
            break

        actual_output = (result.stdout or "").strip()
        if actual_output != expected_output:
            last_status = SubmissionStatus.WRONG_ANSWER
            break
        passed += 1

    submission_id = insert_submission(
        user_id=user["sub"],
        problem_id=problem_id,
        language=request.language.value,
        code=request.code,
        status=last_status.value,
        runtime=last_runtime,
        memory=last_memory,
    )

    correct = last_status == SubmissionStatus.ACCEPTED
    from app.db.supabase import get_supabase as _gs
    _gs().from_("telemetry_events").insert({
        "user_id": user["sub"],
        "problem_id": problem_id,
        "time_taken": 0,
        "attempts": 1,
        "hints_used": 0,
        "confidence": 3,
        "correct": correct,
    }).execute()

    concepts = problem.get("concepts") or []
    for concept_name in concepts:
        skill = fetch_skill_by_name(concept_name)
        if not skill:
            continue

        existing_state = fetch_user_skill_state(user["sub"], skill["id"])
        if existing_state:
            new_mastery = telemetry_engine.update_mastery_ewma(
                existing_state["mastery"],
                1.0 if correct else 0.3,
            )
            upsert_skill_state(user["sub"], skill["id"], new_mastery)
        else:
            initial_mastery = 0.7 if correct else 0.3
            upsert_skill_state(user["sub"], skill["id"], initial_mastery)

    return ProblemSubmitResult(
        submission_id=submission_id,
        status=last_status,
        passed_tests=passed,
        total_tests=total,
        runtime=last_runtime,
        memory=last_memory,
    )
