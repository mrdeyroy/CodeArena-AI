from fastapi import APIRouter, Query

from app.schemas.schemas import ReadinessReport
from app.readiness.engine import readiness_engine
from app.db.supabase import get_supabase
from app.db.operations import fetch_skill_states, fetch_recent_submissions

router = APIRouter(prefix="/readiness", tags=["readiness"])


@router.get("", response_model=ReadinessReport)
async def get_readiness(user_id: str = Query(...)):
    """Generate interview readiness scores for a user by querying database tables."""
    supabase = get_supabase()

    # 1. Fetch skill states dynamically
    states = fetch_skill_states(user_id)
    skill_states = []
    for s in states:
        if s.get("skills"):
            skill_states.append({
                "skill_name": s["skills"]["name"],
                "mastery": s["mastery"]
            })

    # Robust fallback: if user has no skill states, initialize them with 0.0 from available skills
    if not skill_states:
        try:
            skills_resp = supabase.from_("skills").select("name").execute()
            for row in (skills_resp.data or []):
                skill_states.append({
                    "skill_name": row["name"],
                    "mastery": 0.0
                })
        except Exception:
            pass

    # 2. Fetch submissions to calculate solved counts and acceptance rate
    subs = fetch_recent_submissions(user_id, limit=1000)
    solved_problems = set()
    total_subs = len(subs)
    accepted_subs = 0

    for s in subs:
        if s.get("status") in ("accepted", "Accepted"):
            accepted_subs += 1
            if s.get("problems"):
                solved_problems.add(s["problems"]["id"])

    total_solved = len(solved_problems)
    ac_rate = (accepted_subs / total_subs) if total_subs > 0 else 0.0

    # 3. Fetch interview response logs for communication evaluation averages
    interview_history = []
    try:
        interviews_resp = supabase.from_("interviews").select("id").eq("user_id", user_id).execute()
        interview_ids = [row["id"] for row in (interviews_resp.data or [])]

        if interview_ids:
            responses_resp = supabase.from_("interview_responses").select("evaluation").in_("interview_id", interview_ids).execute()
            for row in (responses_resp.data or []):
                eval_data = row.get("evaluation")
                if eval_data and isinstance(eval_data, dict) and "communication" in eval_data:
                    interview_history.append({"evaluation": eval_data})
    except Exception:
        pass

    return readiness_engine.assess(
        skill_states=skill_states,
        total_problems_solved=total_solved,
        acceptance_rate=ac_rate,
        interview_history=interview_history or None,
    )
