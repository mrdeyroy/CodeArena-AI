'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { AIPanel } from '@/components/layout/ai-panel';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { sidebarOpen } = useUIStore();
  const { isLoggedIn, fetchProblemsList, fetchAnalytics } = useUserStore();
  const hasLoaded = React.useRef(false);

  // Route protection and backend data fetching
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (!hasLoaded.current) {
      hasLoaded.current = true;
      fetchProblemsList();
      fetchAnalytics();
    }
  }, [isLoggedIn, router, fetchProblemsList, fetchAnalytics]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Side bar */}
      <Sidebar />

      {/* Main Container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 pb-16 md:pb-0
          ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950 bg-dot-pattern">
          {children}
        </main>
      </div>

      {/* Right AI Drawer Panel */}
      <AIPanel />

      {/* Mobile Bottom Navigation bar */}
      <MobileNav />
    </div>
  );
}
