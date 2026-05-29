from __future__ import annotations


class SkillGraphService:
    """Manages the skill prerequisite graph."""

    def __init__(self):
        pass

    def build_graph(self, nodes: list[dict], edges: list[dict]) -> dict:
        adjacency: dict[str, list[str]] = {}
        reverse: dict[str, list[str]] = {}
        name_map: dict[str, str] = {}

        for n in nodes:
            nid = n["id"]
            adjacency[nid] = []
            reverse[nid] = []
            name_map[nid] = n.get("name", nid)

        for e in edges:
            src = e["source_skill"]
            tgt = e["target_skill"]
            adjacency.setdefault(src, []).append(tgt)
            reverse.setdefault(tgt, []).append(src)

        return {"adjacency": adjacency, "reverse": reverse, "name_map": name_map, "nodes": nodes, "edges": edges}

    def find_weak_prerequisites(
        self, graph: dict, skill_id: str, mastery_map: dict[str, float], threshold: float = 0.5
    ) -> list[str]:
        """Walk backward from skill_id to find prerequisites below mastery threshold."""
        reverse = graph["reverse"]
        weak = []
        visited: set[str] = set()

        def _dfs(current: str):
            if current in visited:
                return
            visited.add(current)
            m = mastery_map.get(current, 0.0)
            if m < threshold:
                weak.append(current)
            for prereq in reverse.get(current, []):
                _dfs(prereq)

        _dfs(skill_id)
        return weak

    def generate_recommendations(
        self, graph: dict, user_skill_states: list[dict], top_n: int = 5
    ) -> list[dict]:
        """Return prioritized list of skills the user should practice."""
        mastery_map = {s["skill_id"]: s["mastery"] for s in user_skill_states}
        adjacency = graph["adjacency"]
        name_map = graph["name_map"]
        scored: list[tuple[str, float, bool]] = []

        for state in user_skill_states:
            sid = state["skill_id"]
            m = state["mastery"]
            # A skill with low mastery is a candidate
            candidates = adjacency.get(sid, [])
            for cid in candidates:
                cm = mastery_map.get(cid, 0.0)
                if cm < 0.6:
                    priority = (1.0 - cm) * 1.5
                    # If the prerequisite itself has low mastery, bump priority
                    if m < 0.5:
                        priority *= 1.3
                    scored.append((cid, priority, cm < 0.3))

        scored.sort(key=lambda x: (x[2], x[1]), reverse=True)
        seen: set[str] = set()
        result: list[dict] = []
        for sid, pri, urgent in scored:
            if sid in seen:
                continue
            seen.add(sid)
            result.append({
                "skill_id": sid,
                "skill_name": name_map.get(sid, sid),
                "priority": round(pri, 3),
                "urgent": urgent,
            })
            if len(result) >= top_n:
                break
        return result


skill_graph_service = SkillGraphService()
