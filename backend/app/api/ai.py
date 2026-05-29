from fastapi import APIRouter, HTTPException

from app.ai.agents import (
    generate_hint,
    explain_solution,
    ai_coach,
    generate_roadmap,
    recommend_problems,
    analyze_plagiarism,
)
from app.db.supabase import get_supabase
from app.schemas.schemas import (
    HintRequest,
    HintResponse,
    ExplainRequest,
    ExplainResponse,
    CoachRequest,
    CoachResponse,
    RoadmapRequest,
    RoadmapResponse,
    RecommendRequest,
    RecommendResponse,
    PlagiarismRequest,
    PlagiarismResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/hint", response_model=HintResponse)
async def get_hint(request: HintRequest):
    try:
        result = await generate_hint(
            problem_title=request.problem_title,
            problem_description=request.problem_description,
            concepts=request.concepts,
            mastery=request.mastery,
        )
        return HintResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI hint failed: {str(e)}")


@router.post("/explain", response_model=ExplainResponse)
async def explain(request: ExplainRequest):
    try:
        result = await explain_solution(
            problem_title=request.problem_title,
            problem_description=request.problem_description,
            solution_code=request.solution_code,
            language=request.language,
        )
        return ExplainResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")


@router.post("/coach", response_model=CoachResponse)
async def coach(request: CoachRequest):
    try:
        result = await ai_coach(
            weak_topics=request.weak_topics,
            recent_failures=request.recent_failures,
            mastery=request.mastery,
            telemetry_summary=request.telemetry_summary,
        )
        return CoachResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI coach failed: {str(e)}")


@router.post("/roadmap", response_model=RoadmapResponse)
async def roadmap(request: RoadmapRequest):
    try:
        result = await generate_roadmap(
            target_skill=request.target_skill,
            current_mastery=request.current_mastery,
            weak_skills=request.weak_skills,
        )
        return RoadmapResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI roadmap failed: {str(e)}")


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    # Fetch real problems from Supabase
    try:
        supabase = get_supabase()
        resp = supabase.from_("problems").select("id, title, difficulty, concepts").execute()
        available = resp.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query problems database: {str(e)}")
    
    if not available:
        raise HTTPException(status_code=400, detail="No practice problems found in database to recommend.")
    try:
        result = await recommend_problems(
            current_mastery=request.current_mastery,
            weak_topics=request.weak_topics,
            available_problems=available,
            recent_problem_ids=request.recent_problem_ids,
            count=request.count,
        )
        return RecommendResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI recommend failed: {str(e)}")


@router.post("/plagiarism", response_model=PlagiarismResponse)
async def plagiarism(request: PlagiarismRequest):
    try:
        result = await analyze_plagiarism(
            code_a=request.code_a,
            code_b=request.code_b,
            language=request.language,
        )
        return PlagiarismResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Plagiarism analysis failed: {str(e)}"
        )
