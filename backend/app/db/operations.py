"""Reusable Supabase database operations — thin helpers for common query patterns."""

from app.db.supabase import get_supabase


def fetch_skill_states(user_id: str) -> list[dict]:
    supabase = get_supabase()
    resp = supabase.from_("skill_states").select(
        "id, mastery, struggle_score, updated_at, skills!inner(id, name, category)"
    ).eq("user_id", user_id).execute()
    return resp.data or [] if resp else []


def fetch_user_problem_statuses(user_id: str) -> dict[str, str]:
    """Return {problem_id: status} mapping. Falls back to submissions if the status table is missing."""
    supabase = get_supabase()
    try:
        resp = supabase.from_("user_problem_status").select("problem_id, status").eq("user_id", user_id).execute()
        status_map: dict[str, str] = {}
        for row in (resp.data or [] if resp else []):
            status_map[row["problem_id"]] = row["status"]
        if status_map:
            return status_map
    except Exception:
        pass

    resp = supabase.from_("submissions") \
        .select("problem_id, status") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
    status_map = {}
    for s in (resp.data or [] if resp else []):
        pid = s["problem_id"]
        if pid not in status_map:
            status_map[pid] = "solved" if s["status"] == "accepted" else "attempted"
    return status_map


def upsert_user_problem_status(user_id: str, problem_id: str, status: str):
    """Insert or update user_problem_status if the table exists, otherwise it's a no-op."""
    supabase = get_supabase()
    try:
        existing = (
            supabase.from_("user_problem_status")
            .select("id, status")
            .eq("user_id", user_id)
            .eq("problem_id", problem_id)
            .maybe_single()
            .execute()
        )
        if existing and existing.data:
            current = existing.data["status"]
            if current == "solved":
                return
            if status == "solved" or current == "unsolved":
                supabase.from_("user_problem_status").update({
                    "status": status,
                    "updated_at": "now()",
                }).eq("id", existing.data["id"]).execute()
        else:
            supabase.from_("user_problem_status").insert({
                "user_id": user_id,
                "problem_id": problem_id,
                "status": status,
            }).execute()
    except Exception:
        pass


def fetch_recent_submissions(user_id: str, limit: int = 20) -> list[dict]:
    supabase = get_supabase()
    resp = supabase.from_("submissions").select(
        "id, status, runtime, memory, language, code, created_at, problems(id, title, difficulty, concepts)"
    ).eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return resp.data or [] if resp else []


def upsert_skill_state(user_id: str, skill_id: str, mastery: float, struggle: float = 0.0):
    supabase = get_supabase()
    existing = supabase.from_("skill_states").select("id").eq("user_id", user_id).eq("skill_id", skill_id).maybe_single().execute()
    if existing and existing.data:
        supabase.from_("skill_states").update({
            "mastery": mastery,
            "struggle_score": struggle,
            "updated_at": "now()",
        }).eq("id", existing.data["id"]).execute()
    else:
        supabase.from_("skill_states").insert({
            "user_id": user_id,
            "skill_id": skill_id,
            "mastery": mastery,
            "struggle_score": struggle,
        }).execute()


def fetch_problems(filters: dict | None = None, select_columns: str = "*") -> list[dict]:
    supabase = get_supabase()
    query = supabase.from_("problems").select(select_columns)
    if filters:
        for k, v in filters.items():
            if k == "concept":
                query = query.contains("concepts", [v])
            elif k == "search":
                query = query.ilike("title", f"%{v}%")
            else:
                query = query.eq(k, v)
    resp = query.order("title").execute()
    return resp.data or [] if resp else []


def fetch_problem_by_slug(slug: str) -> dict | None:
    supabase = get_supabase()
    resp = supabase.from_("problems").select("*").eq("slug", slug.lower()).maybe_single().execute()
    return resp.data if resp else None


def fetch_problem_by_id(problem_id: str) -> dict | None:
    supabase = get_supabase()
    resp = supabase.from_("problems").select("*").eq("id", problem_id).maybe_single().execute()
    return resp.data if resp else None


def insert_submission(user_id: str, problem_id: str, language: str, code: str, status: str, runtime: float | None = None, memory: float | None = None) -> str:
    supabase = get_supabase()
    resp = supabase.from_("submissions").insert({
        "user_id": user_id,
        "problem_id": problem_id,
        "language": language,
        "code": code,
        "status": status,
        "runtime": runtime,
        "memory": memory,
    }).execute()
    return resp.data[0]["id"] if resp and resp.data else ""


def insert_telemetry_event(user_id: str, problem_id: str, time_taken: float, attempts: int, hints_used: int, confidence: int, correct: bool):
    supabase = get_supabase()
    supabase.from_("telemetry_events").insert({
        "user_id": user_id,
        "problem_id": problem_id,
        "time_taken": time_taken,
        "attempts": attempts,
        "hints_used": hints_used,
        "confidence": confidence,
        "correct": correct,
    }).execute()


def fetch_contests() -> list[dict]:
    supabase = get_supabase()
    resp = supabase.from_("contests").select("*").order("start_time", desc=True).execute()
    return resp.data or [] if resp else []


def fetch_contest_by_id(contest_id: str) -> dict | None:
    supabase = get_supabase()
    resp = supabase.from_("contests").select("*").eq("id", contest_id).maybe_single().execute()
    return resp.data if resp else None


def fetch_contest_leaderboard(contest_id: str) -> list[dict]:
    supabase = get_supabase()
    resp = supabase.from_("contest_submissions").select(
        "user_id, submissions(status, runtime)"
    ).eq("contest_id", contest_id).execute()

    user_scores: dict[str, dict] = {}
    for row in (resp.data or [] if resp else []):
        uid = row["user_id"]
        sub = row.get("submissions") or {}
        if uid not in user_scores:
            user_scores[uid] = {"user_id": uid, "score": 0, "problems_solved": 0, "total_runtime": 0.0}
        if sub.get("status") == "accepted":
            user_scores[uid]["score"] += 100
            user_scores[uid]["problems_solved"] += 1
            user_scores[uid]["total_runtime"] += sub.get("runtime", 0)

    leaderboard = sorted(user_scores.values(), key=lambda x: (-x["score"], x["total_runtime"]))
    return leaderboard


def fetch_skill_by_name(name: str) -> dict | None:
    supabase = get_supabase()
    resp = supabase.from_("skills").select("*").eq("name", name).maybe_single().execute()
    return resp.data if resp else None


def fetch_user_skill_state(user_id: str, skill_id: str) -> dict | None:
    supabase = get_supabase()
    resp = supabase.from_("skill_states").select("*").eq("user_id", user_id).eq("skill_id", skill_id).maybe_single().execute()
    return resp.data if resp else None
