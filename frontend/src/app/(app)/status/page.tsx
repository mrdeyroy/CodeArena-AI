'use client';

import * as React from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  Cpu, 
  Database, 
  Sparkles, 
  Volume2, 
  ShieldAlert,
  Clock,
  Play,
  FileCode,
  Code
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EndpointTest {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  url: string;
  payload?: any;
  category: 'Core API' | 'AI Models' | 'Compiler Sandbox' | 'Voice/Speech';
  status: 'idle' | 'checking' | 'success' | 'failed';
  response?: any;
  latency?: number;
  error?: string;
}

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

const INITIAL_TESTS: EndpointTest[] = [
  // ── Core REST Endpoints ──
  {
    id: 'root',
    name: 'Backend Root Health',
    method: 'GET',
    url: '/',
    category: 'Core API',
    status: 'idle'
  },
  {
    id: 'problems-list',
    name: 'Get Problems List',
    method: 'GET',
    url: '/problems',
    category: 'Core API',
    status: 'idle'
  },
  {
    id: 'skill-graph',
    name: 'Get Skill Graph Nodes',
    method: 'GET',
    url: '/graph',
    category: 'Core API',
    status: 'idle'
  },
  {
    id: 'analytics-overview',
    name: 'Get Analytics Overview',
    method: 'GET',
    url: `/analytics/overview?user_id=${DEFAULT_USER_ID}`,
    category: 'Core API',
    status: 'idle'
  },
  {
    id: 'submissions-status',
    name: 'Get Submission Statuses',
    method: 'GET',
    url: '/submissions/status',
    category: 'Core API',
    status: 'idle'
  },

  // ── AI Models ──
  {
    id: 'ai-hint',
    name: 'AI Hint Generator',
    method: 'POST',
    url: '/ai/hint',
    payload: {
      problem_title: 'Two Sum',
      problem_description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      concepts: ['arrays', 'hashmaps'],
      mastery: {}
    },
    category: 'AI Models',
    status: 'idle'
  },
  {
    id: 'ai-explain',
    name: 'AI Editorial Explainer',
    method: 'POST',
    url: '/ai/explain',
    payload: {
      problem_title: 'Two Sum',
      problem_description: 'Given an array of integers nums...',
      solution_code: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
      language: 'python'
    },
    category: 'AI Models',
    status: 'idle'
  },
  {
    id: 'ai-coach',
    name: 'AI Coach Core Assessment',
    method: 'POST',
    url: '/ai/coach',
    payload: {
      user_id: DEFAULT_USER_ID,
      weak_topics: ['graphs', 'dynamic programming'],
      recent_failures: ['Course Schedule II'],
      mastery: { 'graphs': 0.35, 'dp': 0.28 },
      telemetry_summary: 'Attempts: 4. Average Time taken: 450s'
    },
    category: 'AI Models',
    status: 'idle'
  },
  {
    id: 'ai-roadmap',
    name: 'AI Skill Graph Roadmap',
    method: 'POST',
    url: '/ai/roadmap',
    payload: {
      target_skill: 'graphs',
      current_mastery: { 'arrays': 0.85, 'bfs': 0.35 },
      weak_skills: ['graphs']
    },
    category: 'AI Models',
    status: 'idle'
  },
  {
    id: 'ai-recommend',
    name: 'AI Problem Recommendations',
    method: 'POST',
    url: '/ai/recommend',
    payload: {
      user_id: DEFAULT_USER_ID,
      current_mastery: { 'arrays': 0.85 },
      weak_topics: ['graphs'],
      recent_problem_ids: [],
      count: 2
    },
    category: 'AI Models',
    status: 'idle'
  },
  {
    id: 'ai-plagiarism',
    name: 'AI Plagiarism Evaluator',
    method: 'POST',
    url: '/ai/plagiarism',
    payload: {
      code_a: 'def add(x, y):\n    return x + y',
      code_b: 'def add_nums(a, b):\n    res = a + b\n    return res',
      language: 'python'
    },
    category: 'AI Models',
    status: 'idle'
  },

  // ── Compiler Sandbox ──
  {
    id: 'piston-execute',
    name: 'Code Sandbox Compile (Piston)',
    method: 'POST',
    url: '/execute',
    payload: {
      language: 'python',
      code: 'print("Operational verification successfully completed")',
      stdin: ''
    },
    category: 'Compiler Sandbox',
    status: 'idle'
  },

  // ── Interactive Voice/Speech ──
  {
    id: 'speech-transcribe',
    name: 'Voice Transcribe Engine',
    method: 'POST',
    url: '/speech/transcribe',
    payload: {
      audio_url: 'https://ewzvcunhovwhqcqiyrbi.supabase.co/storage/v1/object/public/audios/sample.wav'
    },
    category: 'Voice/Speech',
    status: 'idle'
  },
  {
    id: 'speech-speak',
    name: 'Voice Speak Audio Synthesis',
    method: 'POST',
    url: '/speech/speak',
    payload: {
      text: 'Diagnostics verify audio pipelines are operating correctly'
    },
    category: 'Voice/Speech',
    status: 'idle'
  }
];

export default function StatusDashboard() {
  const [tests, setTests] = React.useState<EndpointTest[]>(INITIAL_TESTS);
  const [selectedTest, setSelectedTest] = React.useState<EndpointTest | null>(null);
  const [isBusy, setIsBusy] = React.useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const runTest = async (testId: string) => {
    setTests(prev => prev.map(t => t.id === testId ? { ...t, status: 'checking', error: undefined, response: undefined } : t));
    
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const start = performance.now();
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      };

      const options: RequestInit = {
        method: test.method,
        headers,
      };

      if (test.method === 'POST' && test.payload) {
        options.body = JSON.stringify(test.payload);
      }

      const response = await fetch(`${BASE_URL}${test.url}`, options);
      const latency = Math.round(performance.now() - start);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errText}`);
      }

      const json = await response.json();
      
      setTests(prev => prev.map(t => t.id === testId ? { 
        ...t, 
        status: 'success', 
        response: json, 
        latency 
      } : t));

      // Sync active selection details
      if (selectedTest?.id === testId) {
        setSelectedTest(prev => prev ? { ...prev, status: 'success', response: json, latency } : null);
      }
    } catch (e: any) {
      const latency = Math.round(performance.now() - start);
      setTests(prev => prev.map(t => t.id === testId ? { 
        ...t, 
        status: 'failed', 
        error: e.message || 'Connection failed',
        latency 
      } : t));

      // Sync active selection details
      if (selectedTest?.id === testId) {
        setSelectedTest(prev => prev ? { ...prev, status: 'failed', error: e.message || 'Connection failed', latency } : null);
      }
    }
  };

  const runAllTests = async () => {
    setIsBusy(true);
    // Reset all status to checking first
    setTests(prev => prev.map(t => ({ ...t, status: 'checking', error: undefined, response: undefined })));
    
    for (const test of INITIAL_TESTS) {
      await runTest(test.id);
    }
    setIsBusy(false);
  };

  // Run automatically on mount
  React.useEffect(() => {
    runAllTests();
  }, []);

  const totalChecked = tests.length;
  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const averageLatency = successCount > 0 
    ? Math.round(tests.filter(t => t.status === 'success' && t.latency).reduce((acc, t) => acc + (t.latency || 0), 0) / successCount) 
    : 0;

  const categories: Array<EndpointTest['category']> = ['Core API', 'AI Models', 'Compiler Sandbox', 'Voice/Speech'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="w-5.5 h-5.5 text-indigo-400 animate-pulse" /> Diagnostic Status Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Real-time status tracking of REST APIs, generative LLM agents, sandboxed runtimes, and cognitive audio integrations.
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isBusy} 
          icon={RefreshCw} 
          className={isBusy ? 'animate-spin' : ''}
        >
          {isBusy ? 'Checking Status...' : 'Refresh Status'}
        </Button>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-800/60 bg-slate-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Health</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${failedCount === 0 && successCount > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
              {failedCount === 0 && successCount > 0 ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-100">
              {failedCount === 0 && successCount > 0 ? 'Optimal' : failedCount > 0 ? `${failedCount} Errors` : 'Awaiting'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              {failedCount === 0 ? 'All services fully operational' : 'System degradation detected'}
            </p>
          </div>
        </Card>

        <Card className="p-4 border-slate-800/60 bg-slate-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endpoints Checked</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-400 bg-indigo-500/10">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-100">{successCount} / {totalChecked}</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Active monitoring status</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-800/60 bg-slate-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Latency</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-cyan-400 bg-cyan-500/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-100">{averageLatency}ms</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Avg API response window</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-800/60 bg-slate-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sandbox Runtimes</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 bg-amber-500/10">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-extrabold text-slate-100">
              {tests.find(t => t.id === 'piston-execute')?.status === 'success' ? 'Active' : 'Offline'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Secure code compilation sandbox</p>
          </div>
        </Card>
      </div>

      {/* Main Grid View */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Side: Services List grouped by categories */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => {
            const items = tests.filter(t => t.category === category);
            return (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  {category === 'Core API' && <Database className="w-3.5 h-3.5 text-indigo-400" />}
                  {category === 'AI Models' && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                  {category === 'Compiler Sandbox' && <Terminal className="w-3.5 h-3.5 text-indigo-400" />}
                  {category === 'Voice/Speech' && <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                  {category}
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map((test) => (
                    <div 
                      key={test.id}
                      onClick={() => setSelectedTest(test)}
                      className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-150 backdrop-blur-sm
                        ${selectedTest?.id === test.id 
                          ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/5 scale-[1.01]' 
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'}`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 truncate">{test.name}</span>
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-950 text-slate-500 font-bold tracking-tight">
                            {test.method}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-1">{test.url}</p>
                      </div>

                      {/* Status indicator badge */}
                      <div className="shrink-0 flex items-center gap-2">
                        {test.status === 'success' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-semibold">{test.latency}ms</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500" />
                          </div>
                        )}
                        {test.status === 'failed' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500" />
                        )}
                        {test.status === 'checking' && (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {test.status === 'idle' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Response Diagnostics Terminal Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-900 border-slate-800 flex flex-col min-h-[500px]">
            {/* Header info */}
            <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450">Diagnostic Details</h3>
                <span className="text-[10px] text-slate-500 font-semibold">Inspect response headers and payloads</span>
              </div>
              {selectedTest && (
                <button
                  onClick={() => runTest(selectedTest.id)}
                  disabled={selectedTest.status === 'checking'}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Run Single Diagnostic Test"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Test Details Body */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-4">
              {selectedTest ? (
                <>
                  {/* Basic Metadata */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Service Target</p>
                    <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-850 flex flex-col gap-1">
                      <p><span className="text-slate-500">Name:</span> <span className="text-slate-200 font-semibold">{selectedTest.name}</span></p>
                      <p><span className="text-slate-500">Endpoint:</span> <span className="text-indigo-400 font-semibold">{selectedTest.method} {selectedTest.url}</span></p>
                      <p>
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className={`font-bold ${
                          selectedTest.status === 'success' ? 'text-emerald-400' :
                          selectedTest.status === 'failed' ? 'text-rose-500' :
                          selectedTest.status === 'checking' ? 'text-indigo-400' : 'text-slate-500'
                        }`}>
                          {selectedTest.status.toUpperCase()}
                        </span>
                      </p>
                      {selectedTest.latency && <p><span className="text-slate-500">Response Latency:</span> <span className="text-cyan-400 font-semibold">{selectedTest.latency}ms</span></p>}
                    </div>
                  </div>

                  {/* POST Payload if applicable */}
                  {selectedTest.payload && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <Code className="w-3 h-3 text-slate-400" /> Request Payload Parameters
                      </p>
                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-850 overflow-x-auto text-[10px]">
                        <pre className="text-slate-300">{JSON.stringify(selectedTest.payload, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {/* Execution Response Data */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <FileCode className="w-3 h-3 text-slate-400" /> Response Payload Data
                    </p>
                    {selectedTest.response && (
                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-850 overflow-x-auto text-[10px]">
                        <pre className="text-slate-200">{JSON.stringify(selectedTest.response, null, 2)}</pre>
                      </div>
                    )}
                    {selectedTest.error && (
                      <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-450 overflow-x-auto text-[10px]">
                        <p className="font-bold text-[9px] uppercase">Connection Error Trace</p>
                        <pre className="mt-1 leading-normal whitespace-pre-wrap">{selectedTest.error}</pre>
                      </div>
                    )}
                    {!selectedTest.response && !selectedTest.error && (
                      <div className="text-slate-500 text-center py-4 bg-slate-950/30 rounded-lg border border-slate-850 border-dashed">
                        {selectedTest.status === 'checking' ? 'Awaiting response streams...' : 'Click diagnostics test to generate records.'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 text-slate-500 gap-3">
                  <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Select Endpoint to view console response logs</span>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
