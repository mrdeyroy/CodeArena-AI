'use client';

import * as React from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUserStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Marketing Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 h-16 flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
            <span className="font-black text-sm text-white">CA</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-100">
            CodeArena <span className="text-xs text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 ml-1">AI</span>
          </span>
        </Link>

        {/* Action Links */}
        <nav className="flex items-center gap-6">
          <Link href="/practice" className="hidden sm:inline text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors">
            Practice
          </Link>
          <Link href="/contests" className="hidden sm:inline text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors">
            Contests
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" icon={Sparkles}>Go to Dashboard</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors">
                Log In
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">Get Started</Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Marketing Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
