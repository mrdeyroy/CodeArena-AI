'use client';

import * as React from 'react';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Activity, 
  AlertTriangle, 
  Compass, 
  UserCheck, 
  Trophy, 
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockWeaknesses, mockCurrentUser } from '@/lib/mock-data';
import Link from 'next/link';

export default function AICoachPage() {
  const [activeSection, setActiveSection] = React.useState<'chat' | 'weaknesses' | 'plans' | 'career'>('chat');
  
  // Chat States
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    { role: 'assistant', text: "Welcome to your personal AI Coach, Alex. I have evaluated your recent problem submissions and contest performance.\n\nYour recursion logic is highly optimized, but graph search cycles and DP tabulation setup are key bottlenecks. How would you like to structure your study plan today?", time: '10:20 AM' }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text, time: now }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = "Let's work through that. We can generate some custom problem modules or examine specific complex boundaries.";
      if (text.toLowerCase().includes('dp') || text.toLowerCase().includes('dynamic')) {
        reply = "Understood. For Dynamic Programming, your tabulation accuracy is at 28%. I recommend we solve 'Edit Distance' first. It provides an excellent baseline for matching two-string alignments. Would you like a step-by-step hint for setting up the 2D DP matrix?";
      } else if (text.toLowerCase().includes('graph') || text.toLowerCase().includes('traverse')) {
        reply = "Graph traversals (BFS/DFS) are currently contributing to a 42% solution accuracy. I suggest practicing 'Merge k Sorted Lists' which models multiple pointer heads, and moving into cyclic graph path detections next. Try focusing on keeping track of visited set states.";
      } else if (text.toLowerCase().includes('plan') || text.toLowerCase().includes('study')) {
        reply = "I've structured a 3-part custom plan for you:\n1. Solve 2 Two-Pointer modules to ensure index boundaries are solid.\n2. Complete 'Edit Distance' using iterative tabulation.\n3. Take a 15-minute mock interview on Arrays & Matrices to verify performance.\nShall we get started?";
      } else if (text.toLowerCase().includes('career') || text.toLowerCase().includes('google') || text.toLowerCase().includes('meta')) {
        reply = "Your interview readiness index is 88%. This puts you in a great position for L3/L4 roles at Google or E3/E4 at Meta. However, Meta sponsored loops heavily target graph cycle configurations, while Google focuses on optimization efficiency. I recommend completing 3 hard-difficulty tree/graph modules.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply, time: now }]);
    }, 850);
  };

  const sections = [
    { id: 'chat', label: 'AI Coach Chat', icon: BrainCircuit, desc: 'Conversational mentoring console' },
    { id: 'weaknesses', label: 'Weakness Detector', icon: AlertTriangle, desc: 'Real-time capability warnings' },
    { id: 'plans', label: 'Practice Roadmap', icon: Compass, desc: 'Custom tailored practice steps' },
    { id: 'career', label: 'Career Advisory', icon: UserCheck, desc: 'Target company loops assessment' }
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: SECTIONS */}
      <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-all shrink-0 cursor-pointer whitespace-nowrap lg:whitespace-normal
                ${isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15' 
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-snug">{sec.label}</p>
                <p className={`text-[10px] hidden lg:block font-medium mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{sec.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. RIGHT COMPONENT: VIEW SWITCHER */}
      <Card className="flex-1 p-0 bg-slate-900 border-slate-800 flex flex-col h-full overflow-hidden">
        
        {/* Chat Console Section */}
        {activeSection === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-450">Active AI Coach session</h2>
                <span className="text-[10px] text-slate-500 font-semibold">Continuous context indexing active</span>
              </div>
              <Badge variant="success" className="font-bold flex items-center gap-0.5">
                <Activity className="w-3 h-3 text-emerald-400" /> ONLINE
              </Badge>
            </div>

            {/* Bubble stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-650 flex items-center justify-center shrink-0 text-white shadow-md">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                  )}
                  <div className="space-y-1 max-w-[80%]">
                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-semibold whitespace-pre-wrap
                      ${msg.role === 'assistant' 
                        ? 'bg-slate-950 border border-slate-850 text-slate-200' 
                        : 'bg-indigo-600 text-white'}`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block text-right px-1">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-7 h-7 rounded-lg bg-indigo-650 flex items-center justify-center shrink-0 text-white animate-pulse">
                    AI
                  </div>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-medium">
                    Formulating study adjustments...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Text Box footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/40 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  placeholder="Ask Coach (e.g., 'Generate dynamic programming practice roadmap')..."
                  className="flex-1 bg-slate-905 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" size="md" icon={Send}>
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Weakness Detector Panel */}
        {activeSection === 'weaknesses' && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Weakness detection insights</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Calculated by scanning compiler runtime metrics and failed submissions</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockWeaknesses.map((weak, idx) => (
                <Card key={idx} className="bg-slate-950/40 border-slate-850 p-5 flex flex-col justify-between h-56">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-slate-200">{weak.topic}</h3>
                      <Badge variant="warning">Mastery: {weak.mastery}%</Badge>
                    </div>
                    <Progress value={weak.mastery} color="warning" className="mb-3" />
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      {weak.aiSuggestion}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-850 flex justify-between items-center mt-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">recommended practice:</span>
                    {weak.recommendedProblems.map(p => (
                      <Link key={p.id} href={`/practice/${p.title.toLowerCase().replace(/ /g, '-')}`}>
                        <Button size="sm" variant="outline" className="text-[10px]">Solve Task</Button>
                      </Link>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Plans Panel */}
        {activeSection === 'plans' && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Adaptive Practice Roadmap</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Dynamically compiled steps to target algorithm gaps</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Basics reinforcement (Arrays & Pointers)', duration: '1-2 Days', desc: 'Focus on container volumes and sliding windows. Practice boundary indices validation.', status: 'completed' },
                { title: 'Dynamic Programming state setup', duration: '3-4 Days', desc: 'Construct subproblems for Edit Distance. Write memoized matrix templates on whiteboard.', status: 'current' },
                { title: 'Graph search optimizations', duration: '5-6 Days', desc: 'Study cyclic node checking and topological sort orders using adjacent lists.', status: 'locked' }
              ].map((step, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                    ${step.status === 'completed'
                      ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400'
                      : step.status === 'current'
                        ? 'bg-indigo-500/10 border border-indigo-500 text-indigo-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {step.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                      <Badge variant={step.status === 'completed' ? 'success' : step.status === 'current' ? 'primary' : 'outline'}>
                        {step.duration}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-semibold">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career advisory Panel */}
        {activeSection === 'career' && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Tech Loops & Interview Matches</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Analysis comparing your coding capability against hiring standard distributions</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-950/40 border-slate-850 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-xs font-bold text-slate-200">Google E4 loops</h3>
                  <Badge variant="warning">Readiness: 78%</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Google rounds target advanced graph nodes and complex structures. Reinforce Dijkstra and Topological sorted maps to exceed the 90% hiring baseline.
                </p>
              </Card>

              <Card className="bg-slate-950/40 border-slate-850 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h3 className="text-xs font-bold text-slate-200">Meta E4 loops</h3>
                  <Badge variant="success">Readiness: 88%</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Meta values code speed and Two Pointers optimization accuracy. Practice sliding windows to reach E4 ready index levels.
                </p>
              </Card>
            </div>
          </div>
        )}

      </Card>

    </div>
  );
}
