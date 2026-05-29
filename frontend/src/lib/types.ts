// ============================================================
// CodeArena AI — Shared TypeScript Types
// ============================================================

// --- User ---
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  college: string;
  location: string;
  rating: number;
  globalRank: number;
  streak: number;
  problemsSolved: number;
  contestsParticipated: number;
  certificatesEarned: number;
  interviewReadiness: number;
  joinedAt: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

// --- Problems ---
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Solved' | 'Attempted' | 'Unsolved';

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  acceptanceRate: number;
  estimatedTime: string;
  topics: string[];
  companies: string[];
  status: ProblemStatus;
  isAIRecommended: boolean;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  hints: string[];
  editorial?: string;
  starterCode: Record<string, string>;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

// --- Submissions ---
export interface Submission {
  id: string;
  problemId: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  runtime: string;
  memory: string;
  passedCases: number;
  totalCases: number;
  submittedAt: string;
}

export interface TestResult {
  id: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime: string;
  memory: string;
}

// --- Skill Graph ---
export type SkillNodeStatus = 'mastered' | 'learning' | 'weak' | 'locked';

export interface SkillNode {
  id: string;
  label: string;
  status: SkillNodeStatus;
  mastery: number;
  problemsCount: number;
  problemsSolved: number;
  lastActivity: string;
  description: string;
  recommendedProblems: string[];
  aiInsight: string;
}

export interface SkillEdge {
  id: string;
  source: string;
  target: string;
}

// --- Contests ---
export type ContestType = 'Weekly' | 'Monthly' | 'Company Sponsored' | 'AI Challenge' | 'Hackathon Prep';
export type ContestStatus = 'Upcoming' | 'Live' | 'Ended';

export interface Contest {
  id: string;
  title: string;
  type: ContestType;
  status: ContestStatus;
  difficulty: Difficulty;
  startTime: string;
  duration: string;
  participants: number;
  prizePool: string;
  description: string;
  problems: string[];
  sponsor?: string;
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    country: string;
    college: string;
  };
  rating: number;
  problemsSolved: number;
  streak: number;
  achievements: number;
  interviewReadiness: number;
}

// --- Analytics ---
export interface AnalyticsData {
  ratingTrend: { date: string; rating: number }[];
  topicMastery: { topic: string; mastery: number; total: number; solved: number }[];
  accuracyTrend: { date: string; accuracy: number }[];
  contestPerformance: { contest: string; rank: number; rating: number }[];
  activityHeatmap: { date: string; count: number }[];
  difficultyDistribution: { difficulty: Difficulty; count: number }[];
  languageDistribution: { language: string; count: number }[];
  learningConsistency: { week: string; hours: number }[];
}

// --- Certifications ---
export interface Certification {
  id: string;
  title: string;
  category: string;
  description: string;
  issueDate: string;
  verificationId: string;
  icon: string;
  color: string;
  progress: number;
  isEarned: boolean;
  requirements: string[];
}

// --- Achievements ---
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

// --- Community ---
export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    rating: number;
  };
  title: string;
  content: string;
  tags: string[];
  type: 'Discussion' | 'Question' | 'Challenge' | 'Study Group' | 'Mentorship';
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

// --- Activity ---
export type ActivityType = 'problem_solved' | 'contest_participated' | 'interview_completed' | 'certificate_earned' | 'achievement_unlocked' | 'streak_milestone';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// --- Mock Interview ---
export type InterviewType = 'DSA' | 'Behavioral' | 'System Design' | 'CS Fundamentals' | 'Startup';

export interface InterviewSession {
  id: string;
  type: InterviewType;
  status: 'waiting' | 'in_progress' | 'completed';
  duration: string;
  startedAt?: string;
  completedAt?: string;
  questions: InterviewQuestion[];
  report?: InterviewReport;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: Difficulty;
  timeLimit: string;
  userAnswer?: string;
}

export interface InterviewReport {
  overallScore: number;
  communication: number;
  technicalAccuracy: number;
  problemSolving: number;
  confidence: number;
  codeQuality: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  readinessScore: number;
}

// --- AI Coach ---
export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'code' | 'insight' | 'recommendation' | 'plan';
}

export interface Weakness {
  topic: string;
  mastery: number;
  accuracy: number;
  recommendedProblems: { id: string; title: string; difficulty: Difficulty }[];
  aiSuggestion: string;
}

// --- Notifications ---
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'contest' | 'achievement';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
