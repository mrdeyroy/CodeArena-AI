'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { AIPanel } from '@/components/layout/ai-panel';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { sidebarOpen } = useUIStore();
  const { login, logout, updateUser, fetchProblemsList, fetchAnalytics } = useUserStore();
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const hasLoaded = React.useRef(false);

  // Sync Clerk authentication state with Zustand store
  React.useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        login(); // set isLoggedIn = true in Zustand
        updateUser({
          name: clerkUser.fullName || clerkUser.username || "CodeArena User",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          avatar: clerkUser.imageUrl || "",
        });
      } else {
        logout(); // set isLoggedIn = false in Zustand
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, login, logout, updateUser]);

  // Route protection based on Clerk loaded state
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    } else if (isLoaded && isSignedIn && !hasLoaded.current) {
      hasLoaded.current = true;
      fetchProblemsList();
      fetchAnalytics();
    }
  }, [isLoaded, isSignedIn, router, fetchProblemsList, fetchAnalytics]);

  if (!isLoaded || !isSignedIn) {
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
