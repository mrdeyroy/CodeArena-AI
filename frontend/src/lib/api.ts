import { Problem, ProblemStatus, Difficulty, SkillNode, SkillEdge } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token'
  };
}

function mapBackendDifficulty(diff: string): Difficulty {
  const lowercase = diff.toLowerCase();
  if (lowercase === 'easy') return 'Easy';
  if (lowercase === 'hard') return 'Hard';
  return 'Medium';
}

function mapBackendProblem(p: any): Problem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: mapBackendDifficulty(p.difficulty),
    acceptanceRate: p.acceptance_rate || 0.0,
    estimatedTime: p.estimated_time || '',
    topics: p.concepts || [],
    companies: p.companies || [],
    status: (p.status as ProblemStatus) || 'Unsolved',
    isAIRecommended: p.is_ai_recommended || false,
    description: p.description || '',
    examples: p.examples || [],
    constraints: p.constraints ? p.constraints.split('\n') : [],
    hints: p.hints || [],
    editorial: p.editorial || '',
    starterCode: p.starter_code || {},
  };
}

export async function fetchProblems(filters?: { difficulty?: string; topic?: string; status?: string; search?: string }): Promise<Problem[]> {
  const params = new URLSearchParams();
  if (filters?.difficulty && filters.difficulty !== 'All') {
    params.append('difficulty', filters.difficulty.toLowerCase());
  }
  if (filters?.topic && filters.topic !== 'All') {
    params.append('topic', filters.topic);
  }
  if (filters?.status && filters.status !== 'All') {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const res = await fetch(`${BASE_URL}/problems?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch problems');
  const data = await res.json();
  return data.map(mapBackendProblem);
}

export async function fetchProblemBySlug(slug: string): Promise<Problem> {
  const res = await fetch(`${BASE_URL}/problems/${slug}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch problem: ${slug}`);
  const data = await res.json();
  return mapBackendProblem(data);
}

export async function runProblem(problemId: string, language: string, code: string, stdin?: string) {
  const res = await fetch(`${BASE_URL}/problems/${problemId}/run`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      language,
      code,
      stdin: stdin || '',
    }),
  });
  if (!res.ok) throw new Error('Failed to execute code');
  return res.json();
}

export async function submitProblem(problemId: string, language: string, code: string) {
  const res = await fetch(`${BASE_URL}/problems/${problemId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      language,
      code,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit code');
  return res.json();
}

export async function fetchGraph(): Promise<{ nodes: SkillNode[]; edges: SkillEdge[] }> {
  const res = await fetch(`${BASE_URL}/graph`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch skill graph');
  const data = await res.json();

  // Load analytics to fill mastery/status dynamically
  let skillsAnalytics: any[] = [];
  try {
    const analyticsRes = await fetch(`${BASE_URL}/analytics/skills?user_id=${DEFAULT_USER_ID}`, {
      headers: getHeaders(),
    });
    if (analyticsRes.ok) {
      const analyticsData = await analyticsRes.json();
      skillsAnalytics = analyticsData.skills || [];
    }
  } catch (e) {
    console.error('Failed to load skill analytics:', e);
  }

  const nodes = (data.nodes || []).map((node: any) => {
    const analytics = skillsAnalytics.find((sa) => sa.skill_name === node.name) || {};
    const masteryVal = analytics.mastery !== undefined ? Math.round(analytics.mastery * 100) : 0;
    
    let statusVal: 'mastered' | 'learning' | 'weak' | 'locked' = 'locked';
    if (masteryVal >= 80) statusVal = 'mastered';
    else if (masteryVal >= 50) statusVal = 'learning';
    else if (masteryVal > 0) statusVal = 'weak';

    return {
      id: node.id,
      label: node.name,
      status: statusVal,
      mastery: masteryVal,
      problemsCount: 20, // default placeholder
      problemsSolved: masteryVal >= 80 ? 15 : (masteryVal >= 50 ? 8 : (masteryVal > 0 ? 3 : 0)),
      lastActivity: new Date().toISOString(),
      description: node.description || '',
      recommendedProblems: [],
      aiInsight: '',
    };
  });

  const edges = (data.edges || []).map((edge: any) => ({
    id: edge.id || `edge_${edge.source_skill}_${edge.target_skill}`,
    source: edge.source_skill,
    target: edge.target_skill,
  }));

  return { nodes, edges };
}

export async function fetchNodeInsights(nodeId: string) {
  const res = await fetch(`${BASE_URL}/graph/nodes/${nodeId}/insights?user_id=${DEFAULT_USER_ID}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch node insights');
  return res.json();
}

export async function sendCoachChat(message: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/coach/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      message,
    }),
  });
  if (!res.ok) throw new Error('Failed to communicate with coach');
  const data = await res.json();
  return data.reply;
}

export async function startInterview(type: string) {
  const res = await fetch(`${BASE_URL}/interview/sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      interview_type: type.toLowerCase().replace(/ /g, '_'),
      duration_limit: 30
    }),
  });
  if (!res.ok) throw new Error('Failed to start interview');
  return res.json();
}

export async function submitInterviewResponse(sessionId: string, answer: string) {
  const res = await fetch(`${BASE_URL}/interview/sessions/${sessionId}/response`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      candidate_answer: answer,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit response');
  return res.json();
}

export async function finalizeInterview(sessionId: string) {
  const res = await fetch(`${BASE_URL}/interview/sessions/${sessionId}/finalize`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to finalize interview');
  return res.json();
}

export async function fetchAnalyticsOverview() {
  const res = await fetch(`${BASE_URL}/analytics/overview?user_id=${DEFAULT_USER_ID}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export async function fetchAnalyticsProgress() {
  const res = await fetch(`${BASE_URL}/analytics/progress?user_id=${DEFAULT_USER_ID}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

// ── Submission Status ──────────────────────────────────────────

export async function fetchSubmissionStatus(problemId: string): Promise<{ problem_id: string; status: string }> {
  const res = await fetch(`${BASE_URL}/submissions/status?problem_id=${problemId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch submission status');
  return res.json();
}

export async function fetchAllSubmissionStatuses(): Promise<Record<string, string>> {
  const res = await fetch(`${BASE_URL}/submissions/status`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch submission statuses');
  const data = await res.json();
  const statusMap: Record<string, string> = {};
  for (const s of data.statuses || []) {
    statusMap[s.problem_id] = s.status;
  }
  return statusMap;
}

export async function updateSubmissionStatus(problemId: string, status: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/submissions/status?problem_id=${problemId}&status=${status}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to update submission status');
}
