from fastapi import APIRouter, Query

from app.schemas.schemas import ReadinessReport
from app.readiness.engine import readiness_engine

router = APIRouter(prefix="/readiness", tags=["readiness"])


@router.get("", response_model=ReadinessReport)
async def get_readiness(user_id: str = Query(...)):
    """Generate interview readiness scores for a user."""
    # In production, fetch skill_states, interview_history from Supabase.
    # MVP: return sample data demonstrating the engine.
    skill_states = [
        {"skill_name": "arrays", "mastery": 0.85},
        {"skill_name": "sorting", "mastery": 0.72},
        {"skill_name": "dfs", "mastery": 0.55},
        {"skill_name": "graphs", "mastery": 0.38},
        {"skill_name": "dp", "mastery": 0.30},
    ]

    interview_history = [
        {"evaluation": {"communication": 0.7}},
        {"evaluation": {"communication": 0.75}},
    ]

    return readiness_engine.assess(
        skill_states=skill_states,
        total_problems_solved=42,
        acceptance_rate=0.65,
        interview_history=interview_history,
    )
