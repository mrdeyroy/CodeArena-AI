'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  Terminal, 
  HelpCircle, 
  Clock, 
  Building,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user-store';
import { Difficulty, Problem } from '@/lib/types';

function PracticeExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams ? searchParams.get('search') : null;
  const { problems, fetchProblemsList } = useUserStore();
  const [hasMounted, setHasMounted] = React.useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState(searchParamQuery || '');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty | 'All'>('All');
  const [selectedTopic, setSelectedTopic] = React.useState<string | 'All'>('All');
  const [selectedCompany, setSelectedCompany] = React.useState<string | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string | 'All'>('All');

  React.useEffect(() => {
    setHasMounted(true);
    fetchProblemsList();
  }, [fetchProblemsList]);

  // Clear query on click
  React.useEffect(() => {
    if (searchParamQuery) {
      setSearchQuery(searchParamQuery);
    }
  }, [searchParamQuery]);

  if (!hasMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-450">Loading Practice Explorer...</span>
      </div>
    );
  }

  // Derived unique filters
  const allTopics = Array.from(new Set(problems.flatMap(p => p.topics)));
  const allCompanies = Array.from(new Set(problems.flatMap(p => p.companies)));

  // Filter logic
  const filteredProblems = problems.filter((prob) => {
    const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prob.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          prob.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === 'All' || prob.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'All' || prob.topics.includes(selectedTopic);
    const matchesCompany = selectedCompany === 'All' || prob.companies.includes(selectedCompany);
    const matchesStatus = selectedStatus === 'All' || 
                          (selectedStatus === 'Solved' && prob.status === 'Solved') ||
                          (selectedStatus === 'Attempted' && prob.status === 'Attempted') ||
                          (selectedStatus === 'Unsolved' && prob.status === 'Unsolved');

    return matchesSearch && matchesDifficulty && matchesTopic && matchesCompany && matchesStatus;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('All');
    setSelectedTopic('All');
    setSelectedCompany('All');
    setSelectedStatus('All');
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" /> Coding practice explorer
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Select an algorithmic task or let AI recommend items to address your weaknesses</p>
        </div>
        {(selectedDifficulty !== 'All' || selectedTopic !== 'All' || selectedCompany !== 'All' || selectedStatus !== 'All' || searchQuery !== '') && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-bold"
          >
            Clear Filters <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Grid: Filters Sidebar + Problem Table */}
      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filters Column */}
        <Card className="lg:col-span-1 border-slate-800 bg-slate-900/60 p-5 space-y-6 h-fit backdrop-blur-sm">
          <h2 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Practice Filters</h2>
          
          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as any)}
                  className={`px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm
                    ${selectedDifficulty === diff 
                      ? 'bg-indigo-600 border-indigo-600 text-white focus-visible:ring-4 focus-visible:ring-indigo-500/20' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topic filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topics</label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-700 transition-all duration-150 cursor-pointer shadow-sm"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="All">All Topics</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Company filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Companies</label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-700 transition-all duration-150 cursor-pointer shadow-sm"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="All">All Companies</option>
              {allCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Solved', 'Attempted', 'Unsolved'].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setSelectedStatus(stat)}
                  className={`px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-sm
                    ${selectedStatus === stat 
                      ? 'bg-indigo-600 border-indigo-600 text-white focus-visible:ring-4 focus-visible:ring-indigo-500/20' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>

        </Card>

        {/* Right Side: Problem Cards List */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Problems Count Dashboard */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold px-1">
            <span>Showing {filteredProblems.length} of {problems.length} problems</span>
          </div>

          {/* Card list */}
          <div className="space-y-3">
            {filteredProblems.map((prob) => (
              <Card key={prob.id} className="p-4 bg-slate-900/50 border-slate-850 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Left Detail */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {prob.status === 'Solved' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {prob.status === 'Attempted' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    <h3 className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
                      <Link href={`/practice/${prob.slug}`}>
                        {prob.title}
                      </Link>
                    </h3>
                    <Badge variant={getDifficultyColor(prob.difficulty)}>{prob.difficulty}</Badge>
                    {prob.isAIRecommended && (
                      <Badge variant="primary" className="font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Recommended
                      </Badge>
                    )}
                  </div>
                  
                  {/* Topic and Company badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">topics:</span>
                    {prob.topics.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-350">{t}</span>
                    ))}
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">companies:</span>
                    {prob.companies.map(c => (
                      <span key={c} className="px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
                    <span className="flex items-center gap-1" title="Acceptance rate">
                      <HelpCircle className="w-3.5 h-3.5" /> {prob.acceptanceRate}%
                    </span>
                    <span className="flex items-center gap-1" title="Estimated solve time">
                      <Clock className="w-3.5 h-3.5" /> {prob.estimatedTime}
                    </span>
                  </div>
                  <Link href={`/practice/${prob.slug}`}>
                    <Button size="sm" variant={prob.status === 'Solved' ? 'outline' : 'primary'}>
                      {prob.status === 'Solved' ? 'Practice Again' : 'Solve Code'}
                    </Button>
                  </Link>
                </div>

              </Card>
            ))}

            {filteredProblems.length === 0 && (
              <div className="text-center py-12 bg-slate-900/20 border border-slate-850 rounded-xl space-y-2">
                <p className="text-sm font-semibold text-slate-400">No problems match your current filter selections.</p>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Loading Practice Modules...</span>
      </div>
    }>
      <PracticeExplorer />
    </Suspense>
  );
}
