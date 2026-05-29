"""Submission status router: lightweight sync for solved/attempted/unsolved."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.auth import require_user
from app.db.supabase import get_supabase

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("/status")
async def get_submission_status(
    problem_id: str | None = Query(None),
    user: dict = Depends(require_user),
):
    """Fetch submission status(es) for a user.

    - With `problem_id`: returns status for one problem.
    - Without: returns all statuses for the user (for hydration on page load).
    """
    supabase = get_supabase()
    query = (
        supabase.from_("submissions")
        .select("problem_id, status, runtime, memory, created_at")
        .eq("user_id", user["sub"])
        .order("created_at", desc=True)
    )
    if problem_id:
        query = query.eq("problem_id", problem_id).limit(1)

    resp = query.execute()
    results = resp.data or []

    if problem_id:
        # Return single status
        if not results:
            return {"problem_id": problem_id, "status": "unsolved"}
        latest = results[0]
        return {
            "problem_id": problem_id,
            "status": "solved" if latest["status"] == "accepted" else "attempted",
            "runtime": latest.get("runtime"),
            "memory": latest.get("memory"),
        }

    # Return all statuses (deduplicated by problem_id, latest wins)
    seen: dict[str, dict] = {}
    for r in results:
        pid = r["problem_id"]
        if pid not in seen:
            seen[pid] = {
                "problem_id": pid,
                "status": "solved" if r["status"] == "accepted" else "attempted",
                "runtime": r.get("runtime"),
                "memory": r.get("memory"),
            }
    return {"statuses": list(seen.values())}


@router.post("/status")
async def update_submission_status(
    problem_id: str = Query(...),
    status: str = Query(...),
    user: dict = Depends(require_user),
):
    """Lightweight upsert: mark a problem as solved/attempted.

    This is a thin sync endpoint for the frontend to persist
    submission status without re-uploading full code.
    """
    if status not in ("solved", "attempted", "unsolved"):
        raise HTTPException(status_code=400, detail="Status must be solved, attempted, or unsolved")

    supabase = get_supabase()

    # Upsert into user_problem_status
    existing = (
        supabase.from_("user_problem_status")
        .select("id")
        .eq("user_id", user["sub"])
        .eq("problem_id", problem_id)
        .maybe_single()
        .execute()
    )

    db_status = "accepted" if status == "solved" else "wrong_answer" if status == "attempted" else "pending"

    if existing.data:
        supabase.from_("user_problem_status").update({
            "status": status,
            "updated_at": "now()",
        }).eq("id", existing.data["id"]).execute()
    else:
        supabase.from_("user_problem_status").insert({
            "user_id": user["sub"],
            "problem_id": problem_id,
            "status": status,
        }).execute()

    return {"problem_id": problem_id, "status": status}
