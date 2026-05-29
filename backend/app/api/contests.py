from fastapi import APIRouter, Depends, HTTPException

from app.db.supabase import get_supabase
from app.db.operations import fetch_contests, fetch_contest_by_id, fetch_contest_leaderboard

router = APIRouter(prefix="/contests", tags=["contests"])


@router.get("")
async def list_contests(supabase=Depends(get_supabase)):
    contests = fetch_contests()
    return {"contests": contests}


@router.get("/{contest_id}")
async def get_contest(contest_id: str, supabase=Depends(get_supabase)):
    contest = fetch_contest_by_id(contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    return contest


@router.get("/{contest_id}/leaderboard")
async def get_leaderboard(contest_id: str, supabase=Depends(get_supabase)):
    contest = fetch_contest_by_id(contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    leaderboard = fetch_contest_leaderboard(contest_id)

    enriched: list[dict] = []
    for i, entry in enumerate(leaderboard):
        user_resp = supabase.from_("users").select("full_name").eq("id", entry["user_id"]).maybe_single().execute()
        user_name = (user_resp.data or {}).get("full_name", entry["user_id"]) if user_resp.data else entry["user_id"]
        enriched.append({
            "rank": i + 1,
            "user_id": entry["user_id"],
            "user_name": user_name,
            "score": entry["score"],
            "problems_solved": entry["problems_solved"],
            "total_time": entry.get("total_runtime", 0),
        })

    return {"contest_id": contest_id, "leaderboard": enriched}
