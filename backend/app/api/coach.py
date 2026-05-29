"""Coach router: AI chat and weakness analysis."""

from fastapi import APIRouter, Depends, HTTPException

from app.auth.auth import require_user
from app.db.operations import fetch_skill_states, fetch_recent_submissions
from app.db.supabase import get_supabase
from app.ai.agents import ai_coach
from app.schemas.schemas import CoachChatRequest, CoachChatResponse, WeaknessItem

router = APIRouter(prefix="/coach", tags=["coach"])


@router.post("/chat", response_model=CoachChatResponse)
async def coach_chat(
    request: CoachChatRequest,
    user: dict = Depends(require_user),
):
    skill_states = fetch_skill_states(user["sub"])

    mastery: dict[str, float] = {}
    weak_skills: list[str] = []
    for s in skill_states:
        skill_data = s.get("skills") or {}
        name = skill_data.get("name") or skill_data.get("id") or "Unknown"
        m = s["mastery"]
        mastery[name] = m
        if m < 0.5:
            weak_skills.append(name)

    recent_subs = fetch_recent_submissions(user["sub"], 10)
    recent_failures: list[str] = []
    for sub in recent_subs:
        if sub.get("status") not in ("accepted", "pending", "processing"):
            problem = sub.get("problems") or {}
            title = problem.get("title", sub["problem_id"])
            recent_failures.append(title)

    result = await ai_coach(
        weak_topics=weak_skills,
        recent_failures=recent_failures,
        mastery=mastery,
        telemetry_summary=request.message,
    )

    reply = f"**Root cause**: {result.get('root_cause', 'N/A')}\n\n"
    reply += f"**Weak skills**: {', '.join(result.get('weak_skills', []) or [])}\n\n"
    reply += "**Recommendations**:\n" + "\n".join(f"- {r}" for r in (result.get("recommendations") or []))

    return CoachChatResponse(reply=reply)


@router.get("/weaknesses", response_model=list[WeaknessItem])
async def get_weaknesses(
    user: dict = Depends(require_user),
):
    skill_states = fetch_skill_states(user["sub"])
    weaknesses: list[WeaknessItem] = []

    for s in skill_states:
        if s["mastery"] < 0.5:
            skill_data = s.get("skills") or {}
            name = skill_data.get("name") or skill_data.get("id") or "Unknown"
            weaknesses.append(WeaknessItem(skill_name=name, mastery=s["mastery"]))

    weaknesses.sort(key=lambda w: w.mastery)
    return weaknesses
