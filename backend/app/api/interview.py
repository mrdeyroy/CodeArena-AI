from fastapi import APIRouter, Depends, HTTPException

from app.auth.auth import require_user
from app.db.supabase import get_supabase
from app.services.interview import interview_service
from app.schemas.schemas import (
    InterviewType,
    InterviewSessionRequest,
    InterviewSessionResponse,
    InterviewResponseRequest,
    InterviewEvaluateResponse,
    InterviewFinalizeResponse,
)

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/sessions", response_model=InterviewSessionResponse, status_code=201)
async def create_interview_session(
    request: InterviewSessionRequest,
    user: dict = Depends(require_user),
    supabase=Depends(get_supabase),
):
    questions = await interview_service.generate_questions(
        interview_type=request.interview_type.value if hasattr(request.interview_type, "value") else request.interview_type,
        count=3,
    )

    interview_type_str = request.interview_type.value if hasattr(request.interview_type, "value") else str(request.interview_type)
    interview_resp = supabase.from_("interviews").insert({
        "user_id": user["sub"],
        "interview_type": interview_type_str,
        "overall_score": 0.0,
    }).execute()

    if not interview_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create interview session")

    interview_id = interview_resp.data[0]["id"]

    for question in questions:
        supabase.from_("interview_responses").insert({
            "interview_id": interview_id,
            "question": question.get("text", str(question)),
            "answer": "",
            "evaluation": {},
        }).execute()

    return InterviewSessionResponse(
        session_id=interview_id,
        questions=questions,
    )


@router.post("/sessions/{session_id}/response", response_model=InterviewEvaluateResponse)
async def submit_interview_response(
    session_id: str,
    request: InterviewResponseRequest,
    user: dict = Depends(require_user),
    supabase=Depends(get_supabase),
):
    interview_resp = supabase.from_("interviews").select("*").eq("id", session_id).eq("user_id", user["sub"]).maybe_single().execute()
    if not interview_resp.data:
        raise HTTPException(status_code=404, detail="Interview session not found")

    responses_resp = supabase.from_("interview_responses").select("*").eq("interview_id", session_id).order("created_at").execute()
    responses = responses_resp.data or []

    next_unanswered = None
    for i, r in enumerate(responses):
        if not r.get("answer") or r["answer"] == "":
            next_unanswered = r
            break

    if not next_unanswered:
        raise HTTPException(status_code=400, detail="All questions have already been answered")

    question_text = next_unanswered.get("question", "")
    interview_type = interview_resp.data.get("interview_type", "dsa")

    result = await interview_service.evaluate_answer(
        question=question_text,
        answer=request.candidate_answer,
        interview_type=interview_type,
    )

    supabase.from_("interview_responses").update({
        "answer": request.candidate_answer,
        "evaluation": result,
    }).eq("id", next_unanswered["id"]).execute()

    return InterviewEvaluateResponse(
        technical_accuracy=result.get("technical_accuracy", 0),
        communication=result.get("communication", 0),
        depth=result.get("depth", 0),
        feedback=result.get("feedback", ""),
    )


@router.post("/sessions/{session_id}/finalize", response_model=InterviewFinalizeResponse)
async def finalize_interview_session(
    session_id: str,
    user: dict = Depends(require_user),
    supabase=Depends(get_supabase),
):
    interview_resp = supabase.from_("interviews").select("*").eq("id", session_id).eq("user_id", user["sub"]).maybe_single().execute()
    if not interview_resp.data:
        raise HTTPException(status_code=404, detail="Interview session not found")

    responses_resp = supabase.from_("interview_responses").select("*").eq("interview_id", session_id).execute()
    responses = responses_resp.data or []

    if not responses:
        raise HTTPException(status_code=400, detail="No responses found for this session")

    total_technical = 0.0
    total_communication = 0.0
    total_depth = 0.0
    count = 0
    strengths: list[str] = []
    weaknesses: list[str] = []

    for r in responses:
        eval_data = r.get("evaluation") or {}
        if not eval_data:
            continue
        total_technical += eval_data.get("technical_accuracy", 0)
        total_communication += eval_data.get("communication", 0)
        total_depth += eval_data.get("depth", 0)
        count += 1

    if count == 0:
        raise HTTPException(status_code=400, detail="No evaluated responses found")

    avg_technical = round(total_technical / count, 3)
    avg_communication = round(total_communication / count, 3)
    avg_depth = round(total_depth / count, 3)
    overall_score = round((avg_technical + avg_communication + avg_depth) / 3, 3)

    if avg_technical >= 0.7:
        strengths.append("Strong technical accuracy")
    else:
        weaknesses.append("Technical accuracy needs improvement")
    if avg_communication >= 0.7:
        strengths.append("Clear communication")
    else:
        weaknesses.append("Communication clarity needs improvement")
    if avg_depth >= 0.7:
        strengths.append("Deep knowledge demonstrated")
    else:
        weaknesses.append("Need to demonstrate deeper topic knowledge")

    supabase.from_("interviews").update({
        "overall_score": overall_score,
    }).eq("id", session_id).execute()

    return InterviewFinalizeResponse(
        interview_id=session_id,
        overall_score=overall_score,
        technical_accuracy=avg_technical,
        communication=avg_communication,
        depth=avg_depth,
        strengths=strengths or ["Completed interview"],
        weaknesses=weaknesses or ["Practice more interviews"],
    )


# ── Backward-compatible legacy endpoints ──────────────────────

from app.schemas.schemas import InterviewStartRequest, InterviewStartResponse, InterviewEvaluateRequest


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    try:
        questions = await interview_service.generate_questions(
            interview_type=request.interview_type, count=3
        )
        interview_id = "interview_" + request.user_id + "_" + request.interview_type
        return InterviewStartResponse(
            interview_id=interview_id,
            questions=questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview generation failed: {str(e)}")


@router.post("/evaluate", response_model=InterviewEvaluateResponse)
async def evaluate_answer(request: InterviewEvaluateRequest):
    try:
        result = await interview_service.evaluate_answer(
            question=request.question,
            answer=request.answer,
            interview_type="dsa",
        )
        return InterviewEvaluateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview evaluation failed: {str(e)}")
