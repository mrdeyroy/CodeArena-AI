'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Network, 
  BrainCircuit, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  UserCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [activePreview, setActivePreview] = React.useState<'editor' | 'graph' | 'coach' | 'interview'>('editor');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const stats = [
    { label: 'Problems Solved', value: '1M+' },
    { label: 'Mock Interviews', value: '100K+' },
    { label: 'Active Developers', value: '50K+' },
    { label: 'Interview Success Rate', value: '95%' }
  ];

  const features = [
    {
      title: 'AI Coding Coach',
      desc: 'An always-on coding coach that suggests optimizations, explains algorithms, and helps you write cleaner code.',
      icon: BrainCircuit,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      title: 'Skill Graph Engine',
      desc: 'Interactive visual mapping of your algorithm mastery. Highlights weaknesses and suggests linear paths.',
      icon: Network,
      color: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      title: 'Mock Interviews',
      desc: 'Real-time mock interviews covering DSA, Behavioral, and System Design with instantaneous technical reviews.',
      icon: Briefcase,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      title: 'Personalized Roadmaps',
      desc: 'Dynamically adjusted learning tracks that customize practice modules based on your speed and weak topics.',
      icon: TrendingUp,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      title: 'Code Optimization',
      desc: 'Deep logic scanners check your sub-optimal loops and propose runtime space efficiency upgrades.',
      icon: Terminal,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      title: 'Certification System',
      desc: 'Earn specialized verified industry badges in Graph Theory, Dynamic Programming, and System Design.',
      icon: Award,
      color: 'text-indigo-400 bg-indigo-500/10'
    },
    {
      title: 'Interview Readiness Engine',
      desc: 'A composite evaluation scoring your communication speed, code design patterns, and debugging capacity.',
      icon: UserCheck,
      color: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      title: 'Daily Coding Arenas',
      desc: 'Live contests and sponsored weekly algorithmic puzzles to test your speed against global developers.',
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10'
    }
  ];

  const journeySteps = [
    { title: 'Skill Assessment', desc: 'Take a quick initial coding puzzle to benchmark your current rating.' },
    { title: 'Personalized Roadmap', desc: 'Our AI engine maps out dependencies to target target companies.' },
    { title: 'Problem Practice', desc: 'Interact with Monaco editor modules with contextual coach feedbacks.' },
    { title: 'AI Code Analysis', desc: 'Receive immediate checks on space/time complexities and edge cases.' },
    { title: 'Mock Interviews', desc: 'Run face-to-face vocal or textual system mockups with specific grading.' },
    { title: 'Certifications', desc: 'Secure blockchain-verified micro-credentials for resume profiles.' }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 bg-grid-pattern border-b border-slate-900/60 max-w-7xl mx-auto">
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <Badge variant="primary" className="px-3 py-1 font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Premium Developer Growth OS
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
            Beyond Coding Practice. <br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Build Interview Readiness.</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
            An AI-powered platform that tracks your coding journey, identifies weaknesses, creates personalized learning roadmaps, conducts mock interviews, and gets you interview-ready.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link href="/dashboard">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto font-bold tracking-wide">
                Start Practicing
              </Button>
            </Link>
            <Link href="/interview">
              <Button size="lg" variant="secondary" icon={Briefcase} className="w-full sm:w-auto font-bold tracking-wide">
                Take Mock Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl filter blur-3xl" />
          <Card className="relative p-0 overflow-hidden border-slate-800 shadow-2xl bg-slate-900/90 glass-panel">
            {/* Mock Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-slate-500">solution.py — Monaco Editor</span>
              <div className="w-12" />
            </div>
            
            {/* Mock Editor Body */}
            <div className="p-5 font-mono text-xs text-slate-400 space-y-3 leading-relaxed">
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">1</span>
                <span><span className="text-indigo-400">def</span> <span className="text-emerald-400">findLongestPalindrome</span>(s: str) -&gt; str:</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">2</span>
                <span className="pl-4">n = len(s)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">3</span>
                <span className="pl-4"><span className="text-indigo-400">if</span> n &lt; 2: <span className="text-indigo-400">return</span> s</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-600 select-none">4</span>
                <span className="pl-4 text-emerald-500"># AI suggestions: optimal tabulation avoids O(N^2) space complexity</span>
              </div>
              <div className="flex gap-4 bg-indigo-500/5 py-1 -mx-5 px-5 border-l-2 border-indigo-500">
                <span className="text-indigo-500 select-none">5</span>
                <span className="pl-4 text-indigo-200">start, max_len = 0, 1</span>
              </div>
              
              {/* Overlay Interactive Mock components */}
              <div className="border-t border-slate-800/80 mt-6 pt-5 grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI readiness index</span>
                    <Badge variant="success">88%</Badge>
                  </div>
                  <Progress value={88} color="success" />
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">next target skill</p>
                    <p className="text-xs font-bold text-slate-200">Shortest Path Algorithms</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-slate-950 border-y border-slate-900 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURE SHOWCASE */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <Badge variant="primary" className="font-bold">FEATURES</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything You Need to Master Tech Loops</h2>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed">
            We combined core features of IDE compilers, skill dependency systems, and technical mock agents into one developer suite.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <Card key={index} hoverGlow className="flex flex-col gap-4 border-slate-800 bg-slate-900/40">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{feat.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. INTERACTIVE PRODUCT PREVIEW */}
      <section className="py-16 px-6 md:px-12 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Experience CodeArena AI</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { id: 'editor', label: 'Workspace' },
                { id: 'graph', label: 'Skill Graph' },
                { id: 'coach', label: 'AI Coach' },
                { id: 'interview', label: 'Mock Interview' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreview(tab.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                    ${activePreview === tab.id 
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Container */}
          <div className="w-full max-w-4xl mx-auto">
            <Card className="p-0 border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl relative min-h-[300px] flex flex-col justify-center">
              {activePreview === 'editor' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-200">Coding Workspace: Longest Substring</span>
                    <Badge variant="warning">Medium</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 space-y-2">
                      <p className="text-xs text-slate-300 font-bold">1. Description</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Given a string s, find the length of the longest substring without repeating characters.</p>
                      <p className="text-xs text-slate-500 font-mono mt-2">Example: s = &quot;abcabcbb&quot; -&gt; Output: 3</p>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 space-y-2 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Mentor Assistant
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-medium">Struggling? A sliding window index array using a hash set allows solving this in linear time O(N).</p>
                      </div>
                      <Link href="/practice/longest-palindromic-substring">
                        <Button size="sm" className="w-full mt-2 text-xs">Open Workspace</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'graph' && (
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-200">Developer Skill Dependency Tree</p>
                      <p className="text-[10px] text-slate-500">Visual pathways of your engineering milestones</p>
                    </div>
                    <Link href="/graph">
                      <Button size="sm" variant="outline" className="text-xs">Explore Full Graph</Button>
                    </Link>
                  </div>
                  <div className="flex justify-center items-center gap-4 py-8">
                    <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                      Arrays &amp; Hashing (92%)
                    </div>
                    <ChevronRight className="text-slate-700" />
                    <div className="px-3 py-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg ring-1 ring-indigo-500/20">
                      Sliding Window (65%)
                    </div>
                    <ChevronRight className="text-slate-700" />
                    <div className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold rounded-lg">
                      Dynamic Programming (28%)
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'coach' && (
                <div className="p-6 space-y-4">
                  <p className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-3">Weekly Progress report by Coach Agent</p>
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] shrink-0 font-bold">AI</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                        &quot;Alex, your recursion complexity models look excellent. However, your graph cyclic checks fail in 4 out of 10 cases. I recommend practicing DFS parent tracker rules before your Meta Sponsored contest.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreview === 'interview' && (
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <p className="text-xs font-bold text-slate-200">Mock Interview Room</p>
                    <Badge variant="success">Readiness: 88%</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 flex flex-col justify-between">
                      <p className="text-xs font-bold text-indigo-400">DSA/System Design Matcher</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Interviewer: &quot;How would you design a rate limiter that supports sliding window counters?&quot;</p>
                      <Link href="/interview">
                        <Button size="sm" className="w-full mt-3 text-xs">Enter Interview Room</Button>
                      </Link>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-300">Live Metric Tracker</p>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Technical Accuracy (90%)</span>
                        <Progress value={90} color="success" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Communication Skills (85%)</span>
                        <Progress value={85} color="primary" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* 5. LEARNING JOURNEY TIMELINE */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="primary" className="font-bold">THE ROADMAP</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">Your Path to Career Readiness</h2>
          <p className="text-slate-400 text-sm font-semibold">Our platform adapts to your performance dynamically, taking you step by step.</p>
        </div>
        <div className="relative border-l-2 border-slate-850 pl-6 space-y-12 ml-4">
          {journeySteps.map((step, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[35px] top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-950 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-200">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-semibold">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-16 px-6 md:px-12 bg-slate-950 border-t border-slate-900/60 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <Badge variant="primary" className="font-bold">TESTIMONIALS</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">Vouched by High-Growth Engineers</h2>
          <p className="text-slate-400 italic text-sm md:text-base leading-relaxed">
            &quot;CodeArena AI didn&apos;t just throw problems at me. It isolated my recursive DFS stack issues and generated perfect hints. I secured my software engineering offer at Meta within 3 weeks.&quot;
          </p>
          <div>
            <p className="text-xs font-bold text-slate-200">Aris Thorne</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Software Engineer at Meta</p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-indigo-600">
              <span className="font-bold text-xs text-white">CA</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-200">CodeArena AI</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">&copy; {new Date().getFullYear()} CodeArena AI. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link) => (
              <a key={link} href="#" className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors font-medium">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
