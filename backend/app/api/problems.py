"""Problems router: list, detail, run, and submit coding problems."""

import json
from pathlib import Path
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

# Load mock metadata for fields not present in the DB
MOCK_DATA_PATH = Path(__file__).parent.parent / "db" / "mock-data.json"
mock_problems_metadata = {}
if MOCK_DATA_PATH.exists():
    try:
        with open(MOCK_DATA_PATH, "r") as f:
            data = json.load(f)
            for p in data.get("problems", []):
                mock_problems_metadata[p["slug"]] = p
    except Exception as e:
        print("Failed to load mock-data.json:", e)

# Load richer leetcode metadata from cached JSON
LEETCODE_CACHE_PATH = Path(__file__).parent.parent.parent / "scripts" / "leetcode_details_cache.json"
leetcode_cache_metadata = {}
if LEETCODE_CACHE_PATH.exists():
    try:
        from app.utils.leetcode import parse_leetcode_detail
        with open(LEETCODE_CACHE_PATH, "r") as f:
            raw_cache = json.load(f)
            for slug, detail in raw_cache.items():
                leetcode_cache_metadata[slug] = parse_leetcode_detail(slug, detail)
    except Exception as e:
        print("Failed to load leetcode_details_cache.json:", e)


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
        filters["difficulty"] = difficulty.lower()
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

        meta = leetcode_cache_metadata.get(p.get("slug", "")) or mock_problems_metadata.get(p.get("slug", "")) or {}
        items.append(ProblemListItem(
            id=p["id"],
            title=p["title"],
            slug=p.get("slug", ""),
            difficulty=p["difficulty"],
            acceptance_rate=round(meta.get("acceptance_rate") or meta.get("acceptanceRate") or p.get("acceptance_rate") or 0.0, 1),
            estimated_time=meta.get("estimated_time") or meta.get("estimatedTime") or p.get("estimated_time") or "",
            concepts=p.get("concepts") or meta.get("concepts") or meta.get("topics") or [],
            companies=meta.get("companies") or p.get("companies") or [],
            status=problem_status,
            is_ai_recommended=is_ai_recommended,
        ))

    return items


@router.get("/{slug:path}", response_model=Problem)
async def get_problem(slug: str):
    problem = fetch_problem_by_slug(slug)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if examples are missing
    examples = problem.get("examples") or []
    if not examples:
        from app.ai.agents import generate_test_cases
        examples = await generate_test_cases(problem["title"], problem.get("description", ""))
        if examples:
            try:
                supabase = get_supabase()
                supabase.from_("problems").update({"examples": examples}).eq("id", problem["id"]).execute()
                problem["examples"] = examples
            except Exception as e:
                print("Failed to save generated examples to DB:", e)

    # Check if starter code is missing
    starter_code = problem.get("starter_code") or {}
    starter_code = {k: v for k, v in starter_code.items() if v}
    if not starter_code:
        from app.ai.agents import generate_starter_code
        starter_code = await generate_starter_code(problem["title"], problem.get("description", ""))
        if starter_code:
            try:
                supabase = get_supabase()
                supabase.from_("problems").update({"starter_code": starter_code}).eq("id", problem["id"]).execute()
                problem["starter_code"] = starter_code
            except Exception as e:
                print("Failed to save generated starter code to DB:", e)

    meta = leetcode_cache_metadata.get(slug) or mock_problems_metadata.get(slug) or {}
    meta_constraints = meta.get("constraints") or ""
    if isinstance(meta_constraints, list):
        meta_constraints = "\n".join(meta_constraints)

    return Problem(
        id=problem["id"],
        title=problem["title"],
        slug=problem.get("slug", ""),
        difficulty=problem["difficulty"],
        description=problem.get("description", ""),
        constraints=problem.get("constraints") or meta_constraints,
        examples=problem.get("examples") or examples or meta.get("examples") or [],
        concepts=problem.get("concepts") or meta.get("concepts") or meta.get("topics") or [],
        acceptance_rate=round(meta.get("acceptance_rate") or meta.get("acceptanceRate") or problem.get("acceptance_rate") or 0.0, 1),
        estimated_time=meta.get("estimated_time") or meta.get("estimatedTime") or problem.get("estimated_time") or "",
        companies=meta.get("companies") or problem.get("companies") or [],
        starter_code=problem.get("starter_code") or starter_code or meta.get("starterCode") or meta.get("starter_code") or {},
        hints=meta.get("hints") or problem.get("hints") or [],
        editorial=problem.get("editorial") or meta.get("editorial"),
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
        from app.ai.agents import generate_test_cases
        examples = await generate_test_cases(problem["title"], problem.get("description", ""))
        if examples:
            try:
                supabase = get_supabase()
                supabase.from_("problems").update({"examples": examples}).eq("id", problem_id).execute()
                problem["examples"] = examples
            except Exception as e:
                print("Failed to save generated examples to DB:", e)

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
