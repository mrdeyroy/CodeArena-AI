"""Submission status router: lightweight sync for solved/attempted/unsolved."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.auth import require_user
from app.db.supabase import get_supabase
from app.db.operations import fetch_user_problem_statuses, upsert_user_problem_status

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("/recent")
async def get_recent_submissions(
    limit: int = Query(10),
    user: dict = Depends(require_user),
):
    """Fetch recent submissions for the logged in user."""
    from app.db.operations import fetch_recent_submissions
    submissions = fetch_recent_submissions(user["sub"], limit=limit)
    return {"submissions": submissions}


@router.get("/status")
async def get_submission_status(
    problem_id: str | None = Query(None),
    user: dict = Depends(require_user),
):
    """Fetch submission status(es) from user_problem_status table."""
    status_map = fetch_user_problem_statuses(user["sub"])

    if problem_id:
        status = status_map.get(problem_id, "unsolved")
        return {"problem_id": problem_id, "status": status}

    return {
        "statuses": [
            {"problem_id": pid, "status": st}
            for pid, st in status_map.items()
        ]
    }


@router.post("/status")
async def update_submission_status(
    problem_id: str = Query(...),
    status: str = Query(...),
    user: dict = Depends(require_user),
):
    """Lightweight upsert: mark a problem as solved/attempted/unsolved."""
    if status not in ("solved", "attempted", "unsolved"):
        raise HTTPException(status_code=400, detail="Status must be solved, attempted, or unsolved")

    upsert_user_problem_status(user["sub"], problem_id, status)

    return {"problem_id": problem_id, "status": status}
