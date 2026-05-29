'use client';

import * as React from 'react';
import { UserCircle, Target, Trophy, Flame, Award, ShieldCheck, Mail, MapPin, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/store/user-store';
import { mockAchievements, mockAnalyticsData } from '@/lib/mock-data';

export default function ProfilePage() {
  const { user } = useUserStore();

  // Simple calendar grid simulation for contribution heatmap
  const daysInYear = 365;
  const contributionGrid = Array.from({ length: 53 * 7 }).map((_, idx) => {
    const isMockActive = idx % 5 === 0 || idx % 8 === 0;
    const activityLevel = isMockActive ? (idx % 3 === 0 ? 'bg-indigo-500/80' : 'bg-indigo-650/40') : 'bg-slate-900 border border-slate-950/20';
    return activityLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* 1. HEADER PROFILE CARD */}
      <Card className="bg-slate-900/60 border-slate-800 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/5 rounded-full filter blur-3xl" />
        
        {/* Info */}
        <div className="flex flex-col md:flex-row items-center gap-5 z-10 text-center md:text-left">
          <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20" />
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-100">{user.name}</h1>
            <p className="text-xs font-semibold text-slate-400">@{user.username}</p>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold max-w-md">{user.bio}</p>
            
            {/* Meta details list */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500 font-semibold pt-1">
              <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {user.college}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location}</span>
            </div>
          </div>
        </div>

        {/* Social connections */}
        <div className="flex gap-2.5 shrink-0 z-10 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-slate-805 pt-4 md:pt-0">
          <a href="#" className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
          </a>
          <a href="#" className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          <a href="#" className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
        </div>
      </Card>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Algorithmic Rating', value: user.rating, icon: Trophy, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Tasks Completed', value: user.problemsSolved, icon: Target, color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Weekly Active Streak', value: `${user.streak} Days`, icon: Flame, color: 'text-rose-455 bg-rose-500/10' },
          { label: 'Readiness Index', value: `${user.interviewReadiness}%`, icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 bg-slate-900/40 border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <p className="text-lg font-extrabold text-slate-100 mt-1">{kpi.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. ACTIVITY HEATMAP */}
      <Card className="bg-slate-900/60 border-slate-800 p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Practice Consistency Calendar</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Simulated contribution map recording compilation rates</p>
        </div>

        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 min-w-[620px] p-1.5 bg-slate-950/60 border border-slate-850 rounded-xl w-fit">
            <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
              {contributionGrid.map((bg, index) => (
                <div key={index} className={`w-2.5 h-2.5 rounded-sm shrink-0 ${bg}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
          <span>1 Year Timeline</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-650/40" />
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80" />
            <span>More</span>
          </div>
        </div>
      </Card>

      {/* 4. ACHIEVEMENTS & BADGES VAULT */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Achievements Vault</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Badges unlocked by completing system challenges</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAchievements.map((ach) => (
            <Card key={ach.id} className={`p-4 bg-slate-900/60 border-slate-850 flex items-center gap-4 transition-all
              ${ach.isUnlocked ? 'border-indigo-550/20' : 'opacity-60'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${ach.isUnlocked ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-950 text-slate-600'}`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-250 truncate">{ach.title}</h4>
                  <Badge variant={ach.isUnlocked ? 'success' : 'outline'} className="text-[8px] px-1 py-0 scale-90">
                    {ach.isUnlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">{ach.description}</p>
                {ach.isUnlocked && ach.unlockedAt && (
                  <span className="text-[9px] text-slate-600 block">Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
