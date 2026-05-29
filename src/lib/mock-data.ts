import { User, Problem, SkillNode, SkillEdge, Contest, LeaderboardEntry, AnalyticsData, Certification, Achievement, CommunityPost, Activity, Weakness, Notification } from './types';

// ==========================================
// 1. Current User
// ==========================================
export const mockCurrentUser: User = {
  id: 'usr_1',
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex.rivera@dev.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  bio: 'Full Stack Engineer & Competitive Programmer. Passionate about algorithms, high-performance systems, and developer tools.',
  college: 'Stanford University',
  location: 'San Francisco, CA',
  rating: 2185,
  globalRank: 342,
  streak: 42,
  problemsSolved: 412,
  contestsParticipated: 28,
  certificatesEarned: 4,
  interviewReadiness: 88,
  joinedAt: '2025-01-15T08:00:00Z',
  socials: {
    github: 'https://github.com/alexrivera',
    linkedin: 'https://linkedin.com/in/alexrivera',
    twitter: 'https://twitter.com/alex_codes'
  }
};

// ==========================================
// 2. Problems
// ==========================================
export const mockProblems: Problem[] = [
  {
    id: 'prob_1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    acceptanceRate: 49.2,
    estimatedTime: '15 mins',
    topics: ['Arrays', 'Hashing'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    status: 'Solved',
    isAIRecommended: false,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be O(N^2) time complexity. Can you think of something faster?',
      'Keep track of the elements you have already seen in a hash map. For each element x, check if target - x is already in the hash map.'
    ],
    editorial: `The optimal solution is to use a Hash Map. As we iterate through the array, we check if the complement (target - current_element) exists in our hash map. If it does, we return the index of the complement and the current index. If it does not, we store the current element along with its index in the hash map. This approach resolves the problem in O(N) time complexity and O(N) space complexity.`,
    starterCode: {
      python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass`,
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your code here\n    return [];\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}`,
      go: `func twoSum(nums []int, target int) []int {\n    // Write your code here\n    return nil\n}`
    }
  },
  {
    id: 'prob_2',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    acceptanceRate: 54.1,
    estimatedTime: '25 mins',
    topics: ['Arrays', 'Two Pointers'],
    companies: ['Amazon', 'Google', 'Meta'],
    status: 'Attempted',
    isAIRecommended: true,
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.'
      }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    hints: [
      'Start with the maximum width possible (i.e. first and last vertical lines) and compute the area.',
      'Since you want to maximize area, you need to find boundaries that maximize width * min(height_left, height_right). If you move the pointer at the taller bar inward, the width decreases, and the height constraint remains limited by the shorter bar. Thus, to potentially get a larger area, you must move the pointer at the shorter bar inward.'
    ],
    starterCode: {
      python: `class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # Write your code here\n        pass`,
      javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n    // Write your code here\n    return 0;\n}`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}`
    }
  },
  {
    id: 'prob_3',
    title: 'Edit Distance',
    slug: 'edit-distance',
    difficulty: 'Hard',
    acceptanceRate: 52.4,
    estimatedTime: '40 mins',
    topics: ['Dynamic Programming', 'Strings'],
    companies: ['Google', 'Microsoft', 'Uber'],
    status: 'Unsolved',
    isAIRecommended: true,
    description: `Given two strings \`word1\` and \`word2\`, return *the minimum number of operations required to convert \`word1\` to \`word2\`*.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character`,
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: '3',
        explanation: 'horse -> rorse (replace \'h\' with \'r\')\nrorse -> rose (remove \'r\')\nrose -> ros (remove \'e\')'
      }
    ],
    constraints: [
      '0 <= word1.length, word2.length <= 500',
      'word1 and word2 consist of lowercase English letters.'
    ],
    hints: [
      'Define state DP[i][j] as the minimum edit distance to convert word1[0...i-1] to word2[0...j-1].',
      'If the last characters match (word1[i-1] == word2[j-1]), then DP[i][j] = DP[i-1][j-1]. Otherwise, look at three operations: insert, delete, replace, and take the minimum of these three + 1.'
    ],
    starterCode: {
      python: `class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # Write your code here\n        pass`,
      javascript: `/**\n * @param {string} word1\n * @param {string} word2\n * @return {number}\n */\nfunction minDistance(word1, word2) {\n    // Write your code here\n    return 0;\n}`,
      cpp: `class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        // Write your code here\n        return 0;\n    }\n};`
    }
  },
  {
    id: 'prob_4',
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    difficulty: 'Medium',
    acceptanceRate: 32.8,
    estimatedTime: '25 mins',
    topics: ['Strings', 'Dynamic Programming'],
    companies: ['Meta', 'Amazon', 'Google'],
    status: 'Solved',
    isAIRecommended: false,
    description: `Given a string \`s\`, return *the longest palindromic substring* in \`s\`.`,
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.'
      }
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consists of only digits and English letters.'
    ],
    hints: [
      'A common approach is to expand around centers. A palindrome of length N has 2N-1 centers. Can you identify them?',
      'Dynamic Programming is also possible: DP[i][j] indicates whether s[i...j] is a palindrome.'
    ],
    starterCode: {
      python: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        pass`
    }
  },
  {
    id: 'prob_5',
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    acceptanceRate: 48.9,
    estimatedTime: '35 mins',
    topics: ['Linked Lists', 'Divide and Conquer', 'Heap (Priority Queue)'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'TikTok'],
    status: 'Unsolved',
    isAIRecommended: true,
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*`,
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
        explanation: 'The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6'
      }
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10^5.'
    ],
    hints: [
      'Use a priority queue to keep track of the head element of all linked lists at any time. When you pull out the smallest node, insert its next node into the priority queue.',
      'Alternatively, merge list by list or divide and conquer. Merge pairs of lists recursively.'
    ],
    starterCode: {
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        pass`
    }
  }
];

// ==========================================
// 3. Skill Graph Nodes and Edges
// ==========================================
export const mockSkillNodes: SkillNode[] = [
  {
    id: 'node_arrays',
    label: 'Arrays & Hashing',
    status: 'mastered',
    mastery: 92,
    problemsCount: 45,
    problemsSolved: 42,
    lastActivity: '2026-05-28T14:30:00Z',
    description: 'Dynamic arrays, hash tables, hash functions, frequency counting, and standard array patterns.',
    recommendedProblems: ['prob_1'],
    aiInsight: 'Your mastery of Arrays and Hashing is excellent. Your submissions average 94% accuracy with optimized runtime.'
  },
  {
    id: 'node_pointers',
    label: 'Two Pointers',
    status: 'mastered',
    mastery: 85,
    problemsCount: 30,
    problemsSolved: 26,
    lastActivity: '2026-05-25T11:20:00Z',
    description: 'Linear search using index pairs, opposite endpoints, sliding buffers, fast & slow pointer setups.',
    recommendedProblems: ['prob_2'],
    aiInsight: 'Strong capability in two-pointer problems. Focus on complex constraints (e.g. negative numbers) to reach 100% mastery.'
  },
  {
    id: 'node_sliding',
    label: 'Sliding Window',
    status: 'learning',
    mastery: 65,
    problemsCount: 25,
    problemsSolved: 14,
    lastActivity: '2026-05-29T08:15:00Z',
    description: 'Subarrays of fixed or dynamic size, tracking state with hash maps or double queues.',
    recommendedProblems: ['prob_2'],
    aiInsight: 'You occasionally struggle with boundary conditions when the window contract shrinks. Focus on maintaining invariants.'
  },
  {
    id: 'node_trees',
    label: 'Binary Trees',
    status: 'learning',
    mastery: 50,
    problemsCount: 35,
    problemsSolved: 17,
    lastActivity: '2026-05-24T16:45:00Z',
    description: 'Tree traversals (DFS, BFS), BST operations, recursion depth, and tree transformations.',
    recommendedProblems: ['prob_5'],
    aiInsight: 'Your recursion logic is clean, but you tend to overcomplicate leaf-node termination. Practice standard traversal patterns.'
  },
  {
    id: 'node_graphs',
    label: 'Graphs',
    status: 'weak',
    mastery: 35,
    problemsCount: 40,
    problemsSolved: 10,
    lastActivity: '2026-05-27T18:00:00Z',
    description: 'Adjacency matrices/lists, BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, topological sorting, union-find.',
    recommendedProblems: ['prob_5'],
    aiInsight: 'Weakness detected: Graph traversals and cyclic path identification have a high failure rate. Focus on BFS and DFS basics first.'
  },
  {
    id: 'node_dp',
    label: 'Dynamic Programming',
    status: 'weak',
    mastery: 28,
    problemsCount: 50,
    problemsSolved: 8,
    lastActivity: '2026-05-26T20:10:00Z',
    description: 'Memoization vs tabulation, knapsack, subsequence matching, grid pathfinding, and interval DP.',
    recommendedProblems: ['prob_3', 'prob_4'],
    aiInsight: 'You have a solid grasp of memoization, but tabulation space-optimization causes errors. Start with simple 1D DP relations.'
  },
  {
    id: 'node_greedy',
    label: 'Greedy Algorithms',
    status: 'locked',
    mastery: 0,
    problemsCount: 25,
    problemsSolved: 0,
    lastActivity: 'N/A',
    description: 'Local optimization leading to global optima. Intervals, scheduling, Huffman coding.',
    recommendedProblems: [],
    aiInsight: 'Complete the Sliding Window and DP baseline pathways to unlock Greedy Algorithms.'
  }
];

export const mockSkillEdges: SkillEdge[] = [
  { id: 'e_arr_ptr', source: 'node_arrays', target: 'node_pointers' },
  { id: 'e_ptr_sld', source: 'node_pointers', target: 'node_sliding' },
  { id: 'e_sld_tre', source: 'node_sliding', target: 'node_trees' },
  { id: 'e_tre_grp', source: 'node_trees', target: 'node_graphs' },
  { id: 'e_sld_dp', source: 'node_sliding', target: 'node_dp' },
  { id: 'e_dp_grd', source: 'node_dp', target: 'node_greedy' },
  { id: 'e_grp_grd', source: 'node_graphs', target: 'node_greedy' }
];

// ==========================================
// 4. Contests
// ==========================================
export const mockContests: Contest[] = [
  {
    id: 'cnt_1',
    title: 'Weekly Arena #72',
    type: 'Weekly',
    status: 'Live',
    difficulty: 'Medium',
    startTime: '2026-05-29T10:00:00Z',
    duration: '1 hr 30 mins',
    participants: 1845,
    prizePool: '500 Arena Credits + Exclusive Badges',
    description: 'Compete with developers worldwide on 4 algorithmic challenges of increasing difficulty.',
    problems: ['prob_1', 'prob_2', 'prob_4', 'prob_3']
  },
  {
    id: 'cnt_2',
    title: 'Meta Sponsored Hack-Match',
    type: 'Company Sponsored',
    status: 'Upcoming',
    difficulty: 'Hard',
    startTime: '2026-06-02T15:00:00Z',
    duration: '3 hrs',
    participants: 4520,
    prizePool: 'Fast-track Interviews + $5,000 USD',
    description: 'Meta sponsored algorithms contest focusing on advanced data structures, graph theory, and optimizations.',
    problems: ['prob_5', 'prob_3'],
    sponsor: 'Meta'
  },
  {
    id: 'cnt_3',
    title: 'Monthly Masters Challenge',
    type: 'Monthly',
    status: 'Upcoming',
    difficulty: 'Hard',
    startTime: '2026-06-07T18:00:00Z',
    duration: '2 hrs 30 mins',
    participants: 840,
    prizePool: '$1,000 Cash + Master Badge',
    description: 'Reserved for users with rating 1800+. Extreme algorithmic tasks designed to test the boundaries of DP and Graphs.',
    problems: ['prob_3', 'prob_5']
  },
  {
    id: 'cnt_4',
    title: 'Weekly Arena #71',
    type: 'Weekly',
    status: 'Ended',
    difficulty: 'Medium',
    startTime: '2026-05-22T10:00:00Z',
    duration: '1 hr 30 mins',
    participants: 1952,
    prizePool: '300 Arena Credits',
    description: 'Weekly standard algorithms challenge.',
    problems: ['prob_1', 'prob_4']
  }
];

// ==========================================
// 5. Leaderboards
// ==========================================
export const mockLeaderboards: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'l_1',
      name: 'Gennady Korotkevich',
      username: 'tourist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80',
      country: 'Belarus',
      college: 'ITMO University'
    },
    rating: 3842,
    problemsSolved: 1240,
    streak: 154,
    achievements: 48,
    interviewReadiness: 99
  },
  {
    rank: 2,
    user: {
      id: 'l_2',
      name: 'William Lin',
      username: 'tmwilliamlin168',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80',
      country: 'Taiwan',
      college: 'MIT'
    },
    rating: 3450,
    problemsSolved: 980,
    streak: 88,
    achievements: 42,
    interviewReadiness: 98
  },
  {
    rank: 342,
    user: {
      id: 'usr_1',
      name: 'Alex Rivera',
      username: 'alexrivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      country: 'United States',
      college: 'Stanford University'
    },
    rating: 2185,
    problemsSolved: 412,
    streak: 42,
    achievements: 22,
    interviewReadiness: 88
  }
];

// ==========================================
// 6. Analytics Data
// ==========================================
export const mockAnalyticsData: AnalyticsData = {
  ratingTrend: [
    { date: 'Jan 26', rating: 1600 },
    { date: 'Feb 26', rating: 1720 },
    { date: 'Mar 26', rating: 1850 },
    { date: 'Apr 26', rating: 1980 },
    { date: 'May 26', rating: 2185 }
  ],
  topicMastery: [
    { topic: 'Arrays', mastery: 92, total: 45, solved: 42 },
    { topic: 'Two Pointers', mastery: 85, total: 30, solved: 26 },
    { topic: 'Sliding Window', mastery: 65, total: 25, solved: 14 },
    { topic: 'Binary Trees', mastery: 50, total: 35, solved: 17 },
    { topic: 'Graphs', mastery: 35, total: 40, solved: 10 },
    { topic: 'DP', mastery: 28, total: 50, solved: 8 }
  ],
  accuracyTrend: [
    { date: 'May 24', accuracy: 72 },
    { date: 'May 25', accuracy: 75 },
    { date: 'May 26', accuracy: 79 },
    { date: 'May 27', accuracy: 82 },
    { date: 'May 28', accuracy: 84 },
    { date: 'May 29', accuracy: 88 }
  ],
  contestPerformance: [
    { contest: 'Weekly #68', rank: 140, rating: 2050 },
    { contest: 'Weekly #69', rank: 82, rating: 2110 },
    { contest: 'Weekly #70', rank: 98, rating: 2130 },
    { contest: 'Weekly #71', rank: 54, rating: 2185 }
  ],
  activityHeatmap: [
    { date: '2026-05-01', count: 2 },
    { date: '2026-05-02', count: 4 },
    { date: '2026-05-03', count: 6 },
    { date: '2026-05-05', count: 1 },
    { date: '2026-05-06', count: 3 },
    { date: '2026-05-07', count: 5 },
    { date: '2026-05-08', count: 2 },
    { date: '2026-05-10', count: 8 },
    { date: '2026-05-12', count: 4 },
    { date: '2026-05-15', count: 3 },
    { date: '2026-05-18', count: 6 },
    { date: '2026-05-20', count: 2 },
    { date: '2026-05-22', count: 9 },
    { date: '2026-05-24', count: 5 },
    { date: '2026-05-25', count: 4 },
    { date: '2026-05-26', count: 3 },
    { date: '2026-05-27', count: 7 },
    { date: '2026-05-28', count: 6 },
    { date: '2026-05-29', count: 8 }
  ],
  difficultyDistribution: [
    { difficulty: 'Easy', count: 180 },
    { difficulty: 'Medium', count: 195 },
    { difficulty: 'Hard', count: 37 }
  ],
  languageDistribution: [
    { language: 'Python', count: 210 },
    { language: 'C++', count: 124 },
    { language: 'JavaScript', count: 78 }
  ],
  learningConsistency: [
    { week: 'Week 18', hours: 12 },
    { week: 'Week 19', hours: 15 },
    { week: 'Week 20', hours: 10 },
    { week: 'Week 21', hours: 18 },
    { week: 'Week 22', hours: 22 }
  ]
};

// ==========================================
// 7. Certifications
// ==========================================
export const mockCertifications: Certification[] = [
  {
    id: 'cert_1',
    title: 'DSA Foundation',
    category: 'Algorithms',
    description: 'Validates thorough understanding of arrays, linked lists, hash maps, queues, stacks, recursion, and search basics.',
    issueDate: '2025-03-12',
    verificationId: 'CA-DSA-984321',
    icon: 'Terminal',
    color: 'emerald',
    progress: 100,
    isEarned: true,
    requirements: ['Master Arrays & Hashing', 'Master Two Pointers', 'Solve 100 Easy Problems']
  },
  {
    id: 'cert_2',
    title: 'Problem Solving Expert',
    category: 'Problem Solving',
    description: 'Demonstrates ability to solve medium and hard algorithmic challenges involving dynamic structures and complex indexing.',
    issueDate: '2025-11-20',
    verificationId: 'CA-PSE-773412',
    icon: 'Cpu',
    color: 'violet',
    progress: 100,
    isEarned: true,
    requirements: ['Master Sliding Window', 'Master Binary Trees', 'Solve 150 Medium Problems']
  },
  {
    id: 'cert_3',
    title: 'Graph Specialist',
    category: 'Advanced Data Structures',
    description: 'Covers graph representation, searching (BFS, DFS), shortest path computation, minimum spanning trees, and network flows.',
    issueDate: '',
    verificationId: '',
    icon: 'Network',
    color: 'cyan',
    progress: 45,
    isEarned: false,
    requirements: ['Master Graph Basics', 'Learn Topological Sort', 'Learn Shortest Path algorithms', 'Solve 30 Graph problems']
  },
  {
    id: 'cert_4',
    title: 'Interview Ready Specialist',
    category: 'Career readiness',
    description: 'Validates excellent software engineering problem-solving speed, technical communication, and system design capability.',
    issueDate: '',
    verificationId: '',
    icon: 'Briefcase',
    color: 'amber',
    progress: 68,
    isEarned: false,
    requirements: ['Achieve rating 2000+', 'Complete 5 Mock Interviews', 'Complete System Design syllabus', 'Solve 30 Dynamic Programming problems']
  }
];

// ==========================================
// 8. Achievements / Badges
// ==========================================
export const mockAchievements: Achievement[] = [
  {
    id: 'ach_1',
    title: 'Algorithm Apprentice',
    description: 'Solve 50 coding problems in total.',
    icon: 'Code',
    category: 'Progress',
    isUnlocked: true,
    unlockedAt: '2025-02-15T18:00:00Z',
    progress: 50,
    maxProgress: 50
  },
  {
    id: 'ach_2',
    title: 'Code Warrior',
    description: 'Solve 100 coding problems in total.',
    icon: 'Shield',
    category: 'Progress',
    isUnlocked: true,
    unlockedAt: '2025-05-10T14:30:00Z',
    progress: 100,
    maxProgress: 100
  },
  {
    id: 'ach_3',
    title: 'Consistent Coder',
    description: 'Maintain a 30-day streak of daily practice.',
    icon: 'Flame',
    category: 'Streak',
    isUnlocked: true,
    unlockedAt: '2026-05-17T09:00:00Z',
    progress: 30,
    maxProgress: 30
  },
  {
    id: 'ach_4',
    title: 'Top Tier Developer',
    description: 'Reach a contest rating of 2200.',
    icon: 'Trophy',
    category: 'Rating',
    isUnlocked: false,
    progress: 2185,
    maxProgress: 2200
  },
  {
    id: 'ach_5',
    title: 'AI Graduate',
    description: 'Finish a full personalized roadmap guided by the AI Coach.',
    icon: 'Sparkles',
    category: 'AI',
    isUnlocked: false,
    progress: 82,
    maxProgress: 100
  }
];

// ==========================================
// 9. Community Posts
// ==========================================
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post_1',
    author: {
      id: 'p_a1',
      name: 'Sarah Chen',
      username: 'schen_dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80',
      rating: 2310
    },
    title: 'How I optimized my DP space complexity from O(N*M) to O(Min(N,M))',
    content: `When working on typical grid-based dynamic programming problems (like Edit Distance or Unique Paths), it is very common to define a 2D array state. However, we only ever need the previous row's state to compute the current row's state! By using two 1D arrays (or just one and a couple of helper variables), we can reduce space down to O(Min(M, N)). Let me show you how...`,
    tags: ['Dynamic Programming', 'Optimization', 'Python'],
    type: 'Discussion',
    likes: 124,
    comments: 18,
    createdAt: '2026-05-28T09:12:00Z',
    isLiked: false
  },
  {
    id: 'post_2',
    author: {
      id: 'p_a2',
      name: 'Marcus Thorne',
      username: 'marcus_t',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&h=128&q=80',
      rating: 1980
    },
    title: 'Google L4 Interview Loop - My Experience & Tips',
    content: `Just wrapped up my Google interview loops for an L4 Backend Role. I had 3 coding rounds, 1 system design, and 1 behavioral (Googlyness). The coding rounds heavily featured tree traversal (modified BST lookup) and a sliding window problem. If there is one piece of advice: talk out loud during code generation! The interviewer cares about your thought process...`,
    tags: ['Interview Prep', 'Google', 'System Design'],
    type: 'Mentorship',
    likes: 342,
    comments: 47,
    createdAt: '2026-05-27T14:45:00Z',
    isLiked: true
  }
];

// ==========================================
// 10. Recent Activity
// ==========================================
export const mockActivities: Activity[] = [
  {
    id: 'act_1',
    type: 'problem_solved',
    title: 'Two Sum Solved',
    description: 'Completed Two Sum in Python with 98% runtime efficiency.',
    timestamp: '2026-05-28T14:30:00Z',
    metadata: { problemId: 'prob_1', problemTitle: 'Two Sum' }
  },
  {
    id: 'act_2',
    type: 'contest_participated',
    title: 'Weekly Arena #71',
    description: 'Ranked 54 out of 1952 participants. Earned +55 rating points.',
    timestamp: '2026-05-22T12:00:00Z',
    metadata: { contestId: 'cnt_4', ratingChange: '+55' }
  },
  {
    id: 'act_3',
    type: 'interview_completed',
    title: 'Google DSA Mock Interview',
    description: 'Completed mock session. Earned readiness score of 88%.',
    timestamp: '2026-05-18T16:00:00Z'
  },
  {
    id: 'act_4',
    type: 'certificate_earned',
    title: 'Earned Problem Solving Expert Certification',
    description: 'Successfully verified algorithmic problem solving capacity.',
    timestamp: '2025-11-20T14:30:00Z',
    metadata: { certId: 'cert_2' }
  }
];

// ==========================================
// 11. Weakness Detection & Suggestions
// ==========================================
export const mockWeaknesses: Weakness[] = [
  {
    topic: 'Graph Traversal (DFS/BFS)',
    mastery: 35,
    accuracy: 42,
    recommendedProblems: [
      { id: 'prob_5', title: 'Merge k Sorted Lists', difficulty: 'Hard' }
    ],
    aiSuggestion: 'You frequently trigger memory bounds and recursion depth errors. Practice converting your graph DFS traversal solutions into iterative implementations using an explicit stack.'
  },
  {
    topic: 'Dynamic Programming Tabulation',
    mastery: 28,
    accuracy: 38,
    recommendedProblems: [
      { id: 'prob_3', title: 'Edit Distance', difficulty: 'Hard' },
      { id: 'prob_4', title: 'Longest Palindromic Substring', difficulty: 'Medium' }
    ],
    aiSuggestion: 'Struggling to set up subproblem boundary conditions. Focus on writing out the recursive induction steps on paper, then translate them to an iterative 2D array bottom-up.'
  }
];

// ==========================================
// 12. Notifications
// ==========================================
export const mockNotifications: Notification[] = [
  {
    id: 'not_1',
    title: 'Contest Starting Soon',
    message: 'Weekly Arena #72 is starting in 30 minutes. Are you ready to compete?',
    type: 'contest',
    isRead: false,
    createdAt: '2026-05-29T09:30:00Z',
    actionUrl: '/contests'
  },
  {
    id: 'not_2',
    title: 'New Weakness Detected',
    message: 'AI Coach detected dynamic programming state setup errors. We updated your learning path.',
    type: 'warning',
    isRead: false,
    createdAt: '2026-05-28T18:15:00Z',
    actionUrl: '/coach'
  },
  {
    id: 'not_3',
    title: 'Milestone Unlocked!',
    message: 'Congratulations! You unlocked the "Consistent Coder" badge for your 30-day streak.',
    type: 'achievement',
    isRead: true,
    createdAt: '2026-05-17T09:00:00Z',
    actionUrl: '/profile'
  }
];
