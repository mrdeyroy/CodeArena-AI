#!/usr/bin/env python3
import json
import sys
from pathlib import Path

# Add backend root to path so we can import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.supabase import get_supabase
from app.utils.leetcode import parse_leetcode_detail

def main():
    print("Loading cached details from leetcode_details_cache.json...")
    cache_path = Path(__file__).parent / "leetcode_details_cache.json"
    if not cache_path.exists():
        print(f"Error: Cache file not found at {cache_path}")
        return
        
    with open(cache_path) as f:
        cache_data = json.load(f)
    
    print(f"Loaded {len(cache_data)} problems from cache.")
    
    supabase = get_supabase()
    
    parsed_problems = []
    for slug, detail in cache_data.items():
        parsed_meta = parse_leetcode_detail(slug, detail)
        if parsed_meta and parsed_meta.get("description"):
            # Select ONLY columns that are present in the 'problems' table in the database
            db_problem = {
                "title": parsed_meta["title"],
                "slug": parsed_meta["slug"],
                "difficulty": parsed_meta["difficulty"],
                "description": parsed_meta["description"],
                "constraints": parsed_meta["constraints"],
                "examples": [],  # Leave empty; API will auto-generate them using AI
                "concepts": parsed_meta["concepts"],
            }
            parsed_problems.append(db_problem)
            
    print(f"Parsed {len(parsed_problems)} valid problems to upload.")
    
    print("Upserting problems to Supabase 'problems' table...")
    success_count = 0
    for idx, p in enumerate(parsed_problems):
        try:
            # We upsert by 'slug' to update if it exists or insert if new
            supabase.from_("problems").upsert(p, on_conflict="slug").execute()
            success_count += 1
            if (idx + 1) % 10 == 0:
                print(f"  Upserted {idx+1}/{len(parsed_problems)}...")
        except Exception as e:
            print(f"  Error upserting '{p.get('title')}': {e}")
            
    print(f"Finished! Successfully upserted {success_count} problems into database.")

if __name__ == "__main__":
    main()
