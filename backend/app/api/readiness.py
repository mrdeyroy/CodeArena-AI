from fastapi import APIRouter, Query

from app.schemas.schemas import ReadinessReport
from app.readiness.engine import readiness_engine
from app.db.supabase import get_supabase
from app.db.operations import fetch_skill_states, fetch_recent_submissions

router = APIRouter(prefix="/readiness", tags=["readiness"])


@router.get("", response_model=ReadinessReport)
async def get_readiness(user_id: str = Query(...)):
    """Generate interview readiness scores for a user by querying database tables."""
    from fastapi.concurrency import run_in_threadpool
    import asyncio

    supabase = get_supabase()

    def fetch_interviews():
        return supabase.from_("interviews").select("id").eq("user_id", user_id).execute()

    states_task = run_in_threadpool(fetch_skill_states, user_id)
    subs_task = run_in_threadpool(fetch_recent_submissions, user_id, 1000)
    interviews_task = run_in_threadpool(fetch_interviews)

    states, subs, interviews_resp = await asyncio.gather(
        states_task, subs_task, interviews_task
    )

    # 1. Process skill states
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

    # 2. Process submissions
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

    # 3. Process interview responses
    interview_history = []
    interview_ids = [row["id"] for row in (interviews_resp.data or [])]
    if interview_ids:
        try:
            def fetch_responses():
                return supabase.from_("interview_responses").select("evaluation").in_("interview_id", interview_ids).execute()
            responses_resp = await run_in_threadpool(fetch_responses)
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
