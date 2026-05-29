-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills (graph nodes)
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general'
);

-- Skill dependencies (graph edges)
CREATE TABLE IF NOT EXISTS skill_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_skill UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    target_skill UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    weight FLOAT NOT NULL DEFAULT 1.0,
    UNIQUE(source_skill, target_skill)
);

-- Problems
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    description TEXT NOT NULL,
    constraints TEXT,
    examples JSONB DEFAULT '[]',
    concepts TEXT[] DEFAULT '{}',
    acceptance_rate FLOAT DEFAULT 0.0,
    estimated_time TEXT DEFAULT '',
    companies JSONB DEFAULT '[]',
    starter_code JSONB DEFAULT '{}',
    hints JSONB DEFAULT '[]',
    editorial TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-user problem status (solved / attempted / unsolved)
CREATE TABLE IF NOT EXISTS user_problem_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('solved', 'attempted', 'unsolved')) DEFAULT 'unsolved',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, problem_id)
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    runtime FLOAT,
    memory FLOAT,
    stdout TEXT,
    stderr TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telemetry events
CREATE TABLE IF NOT EXISTS telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    time_taken FLOAT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 1,
    hints_used INT NOT NULL DEFAULT 0,
    confidence INT NOT NULL CHECK (confidence BETWEEN 1 AND 5),
    correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skill states (user mastery per skill)
CREATE TABLE IF NOT EXISTS skill_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    mastery FLOAT NOT NULL DEFAULT 0.0,
    struggle_score FLOAT NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

-- Mock interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interview_type TEXT NOT NULL,
    overall_score FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interview responses
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL DEFAULT '',
    evaluation JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contests
CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    problem_ids UUID[] NOT NULL DEFAULT '{}'
);

-- Contest submissions (links a submission to a contest)
CREATE TABLE IF NOT EXISTS contest_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_user ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_states_user ON skill_states(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_states_skill ON skill_states(skill_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_problem_status_user ON user_problem_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_status_problem ON user_problem_status(problem_id);
