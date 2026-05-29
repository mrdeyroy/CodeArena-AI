from __future__ import annotations

from app.schemas.schemas import ReadinessReport


class ReadinessEngine:
    """Deterministic interview readiness scoring. No AI."""

    def __init__(self):
        pass

    def assess(
        self,
        skill_states: list[dict],
        total_problems_solved: int,
        acceptance_rate: float,
        interview_history: list[dict] | None = None,
    ) -> ReadinessReport:
        if not skill_states:
            return ReadinessReport(
                dsa_readiness=0.0,
                problem_solving=0.0,
                communication=0.0,
                system_design=0.0,
                overall_readiness=0.0,
                weak_areas=[],
                strong_areas=[],
            )

        # Categorize skills
        dsa_skills = [s for s in skill_states if s.get("skill_name", "").lower() in _DSA_KEYWORDS]
        non_dsa = [s for s in skill_states if s.get("skill_name", "").lower() not in _DSA_KEYWORDS]

        dsa_readiness = self._category_readiness(dsa_skills or skill_states)
        problem_solving = self._problem_solving_score(total_problems_solved, acceptance_rate)

        # Communication: derived from interview history if available
        communication_score = 0.5
        if interview_history:
            comm_scores = []
            for h in interview_history:
                ev = h.get("evaluation", {})
                if isinstance(ev, dict):
                    comm_scores.append(ev.get("communication", 0.5))
            if comm_scores:
                communication_score = sum(comm_scores) / len(comm_scores)

        system_design = self._category_readiness(non_dsa) if non_dsa else dsa_readiness * 0.8

        overall = round(
            dsa_readiness * 0.4
            + communication_score * 0.2
            + problem_solving * 0.2
            + system_design * 0.2,
            3,
        )

        weak_areas, strong_areas = self._categorize_areas(skill_states)

        return ReadinessReport(
            dsa_readiness=round(dsa_readiness, 3),
            problem_solving=round(problem_solving, 3),
            communication=round(communication_score, 3),
            system_design=round(system_design, 3),
            overall_readiness=overall,
            weak_areas=weak_areas,
            strong_areas=strong_areas,
        )

    def _category_readiness(self, states: list[dict]) -> float:
        if not states:
            return 0.0
        return sum(s["mastery"] for s in states) / len(states)

    def _problem_solving_score(self, solved: int, acceptance: float) -> float:
        volume = min(solved / 50.0, 1.0)
        return round(volume * 0.5 + acceptance * 0.5, 3)

    def _categorize_areas(self, skill_states: list[dict]) -> tuple[list[str], list[str]]:
        weak: list[str] = []
        strong: list[str] = []
        for s in skill_states:
            name = s.get("skill_name", s.get("skill_id", ""))
            if s["mastery"] < 0.4:
                weak.append(name)
            elif s["mastery"] > 0.75:
                strong.append(name)
        return weak, strong


_DSA_KEYWORDS = {
    "array", "arrays", "string", "strings", "linked list", "stack", "queue",
    "tree", "trees", "binary tree", "bst", "graph", "graphs", "dfs", "bfs",
    "dynamic programming", "dp", "recursion", "backtracking", "greedy",
    "sorting", "searching", "hash", "heap", "trie", "segment tree",
    "two pointers", "sliding window", "binary search",
}

readiness_engine = ReadinessEngine()
