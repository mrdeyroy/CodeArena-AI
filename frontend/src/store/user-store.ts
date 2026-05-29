import { create } from 'zustand';
import { User, Problem, Submission, ProblemStatus } from '@/lib/types';
import { mockCurrentUser } from '@/lib/mock-data';
import { fetchProblems, fetchAnalyticsOverview, updateSubmissionStatus } from '@/lib/api';

interface UserState {
  user: User;
  problems: Problem[];
  submissions: Submission[];
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  fetchProblemsList: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addSubmission: (submission: Submission) => void;
  submitCode: (
    problemId: string,
    language: string,
    code: string,
    status: Submission['status'],
    runtime: string,
    memory: string,
    passedCases: number,
    totalCases: number
  ) => void;
  updateProblemStatus: (problemId: string, status: ProblemStatus) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: mockCurrentUser,
  problems: [],
  submissions: [],
  isLoggedIn: true, // Default to true for premium UX directly

  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  
  updateUser: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),

  fetchProblemsList: async () => {
    try {
      const data = await fetchProblems();
      set({ problems: data });
    } catch (e) {
      console.error('Failed to fetch problems from backend:', e);
    }
  },

  fetchAnalytics: async () => {
    try {
      const overview = await fetchAnalyticsOverview();
      const solved = overview.total_problems_solved || 0;
      
      // Calculate dynamic progression values
      const ratingVal = 1200 + solved * 15;
      const rankVal = Math.max(1, 15280 - solved * 120);
      const certsVal = Math.floor(solved / 3);
      const activeDays = overview.active_days || 0;

      set((state) => ({
        user: {
          ...state.user,
          problemsSolved: solved,
          interviewReadiness: Math.round(overview.overall_readiness),
          streak: activeDays,
          rating: ratingVal,
          globalRank: rankVal,
          certificatesEarned: certsVal,
        }
      }));
    } catch (e) {
      console.error('Failed to fetch user analytics:', e);
    }
  },

  addSubmission: (submission) => {
    // Persist status to backend
    const mappedStatus = submission.status === 'Accepted' ? 'solved' : 'attempted';
    updateSubmissionStatus(submission.problemId, mappedStatus).catch(e =>
      console.error('Failed to persist submission status:', e)
    );

    set((state) => {
      // Update problem status
      const updatedProblems = state.problems.map((p) => {
        if (p.id === submission.problemId) {
          const currentStatus = p.status;
          let nextStatus: ProblemStatus = 'Attempted';
          if (submission.status === 'Accepted') {
            nextStatus = 'Solved';
          } else if (currentStatus === 'Solved') {
            nextStatus = 'Solved';
          }
          return { ...p, status: nextStatus };
        }
        return p;
      });

      // Recalculate user metrics if solved a new problem
      const originallySolved = state.problems.find(p => p.id === submission.problemId)?.status === 'Solved';
      const newlySolved = submission.status === 'Accepted' && !originallySolved;

      const userUpdates: Partial<User> = {};
      if (newlySolved) {
        userUpdates.problemsSolved = state.user.problemsSolved + 1;
        userUpdates.interviewReadiness = Math.min(100, state.user.interviewReadiness + 1);
      }

      return {
        submissions: [submission, ...state.submissions],
        problems: updatedProblems,
        user: { ...state.user, ...userUpdates },
      };
    });
  },

  submitCode: (problemId, language, code, status, runtime, memory, passedCases, totalCases) =>
    set((state) => {
      const newSubmission: Submission = {
        id: `sub_${Date.now()}`,
        problemId,
        language,
        code,
        status,
        runtime,
        memory,
        passedCases,
        totalCases,
        submittedAt: new Date().toISOString(),
      };

      // Persist status to backend
      const mappedStatus = status === 'Accepted' ? 'solved' : 'attempted';
      updateSubmissionStatus(problemId, mappedStatus).catch(e =>
        console.error('Failed to persist submission status:', e)
      );

      // update problem status
      const updatedProblems = state.problems.map((p) => {
        if (p.id === problemId) {
          const currentStatus = p.status;
          let nextStatus: ProblemStatus = 'Attempted';
          if (status === 'Accepted') {
            nextStatus = 'Solved';
          } else if (currentStatus === 'Solved') {
            nextStatus = 'Solved';
          }
          return { ...p, status: nextStatus };
        }
        return p;
      });

      // Recalculate user metrics if solved a new problem
      const originallySolved = state.problems.find(p => p.id === problemId)?.status === 'Solved';
      const newlySolved = status === 'Accepted' && !originallySolved;

      const userUpdates: Partial<User> = {};
      if (newlySolved) {
        userUpdates.problemsSolved = state.user.problemsSolved + 1;
        // bump readiness score slightly
        userUpdates.interviewReadiness = Math.min(100, state.user.interviewReadiness + 1);
      }

      return {
        submissions: [newSubmission, ...state.submissions],
        problems: updatedProblems,
        user: { ...state.user, ...userUpdates }
      };
    }),

  updateProblemStatus: (problemId, status) =>
    set((state) => ({
      problems: state.problems.map((p) =>
        p.id === problemId ? { ...p, status } : p
      ),
    })),
}));
