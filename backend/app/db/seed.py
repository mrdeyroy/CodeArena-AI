import json
import os
from pathlib import Path
from app.db.supabase import get_supabase

# Helper functions for deterministic UUIDs
def get_skill_uuid(name_or_id: str) -> str:
    mapping = {
        "node_arrays": "00000000-0000-0000-0000-000000000101",
        "Arrays & Hashing": "00000000-0000-0000-0000-000000000101",
        "node_pointers": "00000000-0000-0000-0000-000000000102",
        "Two Pointers": "00000000-0000-0000-0000-000000000102",
        "node_sliding": "00000000-0000-0000-0000-000000000103",
        "Sliding Window": "00000000-0000-0000-0000-000000000103",
        "node_trees": "00000000-0000-0000-0000-000000000104",
        "Binary Trees": "00000000-0000-0000-0000-000000000104",
        "node_graphs": "00000000-0000-0000-0000-000000000105",
        "Graphs": "00000000-0000-0000-0000-000000000105",
        "node_dp": "00000000-0000-0000-0000-000000000106",
        "Dynamic Programming": "00000000-0000-0000-0000-000000000106",
        "node_greedy": "00000000-0000-0000-0000-000000000107",
        "Greedy Algorithms": "00000000-0000-0000-0000-000000000107",
    }
    return mapping.get(name_or_id, "00000000-0000-0000-0000-000000000199")

def get_problem_uuid(problem_id: str) -> str:
    num = int(problem_id.split("_")[1])
    return f"00000000-0000-0000-0000-0000000003{num:02d}"

def get_contest_uuid(contest_id: str) -> str:
    num = int(contest_id.split("_")[1])
    return f"00000000-0000-0000-0000-0000000004{num:02d}"

def run_seed():
    sb = get_supabase()
    json_path = Path(__file__).parent / "mock-data.json"
    if not json_path.exists():
        print("mock-data.json not found!")
        return

    with open(json_path, "r") as f:
        data = json.load(f)

    # 1. Seed user
    print("Seeding user...")
    user_id = "00000000-0000-0000-0000-000000000000"
    sb.table("users").upsert({
        "id": user_id,
        "email": "alex.rivera@dev.io",
        "full_name": "Alex Rivera"
    }).execute()

    # 2. Seed skills
    print("Seeding skills...")
    for s in data["skills"]:
        sb.table("skills").upsert({
            "id": get_skill_uuid(s["id"]),
            "name": s["label"],
            "description": s["description"],
            "category": "dsa"
        }).execute()

    # 3. Seed skill dependencies
    print("Seeding skill dependencies...")
    for e in data["edges"]:
        try:
            sb.table("skill_dependencies").upsert({
                "source_skill": get_skill_uuid(e["source"]),
                "target_skill": get_skill_uuid(e["target"])
            }).execute()
        except Exception as err:
            # If it already exists, that's fine
            pass

    # 4. Seed problems
    print("Seeding problems...")
    for p in data["problems"]:
        difficulty = p["difficulty"].lower()
        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "medium"
        constraints = "\n".join(p["constraints"]) if isinstance(p["constraints"], list) else p["constraints"]
        sb.table("problems").upsert({
            "id": get_problem_uuid(p["id"]),
            "title": p["title"],
            "difficulty": difficulty,
            "description": p["description"],
            "constraints": constraints,
            "examples": p["examples"],
            "concepts": p["topics"],
            "slug": p["slug"]
        }).execute()

    # 5. Seed contests
    print("Seeding contests...")
    for c in data["contests"]:
        p_uuids = [get_problem_uuid(pid) for pid in c["problems"]]
        sb.table("contests").upsert({
            "id": get_contest_uuid(c["id"]),
            "title": c["title"],
            "description": c["description"],
            "start_time": c["startTime"],
            "end_time": c["startTime"],
            "problem_ids": p_uuids
        }).execute()

    # 6. Seed initial user skill states so graph loads with scores
    print("Seeding initial user skill states...")
    for s in data["skills"]:
        # Seed user mastery states matching frontend's mock values so they are aligned
        mastery = s["mastery"] / 100.0
        struggle = 0.8 if s["status"] == "weak" else (0.1 if s["status"] == "mastered" else 0.4)
        try:
            sb.table("skill_states").upsert({
                "user_id": user_id,
                "skill_id": get_skill_uuid(s["id"]),
                "mastery": mastery,
                "struggle_score": struggle
            }).execute()
        except Exception as err:
            # If it already exists, that's fine
            pass

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    run_seed()
