from fastapi import APIRouter, Depends, HTTPException, Query

from app.db.supabase import get_supabase
from app.db.operations import fetch_skill_states
from app.graph.engine import skill_graph_service
from app.ai.agents import generate_roadmap
from app.schemas.schemas import GraphResponse, SkillNode, SkillEdge, GraphNodeInsights

router = APIRouter(prefix="/graph", tags=["skill-graph"])


@router.get("", response_model=GraphResponse)
async def get_graph(supabase=Depends(get_supabase)):
    from fastapi.concurrency import run_in_threadpool
    import asyncio

    def fetch_skills():
        return supabase.from_("skills").select("*").order("name").execute()
    def fetch_deps():
        return supabase.from_("skill_dependencies").select("*").execute()
    def fetch_problem_concepts():
        return supabase.from_("problems").select("slug, concepts, difficulty, title").execute()

    skills_task = run_in_threadpool(fetch_skills)
    deps_task = run_in_threadpool(fetch_deps)
    problems_task = run_in_threadpool(fetch_problem_concepts)

    skills_resp, deps_resp, problems_resp = await asyncio.gather(skills_task, deps_task, problems_task)

    all_problems = problems_resp.data or []
    skill_id_to_name = {s["id"]: s["name"] for s in (skills_resp.data or [])}

    def count_problems_for_skill(skill_name: str) -> int:
        count = 0
        for p in all_problems:
            concepts = p.get("concepts") or []
            for c in concepts:
                if skill_name.lower() in c.lower() or c.lower() in skill_name.lower():
                    count += 1
                    break
        return count

    nodes = []
    for s in (skills_resp.data or []):
        nodes.append(SkillNode(
            id=s["id"],
            name=s["name"],
            description=s.get("description", ""),
            category=s.get("category", "general"),
            problem_count=count_problems_for_skill(s["name"]),
        ))

    edges = [SkillEdge(
        id=e["id"],
        source_skill=e["source_skill"],
        target_skill=e["target_skill"],
        weight=e.get("weight", 1.0),
    ) for e in (deps_resp.data or [])]

    return GraphResponse(nodes=nodes, edges=edges)


@router.get("/nodes/{node_id}/insights", response_model=GraphNodeInsights)
async def get_node_insights(
    node_id: str,
    user_id: str = Query(...),
    supabase=Depends(get_supabase),
):
    node_resp = supabase.from_("skills").select("*").eq("id", node_id).maybe_single().execute()
    if not node_resp.data:
        raise HTTPException(status_code=404, detail="Skill node not found")
    node = node_resp.data

    skills_resp = supabase.from_("skills").select("*").execute()
    deps_resp = supabase.from_("skill_dependencies").select("*").execute()

    graph = skill_graph_service.build_graph(
        nodes=skills_resp.data or [],
        edges=deps_resp.data or [],
    )

    skill_states = fetch_skill_states(user_id)
    mastery_map: dict[str, float] = {}
    weak_skills: list[str] = []
    for s in skill_states:
        skill_data = s.get("skills") or {}
        sid = skill_data.get("id") or "Unknown"
        m = s["mastery"]
        mastery_map[sid] = m
        if m < 0.5:
            weak_skills.append(skill_data.get("name") or sid)

    weak_prereqs = skill_graph_service.find_weak_prerequisites(
        graph, node_id, mastery_map, threshold=0.5
    )

    problems_resp = supabase.from_("problems").select("slug, concepts").execute()
    all_problems = problems_resp.data or []

    try:
        roadmap = await generate_roadmap(
            target_skill=node["name"],
            current_mastery=mastery_map,
            weak_skills=weak_skills,
        )
        insight_str = f"Your mastery of {node['name']} is {mastery_map.get(node_id, 0):.0%}. "
        if weak_prereqs:
            prereq_names = []
            for pid in weak_prereqs:
                for s in (skills_resp.data or []):
                    if s["id"] == pid:
                        prereq_names.append(s["name"])
                        break
            insight_str += f"Weak prerequisites: {', '.join(prereq_names)}. "
        insight_str += "Recommended next steps based on your learning path."
    except Exception:
        insight_str = f"Focus on strengthening {node['name']} fundamentals. Practice with recommended problems below."

    recommended_slugs: list[str] = []
    skill_id_to_name = {s["id"]: s["name"] for s in (skills_resp.data or [])}
    if weak_prereqs:
        for pid in weak_prereqs[:3]:
            skill_name = skill_id_to_name.get(pid)
            if not skill_name:
                continue
            for p in all_problems:
                concepts = p.get("concepts") or []
                if skill_name in concepts or any(skill_name in c for c in concepts):
                    slug = p.get("slug", "")
                    if slug and slug not in recommended_slugs:
                        recommended_slugs.append(slug)
                        break

    return GraphNodeInsights(
        ai_insight=insight_str,
        recommended_problems=recommended_slugs,
    )
