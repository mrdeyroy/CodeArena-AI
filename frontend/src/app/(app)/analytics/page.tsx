'use client';

import * as React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Target, Sparkles, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockAnalyticsData } from '@/lib/mock-data';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Deep Learning Analytics
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Continuous evaluation models tracking compiler accuracies, rating timelines, and study schedules.</p>
        </div>
      </div>

      {/* Analytics grid row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Rating timeline */}
        <Card className="bg-slate-900/60 border-slate-850 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-indigo-400" /> Rating Growth Timeline</h3>
            <Badge variant="primary">Updated live</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalyticsData.ratingTrend}>
                <defs>
                  <linearGradient id="colorRatingAna" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
                <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRatingAna)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Accuracy Trend */}
        <Card className="bg-slate-900/60 border-slate-850 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Compiler Accuracy Trend</h3>
            <Badge variant="success">88% Peak</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAnalyticsData.accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Analytics grid row 2 */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Topic Mastery Spider */}
        <Card className="bg-slate-900/60 border-slate-850 p-5 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5"><Target className="w-4 h-4 text-indigo-400" /> Syllabus Topic mastery comparison</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Radar distribution</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockAnalyticsData.topicMastery}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="topic" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Current Mastery" dataKey="mastery" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Study consistency hours */}
        <Card className="bg-slate-900/60 border-slate-850 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">Study Consistency (Hours)</h3>
            <span className="text-[10px] text-slate-500 font-bold">Weekly practice scale</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnalyticsData.learningConsistency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </div>
  );
}
