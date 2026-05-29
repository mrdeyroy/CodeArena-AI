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
  Gauge
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useUIStore } from '@/store/ui-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function CodingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const problemSlug = params?.problemId as string;
  const { problems, submitCode } = useUserStore();

  // Find matching problem
  const problem = problems.find(p => p.slug === problemSlug) || problems[0];

  // Coding Workspace States
  const [selectedLanguage, setSelectedLanguage] = React.useState('python');
  const [editorCode, setEditorCode] = React.useState(problem.starterCode[selectedLanguage] || problem.starterCode['python'] || '');
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

  // AI Mentor Chat in Workspace
  const [aiMentorMessages, setAiMentorMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: `Hi, I am your dedicated Coding Mentor. I have full context on "${problem.title}". Let me know if you need help optimization steps, dry runs, or line-by-line debugging.` }
  ]);
  const [aiInputValue, setAiInputValue] = React.useState('');
  const [aiIsTyping, setAiIsTyping] = React.useState(false);

  // Sync starter code when language switches
  React.useEffect(() => {
    if (problem.starterCode[selectedLanguage]) {
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

  // Run Code logic
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleActiveTab('results');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRunning(false);
    
    // Simulate simple correct output if complement hashing is present
    const includesHash = editorCode.includes('dict') || editorCode.includes('Map') || editorCode.includes('hash');
    
    setTestResults({
      status: 'Accepted',
      runtime: '12ms',
      memory: '14.2 MB',
      casesPassed: 3,
      casesTotal: 3,
      outputs: [
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', actual: '[0,1]', passed: true },
        { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', actual: '[1,2]', passed: true },
        { input: 'nums = [3,3], target = 6', expected: '[0,1]', actual: includesHash ? '[0,1]' : '[0,1]', passed: true }
      ]
    });
  };

  // Submit Code logic
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setConsoleOpen(true);
    setConsoleActiveTab('results');
    await new Promise(resolve => setTimeout(resolve, 1400));
    setIsSubmitting(false);

    const includesHash = editorCode.includes('dict') || editorCode.includes('Map') || editorCode.includes('hash');
    const isAccepted = includesHash || Math.random() > 0.3; // High chance of success for UX demo

    if (isAccepted) {
      setTestResults({
        status: 'Accepted',
        runtime: '8ms',
        memory: '13.9 MB',
        casesPassed: 45,
        casesTotal: 45,
      });
      submitCode(problem.id, selectedLanguage, editorCode, 'Accepted', '8ms', '13.9 MB', 45, 45);
      
      // AI triggers congratulations message
      setAiMentorMessages(prev => [...prev, {
        role: 'assistant',
        text: `Superb! You solved "${problem.title}" successfully with ${selectedLanguage}. Your hash complementary logic is highly optimal O(N) time. Would you like to check the space-tabulated equivalent?`
      }]);
    } else {
      setTestResults({
        status: 'Wrong Answer',
        runtime: '18ms',
        memory: '14.5 MB',
        casesPassed: 38,
        casesTotal: 45,
        failedCase: 'nums = [3,3], target = 6. Expected: [0,1], Got: [0,0]'
      });
      submitCode(problem.id, selectedLanguage, editorCode, 'Wrong Answer', '18ms', '14.5 MB', 38, 45);
      
      // AI triggers hint
      setAiMentorMessages(prev => [...prev, {
        role: 'assistant',
        text: `I noticed your submission failed on identical values (like [3,3] matching index pairs). Make sure you don't return the same element index twice! Keep track of complement matches properly.`
      }]);
    }
  };

  // AI assistant interactions
  const handleAICommand = async (action: string) => {
    setAiIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setAiIsTyping(false);

    let text = '';
    if (action === 'explain') {
      text = `Here is a breakdown of "${problem.title}":\nYou need to find two distinct indices whose values sum to a specific target.\n- Brute Force: Iterate double loops to find sum, O(N^2) time.\n- Optimal: Use a Hash Map to record indices. For each number x, verify if (target - x) is in the dictionary. If so, return [map[target - x], current_index]. O(N) runtime.`;
    } else if (action === 'hint') {
      text = `Try iterating the array once. Instead of looking forward for complements, look backward by checking if the complementary value target - nums[i] is already saved in your hash table.`;
    } else if (action === 'debug') {
      text = `Scanning your editor code...\nYour logic looks clean! Ensure that you are storing numbers in your dictionary AFTER verifying complement existences, to prevent using the same index element twice.`;
    } else if (action === 'optimize') {
      text = `To minimize space overhead: in C++/Go we can reserve map memory beforehand (e.g. \`make(map[int]int, len(nums))\`) to avoid re-allocating dynamic buckets, which speeds up CPU runtime.`;
    }

    setAiMentorMessages(prev => [...prev, { role: 'assistant', text }]);
  };

  const handleSendAIChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputValue.trim()) return;

    const userText = aiInputValue;
    setAiMentorMessages(prev => [...prev, { role: 'user', text: userText }]);
    setAiInputValue('');
    setAiIsTyping(true);

    setTimeout(() => {
      setAiIsTyping(false);
      let reply = "That's an interesting approach. Let's analyze its runtime complexity. A dictionary implementation allows single linear lookup O(1) inside our loop.";
      if (userText.toLowerCase().includes('time') || userText.toLowerCase().includes('complexity')) {
        reply = "The time complexity is O(N) because we iterate the array of size N exactly once. The space complexity is O(N) because, in the worst case, we store N elements in our Hash Map.";
      }
      setAiMentorMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 700);
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: HelpCircle },
    { id: 'hints', label: 'Hints', icon: Lightbulb },
    { id: 'editorial', label: 'Editorial', icon: BookOpen },
  ];

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col md:flex-row gap-4 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* COLUMN 1: Description Panel */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden min-w-[320px]">
        {/* Left header tabs */}
        <div className="px-4 pt-3 border-b border-slate-800 bg-slate-950/40">
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

              {/* MD Render */}
              <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
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
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400">Constraints</p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
                  {problem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
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
              </div>
            </div>
          )}

          {leftActiveTab === 'editorial' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-200">AI Editorial Solution</h2>
              <p className="text-xs leading-relaxed text-slate-350 font-semibold">
                {problem.editorial || "No editorial posted yet. Use the AI Coach panel on the right to auto-generate optimizations."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: Editor + Terminal Console Panel */}
      <div className="flex-[1.5] flex flex-col gap-4 h-full min-w-[420px]">
        {/* Editor Wrapper */}
        <Card className="flex-1 p-0 bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
          {/* Header config bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <select
                className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 font-semibold focus:outline-none"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 11</option>
                <option value="go">Go Lang</option>
              </select>
              
              <button 
                onClick={() => setEditorCode(problem.starterCode[selectedLanguage] || '')}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300"
                title="Reset code template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTime(secondsElapsed)}</span>
              <button 
                onClick={() => setTimerActive(!timerActive)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${timerActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}
              >
                {timerActive ? 'PAUSE' : 'START'}
              </button>
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
                fontSize: 12,
                minimap: { enabled: false },
                lineNumbers: 'on',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Confidence Slider Footer bar */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
        <Card className={`bg-slate-900 border-slate-800 transition-all duration-300 flex flex-col
          ${consoleOpen ? 'h-56' : 'h-10'}`}
        >
          {/* Header toggle bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-slate-950/40 shrink-0">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-500/80 resize-none h-24"
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
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          {testResults.status === 'Accepted' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className={`font-bold ${testResults.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-450'}`}>
                            {testResults.status}
                          </span>
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase">
                          <span>Runtime: {testResults.runtime}</span>
                          <span>Memory: {testResults.memory}</span>
                          <span>Passed: {testResults.casesPassed}/{testResults.casesTotal}</span>
                        </div>
                      </div>

                      {/* Display Outputs */}
                      {testResults.outputs && (
                        <div className="space-y-2">
                          {testResults.outputs.map((out: any, idx: number) => (
                            <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-slate-500">Case {idx+1}: {out.input}</p>
                                <p className="text-[10px] text-slate-350 mt-1">Expected: {out.expected} | Got: {out.actual}</p>
                              </div>
                              <Badge variant={out.passed ? 'success' : 'danger'}>
                                {out.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {testResults.failedCase && (
                        <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-400">
                          <p className="font-bold text-[10px] uppercase">Failed Assertion Case</p>
                          <p className="mt-1 leading-normal text-xs">{testResults.failedCase}</p>
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

      {/* COLUMN 3: AI Mentor Chat Assistant */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden min-w-[280px]">
        {/* Header Title */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">AI Code Reviewer</span>
          </div>
          <Badge variant="primary" className="text-[9px]">ACTIVE CONTEXT</Badge>
        </div>

        {/* Prompt shortcuts */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/20 grid grid-cols-2 gap-1.5 shrink-0">
          <button
            onClick={() => handleAICommand('explain')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[10px] text-slate-300 font-semibold cursor-pointer justify-center"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" /> Explain Task
          </button>
          <button
            onClick={() => handleAICommand('hint')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[10px] text-slate-300 font-semibold cursor-pointer justify-center"
          >
            <Lightbulb className="w-3 h-3 text-indigo-400" /> Give Hint
          </button>
          <button
            onClick={() => handleAICommand('debug')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[10px] text-slate-300 font-semibold cursor-pointer justify-center"
          >
            <Bug className="w-3 h-3 text-rose-455" /> Debug Logic
          </button>
          <button
            onClick={() => handleAICommand('optimize')}
            className="flex items-center gap-1 px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[10px] text-slate-300 font-semibold cursor-pointer justify-center"
          >
            <Cpu className="w-3 h-3 text-cyan-405" /> Optimize Space
          </button>
        </div>

        {/* Conversational Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {aiMentorMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'assistant' && (
                <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white shrink-0 text-[10px]">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-lg p-2.5 text-[11px] leading-relaxed font-semibold whitespace-pre-wrap
                ${msg.role === 'assistant' 
                  ? 'bg-slate-950 border border-slate-850 text-slate-300' 
                  : 'bg-indigo-600 text-white'}`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {aiIsTyping && (
            <div className="flex gap-2 justify-start items-center">
              <div className="w-5 h-5 rounded bg-indigo-650 flex items-center justify-center text-white shrink-0 text-[10px] animate-pulse">
                AI
              </div>
              <div className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-500 font-bold uppercase">
                Analyzing complementary indices...
              </div>
            </div>
          )}
        </div>

        {/* Text Area Input */}
        <div className="p-3 border-t border-slate-850 bg-slate-950/40">
          <form onSubmit={handleSendAIChat} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Ask mentor..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
              value={aiInputValue}
              onChange={(e) => setAiInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
            >
              Ask
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
