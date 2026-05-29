'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Terminal, 
  Network, 
  Sparkles, 
  Briefcase, 
  Trophy, 
  BarChart3, 
  Award, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useUserStore();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice', href: '/practice', icon: Terminal },
    { name: 'Skill Graph', href: '/graph', icon: Network },
    { name: 'AI Coach', href: '/coach', icon: Sparkles, highlight: true },
    { name: 'Mock Interview', href: '/interview', icon: Briefcase },
    { name: 'Contests', href: '/contests', icon: Trophy },
    { name: 'Leaderboards', href: '/leaderboards', icon: ShieldCheck },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Certifications', href: '/certifications', icon: Award },
    { name: 'Community', href: '/community', icon: Users },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 hidden md:flex flex-col bg-slate-900 border-r border-slate-800/80 transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
            <span className="font-black text-sm text-white">CA</span>
          </div>
          {sidebarOpen && (
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">
              CodeArena <span className="text-xs text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 ml-1">AI</span>
            </span>
          )}
        </Link>
        
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-slate-800/60 rounded-md text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group border cursor-pointer
                ${isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                  : item.highlight 
                    ? 'bg-transparent border-transparent text-indigo-400 hover:bg-indigo-500/5 hover:text-indigo-300 hover:border-indigo-500/10' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 hover:border-slate-800/50'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 
                ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} 
              />
              {sidebarOpen && (
                <span className="flex-1 tracking-wide">{item.name}</span>
              )}
              {sidebarOpen && item.highlight && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  Coach
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80">
        <Link 
          href="/profile" 
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/20"
          />
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate">@{user.username}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
