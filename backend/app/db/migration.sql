-- Migration to update database schema for CodeArena AI
-- Copy and paste this script into your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql) and click "Run".

-- 1. Add missing columns to the problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS acceptance_rate FLOAT DEFAULT 0.0;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS estimated_time TEXT DEFAULT '';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS companies JSONB DEFAULT '[]';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS starter_code JSONB DEFAULT '{}';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]';
ALTER TABLE problems ADD COLUMN IF NOT EXISTS editorial TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS source_url TEXT;

-- 2. Create the user_problem_status table for tracking solved/attempted/unsolved state
CREATE TABLE IF NOT EXISTS user_problem_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('solved', 'attempted', 'unsolved')) DEFAULT 'unsolved',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, problem_id)
);

-- 3. Create indexes for user_problem_status to optimize lookup times
CREATE INDEX IF NOT EXISTS idx_user_problem_status_user ON user_problem_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_status_problem ON user_problem_status(problem_id);

-- 4. Add composite index on submissions to speed up user+problem lookups
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);

-- 5. Reload PostgREST schema cache to ensure the API recognizes the changes immediately
NOTIFY pgrst, 'reload schema';
