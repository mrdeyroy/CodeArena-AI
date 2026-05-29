'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Terminal, Trophy, Sparkles, UserCircle } from 'lucide-react';

export const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice', href: '/practice', icon: Terminal },
    { name: 'Contests', href: '/contests', icon: Trophy },
    { name: 'AI Coach', href: '/coach', icon: Sparkles, highlight: true },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around h-16 px-2 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer
              ${isActive 
                ? 'text-indigo-400 font-semibold' 
                : item.highlight
                  ? 'text-indigo-500 hover:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
            <span className="text-[9px] font-semibold tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
