#!/usr/bin/env python3
"""
Seed script: Fetches ~100 coding problems from LeetCode's public GraphQL API,
converts to structured format, and inserts into Supabase.

Usage:
    cd backend
    python -m scripts.seed_problems

Environment: Uses .env file for Supabase credentials (same as the app).
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path

# Add backend root to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from app.config import settings
from app.db.supabase import get_supabase

# ── LeetCode GraphQL API ──────────────────────────────────────────────

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"
USER_AGENT = "CodeArenaAI/0.1 (seed-script; educational purposes)"

FETCH_LIST_QUERY = """
query problems($skip: Int, $take: Int) {
  problemsetQuestionList(
    categorySlug: ""
    limit: $take
    skip: $skip
    filters: {}
  ) {
    total
    questions {
      title
      titleSlug
      difficulty
      acRate
      topicTags { name slug }
      content
    }
  }
}
"""

FETCH_DETAIL_QUERY = """
query question($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    difficulty
    acRate
    content
    topicTags { name slug }
    hints
    codeSnippets { lang langSlug code }
    companyTagStats
    solution { content }
    stats
  }
}
"""

# ── Starter code language filter ──────────────────────────────────────
KEEP_LANGS = {"python", "c", "cpp", "java"}
# Map LeetCode language slugs to our language keys
LANG_SLUG_MAP = {
    "python": "python",
    "python3": "python",
    "c": "c",
    "cpp": "cpp",
    "java": "java",
}

CACHE_PATH = Path(__file__).parent / "leetcode_cache.json"


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
        import re
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
        "memoization": "Memoization",
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


async def fetch_json(client: httpx.AsyncClient, query: str, variables: dict) -> dict | None:
    """Execute a GraphQL query against LeetCode with rate limiting."""
    for attempt in range(3):
        try:
            resp = await client.post(
                LEETCODE_GRAPHQL,
                json={"query": query, "variables": variables},
                headers={"User-Agent": USER_AGENT, "Content-Type": "application/json"},
                timeout=30,
            )
            if resp.status_code == 429:
                wait = 2 ** attempt * 5
                print(f"  Rate limited. Waiting {wait}s...")
                await asyncio.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            if "errors" in data:
                print(f"  GraphQL error: {data['errors']}")
                return None
            return data.get("data")
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < 2:
                await asyncio.sleep(2 ** attempt * 2)
            else:
                return None
    return None


async def fetch_problem_list(client: httpx.AsyncClient, skip: int, take: int) -> list[dict]:
    """Fetch a page of problems from LeetCode."""
    data = await fetch_json(client, FETCH_LIST_QUERY, {"skip": skip, "take": take})
    if not data:
        return []
    questions = data.get("problemsetQuestionList", {}).get("questions", [])
    print(f"  Fetched {len(questions)} problems (skip={skip}, take={take})")
    return questions


async def fetch_problem_detail(client: httpx.AsyncClient, title_slug: str) -> dict | None:
    """Fetch detailed info for a single problem (hints, code snippets, editorial)."""
    data = await fetch_json(client, FETCH_DETAIL_QUERY, {"titleSlug": title_slug})
    if not data:
        return None
    return data.get("question")


def parse_problem(question: dict, detail: dict | None) -> dict | None:
    """Convert LeetCode API response into our problems table schema."""
    title = question.get("title", "")
    title_slug = question.get("titleSlug", "")
    difficulty = question.get("difficulty", "Medium").lower()
    ac_rate = question.get("acRate", 0.0)
    
    if isinstance(ac_rate, float) and ac_rate > 1:
        ac_rate = ac_rate / 100.0
    
    # Use detail for richer data if available
    hints = []
    starter_code = {"python": "", "c": "", "cpp": "", "java": ""}
    companies = []
    editorial = None
    
    if detail:
        hints = detail.get("hints") or []
        
        # Starter code: keep only Python, C, C++, Java
        snippets = detail.get("codeSnippets") or []
        for snippet in snippets:
            lang_slug = snippet.get("langSlug", "")
            if lang_slug in LANG_SLUG_MAP:
                key = LANG_SLUG_MAP[lang_slug]
                starter_code[key] = snippet.get("code", "")
        
        # Remove empty entries
        starter_code = {k: v for k, v in starter_code.items() if v}
        
        companies = extract_companies(detail.get("companyTagStats"))
        
        # Acceptance rate from stats if available
        stats_str = detail.get("stats")
        if stats_str:
            extracted = extract_acceptance_rate_from_stats(stats_str) / 100.0
            if extracted > 0:
                ac_rate = extracted
        
        # Editorial
        solution = detail.get("solution")
        if solution and solution.get("content"):
            editorial = html_to_markdown(solution["content"])

    # Parse HTML description to markdown
    raw_html = question.get("content") or ""
    description = html_to_markdown(raw_html)
    
    # Extract constraints from description (everything after "Constraints:")
    constraints = None
    if "Constraints:" in description:
        parts = description.split("Constraints:", 1)
        constraints = parts[1].strip()
    
    # Topic tags
    tags = question.get("topicTags") or []
    concepts = [slug_to_concept(t.get("slug", "")) for t in tags if t.get("slug")]
    concept_slugs = [t.get("slug", "") for t in tags if t.get("slug")]
    
    return {
        "title": title,
        "slug": title_slug,
        "difficulty": difficulty,
        "description": description,
        "constraints": constraints,
        "examples": [],  # LeetCode doesn't expose examples in structured format via GraphQL
        "concepts": concepts,
        "acceptance_rate": round(ac_rate, 4),
        "estimated_time": estimate_time(difficulty, ac_rate * 100),
        "companies": companies,
        "starter_code": starter_code,
        "hints": hints,
        "editorial": editorial,
        "source_url": f"https://leetcode.com/problems/{title_slug}",
    }


async def seed():
    """Main seed routine."""
    print("=" * 60)
    print("CodeArena AI — Problem Seed Script")
    print("=" * 60)
    print()
    
    # ── Load cache if exists ──────────────────────────────────────────
    cached_raw = None
    if CACHE_PATH.exists():
        try:
            with open(CACHE_PATH) as f:
                cached_raw = json.load(f)
            print(f"Loaded {len(cached_raw)} cached problems from {CACHE_PATH}")
        except (json.JSONDecodeError, Exception) as e:
            print(f"Cache load failed: {e}")
            cached_raw = None
    
    # ── Fetch from LeetCode ──────────────────────────────────────────
    if cached_raw is None:
        print("Fetching problems from LeetCode...")
        async with httpx.AsyncClient() as client:
            # Fetch 5 pages of 20 = 100 problems
            all_problems = []
            for page in range(5):
                skip = page * 20
                problems = await fetch_problem_list(client, skip, 20)
                all_problems.extend(problems)
                await asyncio.sleep(1)  # Rate limit buffer
            
            print(f"\nTotal fetched: {len(all_problems)}")
            
            if not all_problems:
                print("ERROR: No problems fetched from LeetCode. Check your network connection.")
                return
            
            # Save raw cache
            with open(CACHE_PATH, "w") as f:
                json.dump(all_problems, f, indent=2)
            print(f"Cached {len(all_problems)} raw problems to {CACHE_PATH}")
            
            # Fetch details for each problem (with rate limiting)
            print("\nFetching detailed info (hints, starter code, editorial)...")
            problem_details = {}
            for i, q in enumerate(all_problems):
                slug = q.get("titleSlug", "")
                print(f"  [{i+1}/{len(all_problems)}] {slug}...", end=" ", flush=True)
                detail = await fetch_problem_detail(client, slug)
                if detail:
                    problem_details[slug] = detail
                    print("OK")
                else:
                    print("SKIP")
                await asyncio.sleep(0.5)  # Rate limit buffer
    else:
        # Use cache — but we need to re-fetch details
        all_problems = cached_raw
        print(f"\nUsing {len(all_problems)} cached problems.")
        print("Fetching details for cached problems...")
        async with httpx.AsyncClient() as client:
            problem_details = {}
            for i, q in enumerate(all_problems):
                slug = q.get("titleSlug", "")
                print(f"  [{i+1}/{len(all_problems)}] {slug}...", end=" ", flush=True)
                detail = await fetch_problem_detail(client, slug)
                if detail:
                    problem_details[slug] = detail
                    print("OK")
                else:
                    print("SKIP")
                await asyncio.sleep(0.5)
    
    # Save details cache
    details_cache_path = CACHE_PATH.parent / "leetcode_details_cache.json"
    with open(details_cache_path, "w") as f:
        json.dump(problem_details, f, indent=2)
    print(f"\nCached {len(problem_details)} problem details.")
    
    # ── Parse into our format ─────────────────────────────────────────
    print("\nParsing problems into our schema...")
    parsed = []
    seen_slugs: set[str] = set()
    
    for q in all_problems:
        slug = q.get("titleSlug", "")
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        
        detail = problem_details.get(slug)
        parsed_problem = parse_problem(q, detail)
        if parsed_problem and parsed_problem.get("description"):
            parsed.append(parsed_problem)
    
    # Ensure difficulty diversity
    easy = [p for p in parsed if p["difficulty"] == "easy"]
    medium = [p for p in parsed if p["difficulty"] == "medium"]
    hard = [p for p in parsed if p["difficulty"] == "hard"]
    
    # Sample ~40 easy, ~40 medium, ~20 hard (or whatever we have)
    import random
    random.shuffle(easy)
    random.shuffle(medium)
    random.shuffle(hard)
    
    selected = easy[:40] + medium[:40] + hard[:20]
    # If we have fewer than expected, just take what we have
    if len(selected) < 60:
        selected = parsed[:100]
    
    selected = selected[:100]  # Cap at 100
    print(f"\nSelected {len(selected)} problems to insert:")
    print(f"  Easy: {len([p for p in selected if p['difficulty'] == 'easy'])}")
    print(f"  Medium: {len([p for p in selected if p['difficulty'] == 'medium'])}")
    print(f"  Hard: {len([p for p in selected if p['difficulty'] == 'hard'])}")
    
    # ── Insert into Supabase ──────────────────────────────────────────
    print("\nConnecting to Supabase...")
    supabase = get_supabase()
    
    # Check if we already have data
    existing = supabase.from_("problems").select("id", count="exact").limit(1).execute()
    existing_count = existing.count if hasattr(existing, 'count') else 0
    if existing_count and existing_count > 5:
        print(f"Already have {existing_count} problems in the DB. Skipping insert.")
        print("To re-seed, run: supabase.from_('problems').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()")
        return
    
    print(f"Inserting {len(selected)} problems into Supabase...")
    
    for i, problem in enumerate(selected):
        try:
            supabase.from_("problems").insert(problem).execute()
            if (i + 1) % 10 == 0:
                print(f"  Inserted {i+1}/{len(selected)}")
        except Exception as e:
            print(f"  ERROR inserting '{problem['title']}': {e}")
    
    print(f"\n✅ Done! Inserted {len(selected)} problems into Supabase.")
    print(f"   Table: problems")
    print(f"   Fields: title, slug, difficulty, description, constraints, concepts,")
    print(f"           acceptance_rate, estimated_time, companies, starter_code, hints, editorial")
    print()
    
    # ── Quick verification ────────────────────────────────────────────
    verify = supabase.from_("problems").select("id, title, slug, difficulty", count="exact").execute()
    print(f"Verification: {len(verify.data)} problems in database.")
    for p in verify.data[:5]:
        print(f"  - {p['title']} ({p['difficulty']})")


if __name__ == "__main__":
    asyncio.run(seed())
