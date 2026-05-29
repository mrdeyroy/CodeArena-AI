import json
import re

# ── Starter code language filter ──────────────────────────────────────
KEEP_LANGS = {"python", "c", "cpp", "java"}
LANG_SLUG_MAP = {
    "python": "python",
    "python3": "python",
    "c": "c",
    "cpp": "cpp",
    "java": "java",
}


def html_to_markdown(html: str) -> str:
    """Convert LeetCode HTML description to clean Markdown using html2text if available."""
    if not html:
        return ""
    try:
        import html2text
        h = html2text.HTML2Text()
        h.ignore_links = False
        h.ignore_images = True
        h.ignore_emphasis = False
        h.body_width = 0
        return h.handle(html).strip()
    except ImportError:
        # Fallback: basic tag stripping
        text = re.sub(r"<[^>]+>", "", html)
        text = text.replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">")
        text = text.replace("&amp;", "&").replace("&quot;", '"')
        return "\n".join(line.strip() for line in text.split("\n") if line.strip())


def extract_acceptance_rate_from_stats(stats_str: str | None) -> float:
    """Parse the stats JSON field to extract acceptance rate."""
    if not stats_str:
        return 0.0
    try:
        stats = json.loads(stats_str)
        return float(stats.get("totalAcceptedRaw", 0)) / max(float(stats.get("totalSubmissionRaw", 1)), 1) * 100
    except (json.JSONDecodeError, ValueError, ZeroDivisionError):
        return 0.0


def extract_companies(company_tag_stats: str | None) -> list[str]:
    """Extract company names from LeetCode's companyTagStats JSON."""
    if not company_tag_stats:
        return []
    try:
        data = json.loads(company_tag_stats)
        companies = []
        if isinstance(data, dict):
            for entry_type in ("enabled", "disabled"):
                for entry in data.get(entry_type, []):
                    name = entry.get("name") or entry.get("slug", "")
                    if name:
                        companies.append(name)
        elif isinstance(data, list):
            companies = [item.get("name", "") for item in data if item.get("name")]
        return list(dict.fromkeys(companies))[:20]  # deduplicate, limit to 20
    except (json.JSONDecodeError, TypeError):
        return []


def estimate_time(difficulty: str, ac_rate: float) -> str:
    """Estimate solve time based on difficulty and acceptance rate."""
    base = {"Easy": "15 mins", "Medium": "30 mins", "Hard": "45 mins"}
    if ac_rate < 30:
        return {"Easy": "20 mins", "Medium": "40 mins", "Hard": "60 mins"}.get(difficulty, base.get(difficulty, "30 mins"))
    if ac_rate > 60:
        return {"Easy": "10 mins", "Medium": "25 mins", "Hard": "35 mins"}.get(difficulty, base.get(difficulty, "30 mins"))
    return base.get(difficulty, "30 mins")


def slug_to_concept(slug: str) -> str:
    """Map LeetCode topic slugs to readable concept names."""
    mapping = {
        "array": "Arrays",
        "hash-table": "Hashing",
        "string": "Strings",
        "linked-list": "Linked Lists",
        "two-pointers": "Two Pointers",
        "sliding-window": "Sliding Window",
        "stack": "Stacks",
        "queue": "Queues",
        "binary-search": "Binary Search",
        "binary-tree": "Binary Trees",
        "tree": "Trees",
        "graph": "Graphs",
        "depth-first-search": "DFS",
        "breadth-first-search": "BFS",
        "dynamic-programming": "Dynamic Programming",
        "recursion": "Recursion",
        "backtracking": "Backtracking",
        "greedy": "Greedy Algorithms",
        "sorting": "Sorting",
        "heap-priority-queue": "Heaps",
        "trie": "Trie",
        "divide-and-conquer": "Divide & Conquer",
        "bit-manipulation": "Bit Manipulation",
        "math": "Math",
        "geometry": "Geometry",
        "simulation": "Simulation",
        "enumeration": "Enumeration",
        "memoization": "Memoization",
        "union-find": "Union Find",
        "segment-tree": "Segment Tree",
        "prefix-sum": "Prefix Sum",
        "counting": "Counting",
        "design": "Design",
        "matrix": "Matrix",
        "monotonic-stack": "Monotonic Stack",
        "topological-sort": "Topological Sort",
        "shortest-path": "Shortest Path",
        "number-theory": "Number Theory",
        "combinatorics": "Combinatorics",
        "interactive": "Interactive",
        "data-stream": "Data Streams",
        "iterator": "Iterator",
        "brainteaser": "Brainteaser",
        "reservoir-sampling": "Reservoir Sampling",
        "game-theory": "Game Theory",
        "probability": "Probability",
        "randomized": "Randomized",
        "quickselect": "Quickselect",
        "bucket-sort": "Bucket Sort",
        "radix-sort": "Radix Sort",
        "counting-sort": "Counting Sort",
        "merge-sort": "Merge Sort",
        "shell": "Shell Sort",
        "rolling-hash": "Rolling Hash",
        "suffix-array": "Suffix Array",
        "hash-function": "Hash Function",
        "minimum-spanning-tree": "MST",
        "strongly-connected-component": "SCC",
        "eulerian-circuit": "Eulerian Path",
        "biconnected-component": "Biconnected",
        "line-sweep": "Line Sweep",
        "convex-hull": "Convex Hull",
    }
    return mapping.get(slug, slug.replace("-", " ").title())


def parse_leetcode_detail(slug: str, detail: dict) -> dict:
    """Convert raw LeetCode detail json structure into clean metadata dict."""
    title = detail.get("title", "")
    difficulty = detail.get("difficulty", "Medium")
    
    # Estimate solve time based on stats
    ac_rate = 40.0
    stats_str = detail.get("stats")
    if stats_str:
        ac_rate = extract_acceptance_rate_from_stats(stats_str)
        
    estimated_t = estimate_time(difficulty, ac_rate)
    
    # Starter code
    starter_code = {}
    snippets = detail.get("codeSnippets") or []
    for snippet in snippets:
        lang_slug = snippet.get("langSlug", "")
        if lang_slug in LANG_SLUG_MAP:
            key = LANG_SLUG_MAP[lang_slug]
            starter_code[key] = snippet.get("code", "")
            
    # Topics/concepts
    tags = detail.get("topicTags") or []
    concepts = [slug_to_concept(t.get("slug", "")) for t in tags if t.get("slug")]
    
    # Description Markdown
    description = html_to_markdown(detail.get("content") or "")
    
    # Constraints
    constraints = ""
    if "Constraints:" in description:
        parts = description.split("Constraints:", 1)
        constraints = parts[1].strip()
        
    return {
        "title": title,
        "slug": slug,
        "difficulty": difficulty.lower(),
        "description": description,
        "constraints": constraints,
        "acceptance_rate": round(ac_rate, 1),
        "estimated_time": estimated_t,
        "concepts": concepts,
        "companies": extract_companies(detail.get("companyTagStats")),
        "starter_code": starter_code,
        "hints": detail.get("hints") or [],
        "editorial": html_to_markdown(detail.get("solution").get("content")) if detail.get("solution") and detail.get("solution").get("content") else None
    }
