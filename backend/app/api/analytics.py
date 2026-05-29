from fastapi import APIRouter, Depends, Query

from app.db.supabase import get_supabase
from app.db.operations import fetch_skill_states

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def get_overview(user_id: str = Query(...), supabase=Depends(get_supabase)):
    subs_resp = supabase.from_("submissions").select("id, status").eq("user_id", user_id).execute()
    submissions = subs_resp.data or []
    total_submissions = len(submissions)
    accepted = sum(1 for s in submissions if s["status"] == "accepted")
    total_solved = len({s.get("problem_id") for s in submissions if s["status"] == "accepted"})

    telemetry_resp = supabase.from_("telemetry_events").select("created_at").eq("user_id", user_id).execute()
    days = {e["created_at"][:10] for e in (telemetry_resp.data or []) if e.get("created_at")}

    acceptance_rate = round(accepted / total_submissions * 100, 1) if total_submissions > 0 else 0.0
    overall_readiness = 40.0

    skill_states = fetch_skill_states(user_id)
    if skill_states:
        overall_readiness = round(sum(s["mastery"] for s in skill_states) / len(skill_states) * 100, 1)

    return {
        "total_problems_solved": total_solved,
        "total_submissions": total_submissions,
        "acceptance_rate": acceptance_rate,
        "current_streak": 0,
        "overall_readiness": overall_readiness,
        "active_days": len(days),
    }


@router.get("/skills")
async def get_skill_analytics(user_id: str = Query(...)):
    skill_states = fetch_skill_states(user_id)
    skills: list[dict] = []
    for s in skill_states:
        skill_data = s.get("skills") or {}
        skills.append({
            "skill_name": skill_data.get("name") or skill_data.get("id") or "Unknown",
            "mastery": s["mastery"],
            "problems_attempted": 0,
            "problems_solved": 0,
            "avg_time": 0,
        })
    return {"skills": skills}


@router.get("/progress")
async def get_progress(user_id: str = Query(...), supabase=Depends(get_supabase)):
    telemetry_resp = supabase.from_("telemetry_events").select("created_at, correct").eq("user_id", user_id).order("created_at").execute()
    events = telemetry_resp.data or []

    by_date: dict[str, dict] = {}
    for e in events:
        if not e.get("created_at"):
            continue
        date = e["created_at"][:10]
        if date not in by_date:
            by_date[date] = {"solved": 0, "total": 0}
        by_date[date]["total"] += 1
        if e.get("correct"):
            by_date[date]["solved"] += 1

    progress: list[dict] = []
    mastery = 0.0
    for date in sorted(by_date.keys()):
        d = by_date[date]
        mastery = round(min(1.0, mastery + 0.05), 2)
        progress.append({
            "date": date,
            "problems_solved": d["solved"],
            "avg_mastery": mastery,
            "readiness": round(mastery * 80, 1),
        })

    return {"progress": progress}
