"""Problems router: list, detail, run, and submit coding problems.

All problem data is served directly from leetcode_details_cache.json — no database reads or auth required.
"""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

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

router = APIRouter(prefix="/problems", tags=["problems"])
piston = PistonService()

# ── Load all problems from the leetcode details cache ──────────
CACHE_PATH = Path(__file__).parent.parent.parent / "scripts" / "leetcode_details_cache.json"

_problem_index: dict[str, dict] = {}   # slug → parsed problem dict
_problem_list: list[dict] = []         # all problems for listing/filtering

def _load_cache():
    global _problem_index, _problem_list
    if _problem_index:
        return
    if not CACHE_PATH.exists():
        print(f"WARNING: leetcode_details_cache.json not found at {CACHE_PATH}")
        return
    from app.utils.leetcode import parse_leetcode_detail
    with open(CACHE_PATH) as f:
        raw = json.load(f)
    parsed = []
    for slug, detail in raw.items():
        p = parse_leetcode_detail(slug, detail)
        _problem_index[slug] = p
        parsed.append(p)
    # sort by title for consistent listing order
    parsed.sort(key=lambda p: p["title"])
    _problem_list = parsed
    print(f"Loaded {len(_problem_list)} problems from leetcode_details_cache.json")

_load_cache()


@router.get("", response_model=list[ProblemListItem])
async def list_problems(
    difficulty: str | None = Query(None),
    topic: str | None = Query(None),
    company: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    # ── filter from local cache — zero DB reads ──────────────────
    problems = _problem_list
    if difficulty:
        d = difficulty.lower()
        problems = [p for p in problems if p["difficulty"] == d]
    if topic:
        problems = [p for p in problems if topic in (p.get("concepts") or [])]
    if company:
        problems = [p for p in problems if company.lower() in (c.lower() for c in (p.get("companies") or []))]
    if search:
        s = search.lower()
        problems = [p for p in problems if s in p["title"].lower() or s in p["slug"].lower()]

    items: list[ProblemListItem] = []
    for p in problems:
        items.append(ProblemListItem(
            id=p["slug"],
            title=p["title"],
            slug=p["slug"],
            difficulty=p["difficulty"],
            acceptance_rate=p.get("acceptance_rate") or 0.0,
            estimated_time=p.get("estimated_time") or "",
            concepts=p.get("concepts") or [],
            companies=p.get("companies") or [],
            status="Unsolved",
            is_ai_recommended=False,
        ))

    return items


@router.get("/{slug:path}", response_model=Problem)
async def get_problem(slug: str):
    p = _problem_index.get(slug.lower())
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return Problem(
        id=p["slug"],
        title=p["title"],
        slug=p["slug"],
        difficulty=p["difficulty"],
        description=p.get("description") or "",
        constraints=p.get("constraints") or "",
        examples=p.get("examples") or [],
        concepts=p.get("concepts") or [],
        acceptance_rate=p.get("acceptance_rate") or 0.0,
        estimated_time=p.get("estimated_time") or "",
        companies=p.get("companies") or [],
        starter_code=p.get("starter_code") or {},
        hints=p.get("hints") or [],
        editorial=p.get("editorial"),
    )


@router.post("/{problem_id}/run", response_model=ProblemRunResult)
async def run_problem(
    problem_id: str,
    request: ProblemRunRequest,
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
):
    p = _problem_index.get(problem_id.lower())
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    examples = p.get("examples") or []
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

    return ProblemSubmitResult(
        submission_id=problem_id,
        status=last_status,
        passed_tests=passed,
        total_tests=total,
        runtime=last_runtime,
        memory=last_memory,
    )
