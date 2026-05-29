'use client';

import * as React from 'react';
import { Trophy, Clock, Users, Gift, HelpCircle, AlertCircle, PlayCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockContests } from '@/lib/mock-data';

export default function ContestsPage() {
  const [activeTab, setActiveTab] = React.useState<'live' | 'upcoming' | 'ended'>('live');

  const filteredContests = mockContests.filter((c) => {
    if (activeTab === 'live') return c.status === 'Live';
    if (activeTab === 'upcoming') return c.status === 'Upcoming';
    return c.status === 'Ended';
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      default: return 'danger';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" /> Contest Arena
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Test your speed, syntax accuracy, and algorithm design against developers worldwide.</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800/80 gap-6 overflow-x-auto">
        {[
          { id: 'live', label: 'Live Arenas' },
          { id: 'upcoming', label: 'Upcoming Matches' },
          { id: 'ended', label: 'Past Challenges' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap
              ${activeTab === tab.id 
                ? 'border-indigo-500 text-slate-105 font-bold' 
                : 'border-transparent text-slate-450 hover:text-slate-205'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Contest cards */}
      <div className="grid md:grid-cols-2 gap-6 pt-2">
        {filteredContests.map((cont) => (
          <Card key={cont.id} className="bg-slate-900/60 border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{cont.type}</span>
                  <h3 className="text-sm font-bold text-slate-200">{cont.title}</h3>
                </div>
                <Badge variant={getDifficultyColor(cont.difficulty)}>{cont.difficulty}</Badge>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{cont.description}</p>

              {/* Details line */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-850 py-3.5 text-xs text-slate-400 font-semibold">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Duration</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {cont.duration}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Participants</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" /> {cont.participants}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Prize Pool</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0 truncate" title={cont.prizePool}>
                    <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {cont.prizePool}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 flex justify-between items-center mt-3">
              {cont.sponsor && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                  <span>Sponsored by:</span>
                  <span className="text-indigo-400 font-bold">{cont.sponsor}</span>
                </div>
              )}
              {!cont.sponsor && <div />}
              
              <Button size="sm" variant={cont.status === 'Live' ? 'primary' : cont.status === 'Upcoming' ? 'secondary' : 'outline'}>
                {cont.status === 'Live' ? 'Enter Arena' : cont.status === 'Upcoming' ? 'Register Now' : 'Review Editorial'}
              </Button>
            </div>
          </Card>
        ))}

        {filteredContests.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-slate-900/20 border border-slate-850 rounded-xl space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No active contests in this tab.</p>
          </div>
        )}
      </div>

    </div>
  );
}
