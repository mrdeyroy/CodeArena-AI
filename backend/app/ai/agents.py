import json

from openai import OpenAI

from app.config import settings

_AI_SYSTEM = (
    "You are CodeArena AI, an expert coding mentor. "
    "Always respond with valid JSON exactly matching the requested schema. "
    "No extra text outside the JSON."
)


def _client() -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)


async def generate_hint(
    problem_title: str,
    problem_description: str,
    concepts: list[str],
    mastery: dict[str, float],
) -> dict:
    client = _client()
    concept_list = ", ".join(concepts)
    mastery_str = (
        ", ".join(f"{k}: {v:.2f}" for k, v in mastery.items()) if mastery else "unknown"
    )

    prompt = (
        f"Problem: {problem_title}\n"
        f"Description: {problem_description}\n"
        f"Concepts involved: {concept_list}\n"
        f"Student's mastery levels: {mastery_str}\n\n"
        "Provide ONE helpful hint that guides the student toward the solution "
        "without revealing the full answer. The hint should match their skill level "
        "— more detailed for lower mastery concepts, more subtle for higher mastery.\n\n"
        'Respond in JSON: {"hint": "your hint here"}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def explain_solution(
    problem_title: str,
    problem_description: str,
    solution_code: str,
    language: str,
) -> dict:
    client = _client()
    prompt = (
        f"Problem: {problem_title}\n"
        f"Description: {problem_description}\n"
        f"Solution ({language}):\n{solution_code}\n\n"
        "Explain the solution approach clearly. Include:\n"
        "- Step-by-step explanation of the algorithm\n"
        "- Time complexity analysis\n"
        "- Space complexity analysis\n"
        '- Respond in JSON: {"explanation": "...", "time_complexity": "...", "space_complexity": "..."}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def ai_coach(
    weak_topics: list[str],
    recent_failures: list[str],
    mastery: dict[str, float],
    telemetry_summary: str,
) -> dict:
    client = _client()
    weak_str = ", ".join(weak_topics) if weak_topics else "none reported"
    failures_str = ", ".join(recent_failures) if recent_failures else "none"
    mastery_str = (
        ", ".join(f"{k}: {v:.2f}" for k, v in mastery.items()) if mastery else "unknown"
    )

    prompt = (
        f"Weak topics: {weak_str}\n"
        f"Recent failed problems: {failures_str}\n"
        f"Mastery map: {mastery_str}\n"
        f"Telemetry summary: {telemetry_summary}\n\n"
        "As an expert coding mentor, analyze the student's weaknesses and:\n"
        "1. Identify the root cause of their struggles\n"
        "2. List the weak prerequisite skills holding them back\n"
        "3. Provide 3-5 actionable recommendations\n\n"
        'Respond in JSON: {"root_cause": "...", "weak_skills": ["skill1", "skill2"], "recommendations": ["rec1", "rec2", "rec3"]}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def generate_roadmap(
    target_skill: str,
    current_mastery: dict[str, float],
    weak_skills: list[str],
) -> dict:
    client = _client()
    mastery_str = (
        ", ".join(f"{k}: {v:.2f}" for k, v in current_mastery.items())
        if current_mastery
        else "none"
    )
    weak_str = ", ".join(weak_skills) if weak_skills else "none"

    prompt = (
        f"Target skill: {target_skill}\n"
        f"Current mastery: {mastery_str}\n"
        f"Known weak skills: {weak_str}\n\n"
        "Generate a structured learning roadmap to master the target skill. "
        "Each step should be a prerequisite or sub-skill that builds toward the target. "
        "Order them from foundational to advanced.\n\n"
        'Respond in JSON: {"roadmap": [{"step": 1, "skill": "...", "reason": "..."}, ...]}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def recommend_problems(
    current_mastery: dict[str, float],
    weak_topics: list[str],
    available_problems: list[dict],
    recent_problem_ids: list[str],
    count: int,
) -> dict:
    client = _client()
    weak_str = ", ".join(weak_topics) if weak_topics else "none"
    mastery_str = (
        ", ".join(f"{k}: {v:.2f}" for k, v in current_mastery.items())
        if current_mastery
        else "none"
    )

    problems_str = json.dumps(
        [
            {
                "id": p["id"],
                "title": p["title"],
                "difficulty": p["difficulty"],
                "concepts": p.get("concepts", []),
            }
            for p in available_problems
        ]
    )

    recent_str = ", ".join(recent_problem_ids) if recent_problem_ids else "none"

    prompt = (
        f"Student's mastery: {mastery_str}\n"
        f"Weak topics: {weak_str}\n"
        f"Recently solved problem IDs: {recent_str}\n"
        f"Available problems: {problems_str}\n\n"
        f"Recommend {count} problems that the student should solve next. "
        "Prioritize problems that target their weak areas but are at an appropriate difficulty level. "
        "Avoid problems they recently solved.\n\n"
        f'Respond in JSON: {{"recommended_problems": [{{"problem_id": "...", "title": "...", "reason": "..."}}]}}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def analyze_plagiarism(code_a: str, code_b: str, language: str) -> dict:
    client = _client()
    prompt = (
        f"Compare these two {language} code submissions for similarity:\n\n"
        f"Code A:\n{code_a}\n\nCode B:\n{code_b}\n\n"
        "Analyze structural similarity (AST-level patterns, algorithm approach, variable naming). "
        "Return a similarity score (0-100) and risk level (low/medium/high).\n\n"
        'Respond in JSON: {"similarity": 82, "risk": "medium"}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    return json.loads(resp.choices[0].message.content or "{}")


async def generate_test_cases(problem_title: str, problem_description: str) -> list[dict]:
    client = _client()
    prompt = (
        f"Problem: {problem_title}\n"
        f"Description: {problem_description}\n\n"
        "Extract or generate exactly 3 representative test cases for this coding problem. "
        "Each test case must contain:\n"
        "- input: string representing the standard input/arguments format (e.g. 'nums = [2,7,11,15], target = 9' or raw text input values)\n"
        "- output: string representing the expected return value or output\n"
        "- explanation: optional short description\n\n"
        'Respond in JSON format: {"examples": [{"input": "...", "output": "...", "explanation": "..."}]}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    try:
        data = json.loads(resp.choices[0].message.content or "{}")
        return data.get("examples", [])
    except Exception:
        return []


async def generate_starter_code(problem_title: str, problem_description: str) -> dict[str, str]:
    client = _client()
    prompt = (
        f"Problem: {problem_title}\n"
        f"Description: {problem_description}\n\n"
        "Generate function signature/class templates for this coding problem in the following languages: python, javascript, cpp, java.\n"
        "Keep them as empty template templates with standard commenting blocks.\n\n"
        'Respond in JSON format: {"python": "...", "javascript": "...", "cpp": "...", "java": "..."}'
    )

    resp = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": _AI_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
    )
    try:
        return json.loads(resp.choices[0].message.content or "{}")
    except Exception:
        return {}
