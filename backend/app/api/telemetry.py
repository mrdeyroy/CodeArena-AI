from fastapi import APIRouter, Depends, HTTPException

from app.schemas.schemas import TelemetryInput
from app.telemetry.engine import telemetry_engine
from app.db.supabase import get_supabase
from app.db.operations import upsert_skill_state, fetch_skill_by_name, fetch_user_skill_state

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("")
async def post_telemetry(event: TelemetryInput, supabase=Depends(get_supabase)):
    mastery = telemetry_engine.compute_mastery(event)
    struggle = telemetry_engine.compute_struggle(event)

    supabase.from_("telemetry_events").insert({
        "user_id": event.user_id,
        "problem_id": event.problem_id,
        "time_taken": event.time_taken,
        "attempts": event.attempts,
        "hints_used": event.hints_used,
        "confidence": event.confidence,
        "correct": event.correct,
    }).execute()

    problem_resp = supabase.from_("problems").select("concepts").eq("id", event.problem_id).maybe_single().execute()
    concepts = (problem_resp.data or {}).get("concepts") or []

    for concept_name in concepts:
        skill = fetch_skill_by_name(concept_name)
        if not skill:
            continue
        existing_state = fetch_user_skill_state(event.user_id, skill["id"])
        if existing_state:
            new_mastery = telemetry_engine.update_mastery_ewma(existing_state["mastery"], mastery)
        else:
            new_mastery = mastery
        upsert_skill_state(event.user_id, skill["id"], new_mastery, struggle)

    return {
        "mastery": mastery,
        "struggle_score": struggle,
    }
