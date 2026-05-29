'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { AIPanel } from '@/components/layout/ai-panel';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { sidebarOpen } = useUIStore();
  const { login, logout, updateUser, fetchProblemsList, fetchAnalytics } = useUserStore();
  
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const hasLoaded = React.useRef(false);

  // Sync Supabase authentication state on mount and changes
  React.useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSignedIn(true);
        setUser(session.user);
      } else {
        setIsSignedIn(false);
        setUser(null);
      }
      setIsLoaded(true);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsSignedIn(true);
        setUser(session.user);
      } else {
        setIsSignedIn(false);
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync Supabase user metadata with Zustand store
  React.useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        login(); // set isLoggedIn = true in Zustand
        updateUser({
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "CodeArena User",
          email: user.email || "",
          avatar: user.user_metadata?.avatar_url || "",
        });
      } else {
        logout(); // set isLoggedIn = false in Zustand
      }
    }
  }, [isLoaded, isSignedIn, user, login, logout, updateUser]);

  // Route protection based on Supabase loaded state
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
