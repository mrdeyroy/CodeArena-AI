'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  Activity,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress, ProgressRing } from '@/components/ui/progress';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from 'recharts';

export default function MockInterviewPage() {
  const [sessionState, setSessionState] = React.useState<'select' | 'active' | 'report'>('select');
  const [selectedType, setSelectedType] = React.useState<string>('DSA');
  
  // Active Interview states
  const [micActive, setMicActive] = React.useState(false);
  const [transcript, setTranscript] = React.useState<Array<{ speaker: 'interviewer' | 'candidate'; text: string }>>([
    { speaker: 'interviewer', text: "Welcome! Today we will evaluate your array and hash map data structure capabilities. Let's start: Can you explain how you would resolve the 'Two Sum' complement logic using a single array iteration?" }
  ]);
  const [candidateResponse, setCandidateResponse] = React.useState('');
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  // Timer counter
  React.useEffect(() => {
    let interval: any = null;
    if (sessionState === 'active') {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      setSecondsElapsed(0);
    };
  }, [sessionState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartInterview = (type: string) => {
    setSelectedType(type);
    setTranscript([
      { 
        speaker: 'interviewer', 
        text: type === 'DSA' 
          ? "Welcome! Let's start with algorithms. How would you design a lookup logic that returns index offsets of elements summing to a target?" 
          : type === 'System Design'
            ? "Welcome. Today we will design a highly scalable Notification Service. How would you handle variable messaging loads during traffic spikes?"
            : "Welcome. Tell me about a time you resolved a major deadlock or performance regression in a code repository." 
      }
    ]);
    setSessionState('active');
  };

  const handleSendResponse = () => {
    if (!candidateResponse.trim()) return;
    
    // Add candidate reply
    const responseText = candidateResponse;
    setTranscript(prev => [...prev, { speaker: 'candidate', text: responseText }]);
    setCandidateResponse('');

    // Trigger interviewer next question or end loop
    setTimeout(() => {
      if (currentQuestionIndex === 0) {
        let followUp = "Excellent point. Now, how does that solution's memory trade-off compare if the array is already sorted? Can you optimize space?";
        if (selectedType === 'System Design') {
          followUp = "Good. What database choices would you make to persist user subscription states? SQL or NoSQL, and why?";
        }
        setTranscript(prev => [...prev, { speaker: 'interviewer', text: followUp }]);
        setCurrentQuestionIndex(1);
      } else {
        // End interview and generate report
        setSessionState('report');
        setCurrentQuestionIndex(0);
      }
    }, 900);
  };

  const interviewTypes = [
    { title: 'DSA Interview', type: 'DSA', desc: 'Focuses on sorting, hash boundaries, binary trees, dynamic tabulation, and complex array matrices.', duration: '30 mins' },
    { title: 'System Design', type: 'System Design', desc: 'Scalable messaging queues, load-balancing caches, DB sharding rules, and rate-limiting structures.', duration: '45 mins' },
    { title: 'Behavioral prep', type: 'Behavioral', desc: 'STAR technique response evaluation. Scans engineering leadership and conflict resolution capability.', duration: '20 mins' },
    { title: 'CS Fundamentals', type: 'CS Fundamentals', desc: 'Operating system scheduling, network protocols (TCP/IP), thread deadlocks, database indexes.', duration: '25 mins' }
  ];

  // Report mock metrics
  const reportRadarData = [
    { metric: 'DSA Mastery', score: 90 },
    { metric: 'Communication', score: 82 },
    { metric: 'Problem Solving', score: 88 },
    { metric: 'Confidence', score: 75 },
    { metric: 'System Logic', score: 80 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Mock Interview Room
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Verify technical engineering skills under simulated real-world company time constraints.</p>
        </div>
      </div>

      {/* 1. SELECTION SCREEN */}
      {sessionState === 'select' && (
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {interviewTypes.map((i, idx) => (
            <Card key={idx} className="bg-slate-900/60 border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="primary" className="font-bold">{i.duration}</Badge>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Evaluation enabled</span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{i.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">{i.desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-850 mt-4 flex justify-end">
                <Button size="sm" icon={Play} onClick={() => handleStartInterview(i.type)}>
                  Start Session
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 2. ACTIVE INTERVIEW ROOM */}
      {sessionState === 'active' && (
        <div className="grid lg:grid-cols-3 gap-6 pt-2 h-[calc(100vh-14rem)] overflow-hidden">
          
          {/* Interviewer Transcript feed column */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
            
            {/* Header info */}
            <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 capitalize">{selectedType} Interview Session</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-xs font-semibold">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{formatTime(secondsElapsed)}</span>
              </div>
            </div>

            {/* Transcript scrolls */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {transcript.map((t, idx) => {
                const isAI = t.speaker === 'interviewer';
                return (
                  <div key={idx} className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {isAI && (
                      <div className="w-8 h-8 rounded-full bg-indigo-650 flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-md">
                        AI
                      </div>
                    )}
                    <div className="space-y-1 max-w-[80%]">
                      <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-semibold whitespace-pre-wrap
                        ${isAI 
                          ? 'bg-slate-950 border border-slate-850 text-slate-250' 
                          : 'bg-indigo-600 text-white shadow-md'}`}
                      >
                        {t.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Response footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/40 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Candidate Response</span>
                <button
                  type="button"
                  onClick={() => setMicActive(!micActive)}
                  className={`p-2 rounded-full cursor-pointer transition-all
                    ${micActive 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-255 border border-slate-800'}`}
                  title={micActive ? 'Mute micro' : 'Enable vocal transcription (vocal mock placeholder)'}
                >
                  {micActive ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={micActive ? 'Listening to voice response... (vocal mock input active)' : 'Type your answer details here...'}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
                  value={candidateResponse}
                  onChange={(e) => setCandidateResponse(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendResponse();
                  }}
                />
                <Button size="md" icon={ArrowRight} onClick={handleSendResponse}>
                  Submit Response
                </Button>
              </div>
            </div>

          </div>

          {/* Right helper info panel */}
          <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Evaluation Focus
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Our AI tracks syntax design patterns, latency optimizations, vocabulary clarity, and answers completeness in real time.
              </p>
              <div className="space-y-2 border-t border-slate-850 pt-3">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Questions Completed</span>
                  <span>{currentQuestionIndex} / 2</span>
                </div>
                <Progress value={currentQuestionIndex === 0 ? 0 : 50} color="primary" />
              </div>
            </Card>

            <Button
              variant="outline"
              icon={XCircle}
              className="w-full text-xs font-bold cursor-pointer"
              onClick={() => setSessionState('select')}
            >
              Cancel Interview
            </Button>
          </div>

        </div>
      )}

      {/* 3. POST-INTERVIEW ANALYSIS REPORT */}
      {sessionState === 'report' && (
        <div className="grid lg:grid-cols-3 gap-6 pt-2 animate-slide-up">
          
          {/* Left/Middle Column: Metrics details */}
          <Card className="lg:col-span-2 bg-slate-900/60 border-slate-850 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <Badge variant="success" className="mb-1 font-bold">Session Completed</Badge>
                <h2 className="text-base font-bold text-slate-200">Evaluation Analysis Report</h2>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Composite score</p>
                <p className="text-xl font-extrabold text-emerald-400">84/100</p>
              </div>
            </div>

            {/* Radar chart wrapper */}
            <div className="h-64 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Performance Dimensions</p>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={reportRadarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar name="Candidate Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bullet points on strengths and weaknesses */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Strengths</span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside font-semibold leading-relaxed">
                  <li>Strong hashing complement complexity design.</li>
                  <li>Good runtime space-time trade-off answers.</li>
                  <li>Accurate pointer boundary specifications.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Areas for Improvement</span>
                <ul className="space-y-1.5 text-xs text-slate-350 list-disc list-inside font-semibold leading-relaxed">
                  <li>Vocal pacing was slightly fast on sorting limits.</li>
                  <li>Verify recursive depths values to avoid call stack exceptions.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-850 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> Career Readiness
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Your performance benchmarks well with junior/mid backend engineer standard profiles at top scaleups.
              </p>
              <Link href="/practice">
                <Button size="sm" className="w-full mt-2 font-bold">Continue Practice</Button>
              </Link>
            </Card>

            <Button
              variant="outline"
              icon={RotateCcw}
              className="w-full text-xs font-bold cursor-pointer"
              onClick={() => setSessionState('select')}
            >
              Start New Interview
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
