'use client';

import * as React from 'react';
import { Search, Bell, Sparkles, LogOut, Settings, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { mockNotifications } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();
  const { 
    toggleAIPanel, 
    searchOpen, 
    setSearchOpen, 
    notificationsOpen, 
    setNotificationsOpen,
    theme,
    toggleTheme 
  } = useUIStore();
  const { user, logout } = useUserStore();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unreadNotifications, setUnreadNotifications] = React.useState(
    mockNotifications.filter(n => !n.isRead)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/practice?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllRead = () => {
    setUnreadNotifications([]);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        
        {/* Left Side: Search Trigger */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 text-sm transition-all duration-200 cursor-pointer"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="flex-1 text-left">Search problems, topics, contests...</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[10px] font-bold text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* AI Quick Access */}
          <button
            onClick={toggleAIPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/15 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
            title="Quick AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300">Notifications</h4>
                  {unreadNotifications.length > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-slate-800/40 border-b border-slate-800 last:border-0 transition-colors cursor-pointer
                        ${!notif.isRead && unreadNotifications.some(u => u.id === notif.id) ? 'bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="text-xs font-bold text-slate-200">{notif.title}</h5>
                        <span className="text-[9px] text-slate-500 font-medium shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                  {mockNotifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-800"
              />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { setProfileDropdownOpen(false); router.push('/profile'); }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Your Profile
                </button>
                <button
                  onClick={() => { setProfileDropdownOpen(false); router.push('/settings'); }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                <button
                  onClick={() => { setProfileDropdownOpen(false); logout(); router.push('/'); }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border-t border-slate-800 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Global Command Search Modal */}
      <Modal isOpen={searchOpen} onClose={() => setSearchOpen(false)} title="Quick Command Search">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems, topics (e.g. dynamic programming)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Searches</h4>
            <div className="flex flex-wrap gap-2">
              {['Two Sum', 'Arrays', 'Dynamic Programming', 'Google Questions', 'Weekly Arena'].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                  }}
                  className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
