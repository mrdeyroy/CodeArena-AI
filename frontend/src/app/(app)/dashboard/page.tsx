'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  Target, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  PlayCircle,
  HelpCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress, ProgressRing } from '@/components/ui/progress';
import { useUserStore } from '@/store/user-store';
import { 
  mockAnalyticsData, 
  mockWeaknesses, 
  mockActivities 
} from '@/lib/mock-data';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function DashboardPage() {
  const { user, problems } = useUserStore();

  // Find dynamic recommendation based on weaknesses
  const topWeakness = mockWeaknesses[0];

  // Topics for the mini-roadmap
  const roadmapSteps = [
    { name: 'Arrays & Hashing', status: 'mastered', score: 92 },
    { name: 'Two Pointers', status: 'mastered', score: 85 },
    { name: 'Sliding Window', status: 'learning', score: 65 },
    { name: 'Binary Trees', status: 'learning', score: 50 },
    { name: 'Graphs', status: 'weak', score: 35 },
    { name: 'Dynamic Programming', status: 'weak', score: 28 },
    { name: 'Greedy Algorithms', status: 'locked', score: 0 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl" />
        <div className="space-y-3 z-10">
          <Badge variant="primary" className="font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" /> AI Insights Active
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Good evening, {user.name.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold max-w-xl">
            &quot;You are making excellent progress on Arrays, but your Graph traversals (DFS/BFS) require reinforcement. Focus on Graph traversal modules today.&quot;
          </p>
          <div className="pt-2">
            <Link href="/practice">
              <Button size="sm" icon={PlayCircle}>Continue Learning</Button>
            </Link>
          </div>
        </div>

        {/* Readiness Circular Ring */}
        <div className="flex items-center gap-4 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 shrink-0 z-10">
          <ProgressRing value={user.interviewReadiness} color="primary" size={68} strokeWidth={6} />
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interview Readiness</p>
            <p className="text-base font-extrabold text-slate-200">Tier-1 Ready</p>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +2% this week
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Problems Solved', value: user.problemsSolved, sub: '412 / 600 total', icon: Target, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Contest Rating', value: user.rating, sub: 'Global Top 1.2%', icon: Trophy, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Current Streak', value: `${user.streak} Days`, sub: 'Active daily coder', icon: Flame, color: 'text-rose-400 bg-rose-500/10' },
          { label: 'Certifications', value: user.certificatesEarned, sub: '2 active credentials', icon: Award, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Global Rank', value: `#${user.globalRank}`, sub: 'Top 350 globally', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10' },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-4 flex flex-col justify-between border-slate-800/60 bg-slate-900/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-extrabold text-slate-100">{kpi.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{kpi.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. DYNAMIC ROADMAP & WEAKNESSES GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: Learning Path */}
        <Card className="lg:col-span-2 border-slate-800/80 bg-slate-900/40 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Interactive Learning Roadmap</h2>
              <p className="text-[10px] text-slate-500">Your custom track generated by AI Coach</p>
            </div>
            <Link href="/graph">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer">
                View Graph <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="py-6 overflow-x-auto">
            <div className="flex items-center gap-3 min-w-[650px] px-2">
              {roadmapSteps.map((step, idx) => (
                <React.Fragment key={step.name}>
                  {idx > 0 && (
                    <div className={`h-0.5 w-8 shrink-0 ${
                      step.status === 'locked' ? 'bg-slate-800' : 'bg-indigo-500/40'
                    }`} />
                  )}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all relative
                      ${step.status === 'mastered' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : step.status === 'learning'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : step.status === 'weak'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {step.status === 'mastered' ? '✓' : step.score > 0 ? `${step.score}%` : '🔒'}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 text-center max-w-[85px] leading-tight ${
                      step.status === 'locked' ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current Focus</p>
              <p className="text-xs font-semibold text-slate-200">Solve Sliding Window complexity matrices to unlock Graphs module.</p>
            </div>
          </div>
        </Card>

        {/* Right Column: Weakness Detection */}
        <Card className="border-slate-800/80 bg-slate-900/40 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-200">Weakness Detection</h2>
              <p className="text-[10px] text-slate-500">Topics with high failure rates</p>
            </div>
          </div>

          <div className="space-y-4 my-4">
            {mockWeaknesses.map((weak, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-350">{weak.topic}</span>
                  <Badge variant="warning">Mastery: {weak.mastery}%</Badge>
                </div>
                <Progress value={weak.mastery} color="warning" />
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                  {weak.aiSuggestion}
                </p>
              </div>
            ))}
          </div>

          <Link href="/coach">
            <Button size="sm" variant="outline" className="w-full text-xs font-bold">
              Ask AI Coach for advice
            </Button>
          </Link>
        </Card>

      </div>

      {/* 4. PERFORMANCE CHARTS & RECENT ACTIVITY */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analytics Chart */}
        <Card className="lg:col-span-2 border-slate-800/80 bg-slate-900/40">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Rating Growth & Topic Mastery</h2>
              <p className="text-[10px] text-slate-500">Algorithmic progress indicators</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Rating Area Chart */}
            <div className="h-60">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rating Growth Trend</p>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={mockAnalyticsData.ratingTrend}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
                  <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Radar/Spider chart for topic mastery */}
            <div className="h-60">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Mastery Radar</p>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockAnalyticsData.topicMastery}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="topic" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar name="Mastery" dataKey="mastery" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Right Column: Recent Activity */}
        <Card className="border-slate-800/80 bg-slate-900/40 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-200">Recent Activity</h2>
            <p className="text-[10px] text-slate-500">Timeline of updates and completions</p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-1">
            {mockActivities.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-800 mt-1" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{act.title}</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5 leading-relaxed font-semibold">{act.description}</p>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
