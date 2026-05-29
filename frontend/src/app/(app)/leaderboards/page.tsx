'use client';

import * as React from 'react';
import { ShieldCheck, Search, Globe, Trophy, Users, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockLeaderboards } from '@/lib/mock-data';

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = React.useState<'global' | 'country' | 'college' | 'friends'>('global');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredEntries = mockLeaderboards.filter((entry) => {
    return entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           entry.user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Platform Leaderboards
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Rankings calculated daily based on algorithmic rating and consistent solve velocities.</p>
        </div>
      </div>

      {/* Control row: Tabs + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex border-b border-slate-800/80 gap-6 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'global', label: 'Global', icon: Globe },
            { id: 'country', label: 'Country', icon: Trophy },
            { id: 'college', label: 'College', icon: GraduationCap },
            { id: 'friends', label: 'Friends', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'border-indigo-500 text-slate-100 font-bold' 
                    : 'border-transparent text-slate-450 hover:text-slate-205'
                  }`}
              >
                <Icon className="w-4 h-4 text-indigo-400/80" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="p-0 border-slate-850 bg-slate-900/40 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-5 text-center w-16">Rank</th>
                <th className="py-3 px-4">Developer</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-center">Solved</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-center">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 leading-relaxed font-semibold">
              {filteredEntries.map((entry) => (
                <tr key={entry.user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-5 text-center font-bold text-slate-200">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : `#${entry.rank}`}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={entry.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"} alt={entry.user.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-slate-200">{entry.user.name}</p>
                      <p className="text-[10px] text-slate-550 font-semibold truncate max-w-[150px]">
                        @{entry.user.username} · {entry.user.college}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-indigo-400">{entry.rating}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{entry.problemsSolved}</td>
                  <td className="py-3 px-4 text-center text-rose-400">🔥 {entry.streak}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="primary">{entry.interviewReadiness}%</Badge>
                  </td>
                </tr>
              ))}
              
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No developers match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
