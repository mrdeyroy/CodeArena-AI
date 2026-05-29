'use client';

import * as React from 'react';
import { Settings, User, Bell, Shield, Sliders, CheckSquare, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/user-store';

export default function SettingsPage() {
  const { user, updateUser } = useUserStore();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'notifications' | 'ai'>('profile');

  // Form states
  const [name, setName] = React.useState(user.name);
  const [college, setCollege] = React.useState(user.college);
  const [location, setLocation] = React.useState(user.location);
  const [bio, setBio] = React.useState(user.bio);
  
  // AI coach strictness state
  const [coachStrictness, setCoachStrictness] = React.useState('standard');
  const [enableVoice, setEnableVoice] = React.useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, college, location, bio });
    alert('Profile configurations updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Platform Settings
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Configure your personal preferences, AI Coach strictness index, and profile metadata.</p>
        </div>
      </div>

      {/* Grid: Navigation Sidebar + Tab Panels */}
      <div className="grid md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0">
          {[
            { id: 'profile', label: 'Profile Details', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'ai', label: 'AI Preferences', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-650/10' 
                    : 'bg-slate-900/40 border border-slate-850 text-slate-400 hover:text-slate-200'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <Card className="md:col-span-3 bg-slate-900/60 border-slate-800 p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Update Profile Details</h2>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="University / Organization"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Bio Statement</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 h-24 resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end">
                <Button type="submit" size="sm">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Alert Preferences</h2>
              <div className="space-y-3.5">
                {[
                  { title: 'Contest reminders', desc: 'Alert me 30 minutes before registered Arenas start.' },
                  { title: 'Weekly AI Coach check-ups', desc: 'Receive summaries of identified code syntax weaknesses.' },
                  { title: 'Community comment notifications', desc: 'Alert when other developers review my shared designs.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                    <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-250 leading-none">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> AI Coach Preferences
                </h2>
                <p className="text-[10px] text-slate-500">Configure how conversational agents review and prompt during coding tasks.</p>
              </div>

              <div className="space-y-4 pt-2">
                
                {/* Strictness Level */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mentorship Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'lax', label: 'Lax (Detailed replies)' },
                      { id: 'standard', label: 'Standard (Hints)' },
                      { id: 'strict', label: 'Strict (Silent review)' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setCoachStrictness(mode.id)}
                        className={`px-3 py-2 text-[10px] font-semibold border rounded-lg text-center cursor-pointer transition-colors
                          ${coachStrictness === mode.id 
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'}`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice toggle */}
                <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-250">Vocal Transcription feedback</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Enable microphone speech-to-text elements within mock interview modules.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="accent-indigo-505 w-4 h-4 cursor-pointer"
                  />
                </div>

              </div>
            </div>
          )}
        </Card>

      </div>

    </div>
  );
}
