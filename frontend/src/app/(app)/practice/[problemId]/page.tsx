'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { 
  Sparkles, 
  Terminal as TermIcon, 
  Play, 
  CheckSquare, 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  MessageSquare,
  Clock,
  RotateCcw,
  Maximize2,
  Minimize2,
  Bug,
  Cpu,
  BrainCircuit,
  Settings,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  Code
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useUIStore } from '@/store/ui-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  fetchProblemBySlug, 
  runProblem, 
  submitProblem, 
  sendCoachChat,
  fetchRecentSubmissions
} from '@/lib/api';
import { Problem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const problemSlug = params?.problemId as string;
  const { problems, addSubmission } = useUserStore();

  // Find matching problem in cache initially, fetch updated details
  const initialProblem = problems.find(p => p.slug === problemSlug) || problems[0];
  const [problem, setProblem] = React.useState<Problem | null>(initialProblem || null);
  const [loading, setLoading] = React.useState(!initialProblem);

  // Coding Workspace States
  const [selectedLanguage, setSelectedLanguage] = React.useState('python');
  const [editorCode, setEditorCode] = React.useState(problem?.starterCode[selectedLanguage] || problem?.starterCode['python'] || '');
  const [leftActiveTab, setLeftActiveTab] = React.useState('description');
  const [consoleOpen, setConsoleOpen] = React.useState(true);
  const [consoleActiveTab, setConsoleActiveTab] = React.useState('input');
  
  // Custom test cases and running statuses
  const [customInput, setCustomInput] = React.useState('nums = [2,7,11,15], target = 9');
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testResults, setTestResults] = React.useState<any>(null);
  
  // Timer State
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(true);

  // Confidence Slider
  const [confidence, setConfidence] = React.useState(50);

  // Workspace-integrated AI Assistant Panel toggle state
  const [workspaceAiOpen, setWorkspaceAiOpen] = React.useState(false);
  const [aiMentorMessages, setAiMentorMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [aiInputValue, setAiInputValue] = React.useState('');
  const [aiIsTyping, setAiIsTyping] = React.useState(false);

  // Submissions State
  const [submissionsList, setSubmissionsList] = React.useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = React.useState(false);

  // Fetch problem details and submissions
  const loadSubmissions = async (probId: string) => {
    setLoadingSubmissions(true);
    try {
      const data = await fetchRecentSubmissions(50);
      const filtered = data.filter((s: any) => s.problems?.id === probId || s.problem_id === probId);
      setSubmissionsList(filtered);
    } catch (e) {
      console.error('Failed to load past submissions:', e);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  React.useEffect(() => {
    async function load() {
      try {
        const p = await fetchProblemBySlug(problemSlug);
        setProblem(p);
        // Load starter code
        setEditorCode(p.starterCode[selectedLanguage] || p.starterCode['python'] || '');
        // Initial assistant message
        setAiMentorMessages([
          { role: 'assistant', text: `Hi, I am your dedicated Coding Mentor. I have full context on "${p.title}". Let me know if you need help with optimization steps, dry runs, or line-by-line debugging.` }
        ]);
        // Load submissions
        loadSubmissions(p.id);
      } catch (e) {
        console.error('Failed to load problem:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [problemSlug]);

  // Sync starter code when language switches
  React.useEffect(() => {
    if (problem && problem.starterCode[selectedLanguage]) {
      setEditorCode(problem.starterCode[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  // Timer counter
  React.useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Run Code logic via backend
  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleActiveTab('results');
    try {
      const res = await runProblem(problem.id, selectedLanguage, editorCode, customInput);
      const mappedStatus = res.status === 'accepted' ? 'Accepted' : (res.status === 'wrong_answer' ? 'Wrong Answer' : res.status.replace(/_/g, ' '));
      
      setTestResults({
        status: mappedStatus,
        runtime: res.runtime ? `${Math.round(res.runtime * 1000)}ms` : '0ms',
        memory: res.memory ? `${(res.memory / 1024).toFixed(1)} MB` : '0 MB',
        outputs: [
          { 
            input: customInput, 
            expected: '', 
            actual: res.stdout || '', 
            passed: res.status === 'accepted' 
          }
        ],
        stderr: res.stderr || '',
      });
    } catch (e) {
      console.error(e);
      setTestResults({
        status: 'Runtime Error',
        runtime: '0ms',
        memory: '0 MB',
        stderr: 'Failed to run code. Verify backend connection.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code logic via backend
  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setConsoleOpen(true);
    setConsoleActiveTab('results');
    try {
      const res = await submitProblem(problem.id, selectedLanguage, editorCode);
      const mappedStatus = res.status === 'accepted' ? 'Accepted' : 'Wrong Answer';
      
      setTestResults({
        status: mappedStatus,
        runtime: res.runtime ? `${Math.round(res.runtime * 1000)}ms` : '0ms',
        memory: res.memory ? `${(res.memory / 1024).toFixed(1)} MB` : '0 MB',
        casesPassed: res.passed_tests || 0,
        casesTotal: res.total_tests || 0,
      });

      addSubmission({
        id: res.submission_id || `sub_${Date.now()}`,
        problemId: problem.id,
        language: selectedLanguage,
        code: editorCode,
        status: mappedStatus,
        runtime: res.runtime ? `${Math.round(res.runtime * 1000)}ms` : '0ms',
        memory: res.memory ? `${(res.memory / 1024).toFixed(1)} MB` : '0 MB',
        passedCases: res.passed_tests || 0,
        totalCases: res.total_tests || 0,
        submittedAt: new Date().toISOString(),
      });

      // Reload historical submissions
      loadSubmissions(problem.id);

      // Trigger AI Coach analysis
      setAiIsTyping(true);
      setWorkspaceAiOpen(true);
      try {
        const feedback = await sendCoachChat(
          `Student submitted code for problem "${problem.title}". Status: ${mappedStatus}. Code:\n${editorCode}`
        );
        setAiMentorMessages(prev => [...prev, { role: 'assistant', text: feedback }]);
      } catch (e) {
        setAiMentorMessages(prev => [...prev, {
          role: 'assistant',
          text: mappedStatus === 'Accepted'
            ? `Superb! You solved "${problem.title}" successfully with ${selectedLanguage}.`
            : `I noticed your submission failed. Take a look at your edge conditions.`
        }]);
      } finally {
        setAiIsTyping(false);
      }
    } catch (e) {
      console.error(e);
      setTestResults({
        status: 'Compile Error',
        runtime: '0ms',
        memory: '0 MB',
        stderr: 'Code execution timed out or server failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI assistant interactions via backend
  const handleAICommand = async (action: string) => {
    if (!problem) return;
    setWorkspaceAiOpen(true);
    setAiIsTyping(true);
    
    let prompt = '';
    if (action === 'explain') {
      prompt = `Explain the problem "${problem.title}" and guide me on how to approach it.`;
    } else if (action === 'hint') {
      prompt = `Provide a subtle hint to solve "${problem.title}". Do not spoil the solution code.`;
    } else if (action === 'debug') {
      prompt = `Identify any syntax, logic, or algorithmic bugs in this code for "${problem.title}". Code:\n${editorCode}`;
    } else if (action === 'optimize') {
      prompt = `How can I improve the time and space complexity of this code? Code:\n${editorCode}`;
    }

    try {
      const reply = await sendCoachChat(prompt);
      setAiMentorMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setAiMentorMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I failed to generate a response. Please try again.' }]);
    } finally {
      setAiIsTyping(false);
    }
  };

  const handleSendAIChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputValue.trim() || !problem) return;

    const userText = aiInputValue;
    setAiMentorMessages(prev => [...prev, { role: 'user', text: userText }]);
    setAiInputValue('');
    setAiIsTyping(true);

    try {
      const reply = await sendCoachChat(`Problem context: "${problem.title}". User message: ${userText}`);
      setAiMentorMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setAiMentorMessages(prev => [...prev, { role: 'assistant', text: 'I am unable to answer right now. Please try again shortly.' }]);
    } finally {
      setAiIsTyping(false);
    }
  };

  const loadPastSubmissionCode = (code: string) => {
    if (!code) return;
    setEditorCode(code);
    setLeftActiveTab('description');
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: HelpCircle },
    { id: 'hints', label: 'Hints', icon: Lightbulb },
    { id: 'editorial', label: 'Editorial', icon: BookOpen },
    { id: 'submissions', label: 'Submissions', icon: History },
  ];

  if (loading || !problem) {
    return (
      <div className="h-[calc(100vh-5.5rem)] bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Loading coding workspace...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-row gap-4 max-w-[1600px] mx-auto overflow-hidden relative">
      
      {/* COLUMN 1: Description Panel */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col h-full overflow-hidden min-w-[320px]">
        {/* Left header tabs */}
        <div className="px-4 pt-3 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
          <Tabs
            tabs={leftTabs}
            activeTab={leftActiveTab}
            onChange={setLeftActiveTab}
          />
        </div>

        {/* Tab content scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {leftActiveTab === 'description' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-slate-100">{problem.title}</h1>
                <Badge variant={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'danger'}>
                  {problem.difficulty}
                </Badge>
              </div>

              {/* Description Markdown text */}
              <div className="text-xs leading-relaxed text-slate-350 whitespace-pre-wrap font-medium">
                {problem.description}
              </div>

              {/* Examples */}
              <div className="space-y-3.5 pt-2">
                <p className="text-xs font-bold text-slate-400">Examples</p>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-slate-950/60 rounded-lg p-3 border border-slate-850 space-y-1.5 font-mono text-[11px]">
                    <p><span className="text-slate-500">Input:</span> {ex.input}</p>
                    <p><span className="text-slate-500">Output:</span> {ex.output}</p>
                    {ex.explanation && (
                      <p className="text-slate-400 italic text-[10px] mt-1"><span className="text-slate-500">Explanation:</span> {ex.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints */}
              {problem.constraints && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-400">Constraints</p>
                  <pre className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 text-xs text-slate-400 font-mono leading-relaxed">
                    {problem.constraints}
                  </pre>
                </div>
              )}
            </div>
          )}

          {leftActiveTab === 'hints' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-200">Problem Hints</h2>
              <div className="space-y-3">
                {problem.hints.map((hint, idx) => (
                  <div key={idx} className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3 text-xs leading-relaxed text-slate-300 font-semibold">
                    <span className="font-bold text-indigo-400 block mb-1">Hint {idx + 1}</span>
                    {hint}
                  </div>
                ))}
                {problem.hints.length === 0 && (
                  <div className="text-slate-500 text-center py-6 text-xs font-semibold">
                    No hints available. Use AI Assistant to get adaptive hints.
                  </div>
                )}
              </div>
            </div>
          )}

          {leftActiveTab === 'editorial' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-200">AI Editorial Solution</h2>
              <p className="text-xs leading-relaxed text-slate-350 font-semibold whitespace-pre-wrap">
                {problem.editorial || "No editorial posted yet. Use the AI Coach panel to generate optimizations."}
              </p>
            </div>
          )}

          {leftActiveTab === 'submissions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-200">Your Submissions</h2>
                <button 
                  onClick={() => loadSubmissions(problem.id)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                  title="Reload submissions history"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {loadingSubmissions && (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-500 text-xs">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500" />
                    <span>Hydrating submissions...</span>
                  </div>
                )}

                {!loadingSubmissions && submissionsList.map((sub, idx) => (
                  <div 
                    key={sub.id || idx} 
                    className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 hover:border-slate-800 transition-all flex flex-col gap-2 shadow-sm font-semibold"
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-xs">
                        {sub.status === 'accepted' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className={sub.status === 'accepted' ? 'text-emerald-400 font-bold' : 'text-rose-450 font-bold'}>
                          {sub.status === 'accepted' ? 'Accepted' : 'Failed'}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'recent'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold py-0">{sub.language}</Badge>
                        <span>Runtime: {sub.runtime ? `${Math.round(sub.runtime * 1000)}ms` : 'N/A'}</span>
                      </div>
                      
                      {sub.code && (
                        <button
                          onClick={() => loadPastSubmissionCode(sub.code)}
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
                        >
                          <Code className="w-3 h-3" /> Load Code
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!loadingSubmissions && submissionsList.length === 0 && (
                  <div className="text-slate-500 text-center py-8 text-xs">
                    No submissions recorded yet for this problem.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: Editor + Terminal Console Panel */}
      <div className="flex-[1.5] flex flex-col gap-4 h-full min-w-[420px]">
        {/* Editor Wrapper */}
        <Card className="flex-1 p-0 bg-slate-900 border-slate-800/80 overflow-hidden flex flex-col">
          {/* Header config bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <select
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 font-semibold focus:outline-none focus:border-indigo-500 hover:border-slate-700 transition-all duration-150 cursor-pointer shadow-sm"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="cpp">C++ (g++)</option>
              </select>
              
              <button 
                onClick={() => setEditorCode(problem.starterCode[selectedLanguage] || '')}
                className="p-1.5 hover:bg-slate-850 hover:text-slate-200 rounded-lg text-slate-400 transition-colors cursor-pointer"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI toggle and Timer */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWorkspaceAiOpen(!workspaceAiOpen)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-sm
                  ${workspaceAiOpen 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow' 
                    : 'bg-slate-950 border-slate-800 text-indigo-400 hover:border-slate-700 hover:text-indigo-300'}`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI ASSISTANT
              </button>

              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-505" />
                <span>{formatTime(secondsElapsed)}</span>
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${timerActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}
                >
                  {timerActive ? 'PAUSE' : 'START'}
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : 'javascript'}
              theme="vs-dark"
              value={editorCode}
              onChange={(val) => setEditorCode(val || '')}
              options={{
                fontSize: 12.5,
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true
              }}
            />
          </div>

          {/* Confidence Slider Footer bar */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
            <span>Confidence index</span>
            <div className="flex items-center gap-2 flex-1 max-w-[200px] mx-4">
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-indigo-400 font-bold w-6 text-right">{confidence}%</span>
            </div>
          </div>
        </Card>

        {/* Bottom Console Panel */}
        <Card className={`bg-slate-900 border-slate-800/80 transition-all duration-300 flex flex-col shrink-0
          ${consoleOpen ? 'h-56' : 'h-10'}`}
        >
          {/* Header toggle bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
            <div className="flex gap-4">
              <button
                onClick={() => { setConsoleOpen(true); setConsoleActiveTab('input'); }}
                className={`text-[10px] uppercase font-bold tracking-wider pb-1 border-b-2 transition-all cursor-pointer
                  ${consoleOpen && consoleActiveTab === 'input' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                Custom Test Cases
              </button>
              <button
                onClick={() => { setConsoleOpen(true); setConsoleActiveTab('results'); }}
                className={`text-[10px] uppercase font-bold tracking-wider pb-1 border-b-2 transition-all cursor-pointer
                  ${consoleOpen && consoleActiveTab === 'results' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-355'}`}
              >
                Execution Console
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConsoleOpen(!consoleOpen)}
                className="text-slate-400 hover:text-slate-200 p-0.5"
              >
                <ChevronUp className={`w-3.5 h-3.5 transform transition-transform duration-200 ${consoleOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Console Inner Bodies */}
          {consoleOpen && (
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              {consoleActiveTab === 'input' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Configure Input Values</p>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-800/60 rounded-lg p-3 text-slate-350 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-150 resize-none h-24 shadow-sm"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
              )}

              {consoleActiveTab === 'results' && (
                <div className="space-y-3">
                  {!testResults && !isRunning && !isSubmitting && (
                    <div className="text-slate-500 text-center py-6">
                      Click Run or Submit to see execution diagnostics.
                    </div>
                  )}

                  {(isRunning || isSubmitting) && (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {isRunning ? 'Compiling sandbox inputs...' : 'Evaluating all test assertions...'}
                      </span>
                    </div>
                  )}

                  {testResults && !isRunning && !isSubmitting && (
                    <div className="space-y-3 animate-fade-in font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          {testResults.status === 'Accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-455" />
                          )}
                          <span className={`font-bold ${testResults.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-450'}`}>
                            {testResults.status}
                          </span>
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase">
                          <span>Runtime: {testResults.runtime}</span>
                          {testResults.casesTotal !== undefined && (
                            <span>Passed: {testResults.casesPassed}/{testResults.casesTotal}</span>
                          )}
                        </div>
                      </div>

                      {/* Display Outputs */}
                      {testResults.outputs && (
                        <div className="space-y-2">
                          {testResults.outputs.map((out: any, idx: number) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex justify-between items-center shadow-inner">
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold">Case {idx+1}: {out.input}</p>
                                <p className="text-[10px] text-slate-350 mt-1">Expected: {out.expected || 'N/A'} | Got: {out.actual}</p>
                              </div>
                              <Badge variant={out.passed ? 'success' : 'danger'}>
                                {out.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {testResults.stderr && (
                        <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-400 font-mono whitespace-pre-wrap">
                          <p className="font-bold text-[10px] uppercase block mb-1">Execution stderr</p>
                          <code className="text-[11px] leading-relaxed">{testResults.stderr}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={Play}
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
            >
              Run Code
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={CheckSquare}
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
            >
              Submit Code
            </Button>
          </div>
        </Card>
      </div>

      {/* COLUMN 3: Slide-in AI Mentor Chat Assistant (using Framer Motion) */}
      <AnimatePresence>
        {workspaceAiOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-slate-900 border border-slate-800/80 rounded-xl flex flex-col h-full overflow-hidden shrink-0 z-10"
          >
            {/* Header Title */}
            <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-205">AI Code Reviewer</span>
              </div>
              <button 
                onClick={() => setWorkspaceAiOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-450 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prompt shortcuts */}
            <div className="p-3 border-b border-slate-800/60 bg-slate-950/20 grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => handleAICommand('explain')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-[10px] text-slate-350 font-semibold cursor-pointer justify-center transition-all duration-150 shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Explain Task
              </button>
              <button
                onClick={() => handleAICommand('hint')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-[10px] text-slate-350 font-semibold cursor-pointer justify-center transition-all duration-150 shadow-sm"
              >
                <Lightbulb className="w-3.5 h-3.5 text-indigo-450" /> Give Hint
              </button>
              <button
                onClick={() => handleAICommand('debug')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-[10px] text-slate-350 font-semibold cursor-pointer justify-center transition-all duration-150 shadow-sm"
              >
                <Bug className="w-3.5 h-3.5 text-rose-450" /> Debug Logic
              </button>
              <button
                onClick={() => handleAICommand('optimize')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-slate-100 rounded-lg text-[10px] text-slate-355 font-semibold cursor-pointer justify-center transition-all duration-150 shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-405" /> Optimize Space
              </button>
            </div>

            {/* Conversational Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {aiMentorMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded bg-indigo-650 flex items-center justify-center text-white shrink-0 text-[10px] shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed font-semibold whitespace-pre-wrap shadow-xs
                    ${msg.role === 'assistant' 
                      ? 'bg-slate-950 border border-slate-850 text-slate-300' 
                      : 'bg-indigo-600 text-white'}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {aiIsTyping && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-6 h-6 rounded bg-indigo-650 flex items-center justify-center text-white shrink-0 text-[10px] animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                    Analyzing code buffers...
                  </div>
                </div>
              )}
            </div>

            {/* Text Area Input */}
            <div className="p-3 border-t border-slate-850 bg-slate-950/40 shrink-0">
              <form onSubmit={handleSendAIChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask mentor..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-150 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
                  value={aiInputValue}
                  onChange={(e) => setAiInputValue(e.target.value)}
                  disabled={aiIsTyping}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm border border-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
                  disabled={aiIsTyping}
                >
                  Ask
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
