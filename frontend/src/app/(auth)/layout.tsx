import * as React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          {children}
        </div>
      </div>

      {/* Decorative Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 border-l border-slate-800 p-12 bg-dot-pattern">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
            <span className="font-black text-sm text-white">CA</span>
          </div>
          <span className="font-extrabold text-base tracking-tight">CodeArena AI</span>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold leading-snug tracking-tight">
            Accelerate your software engineering growth pathway.
          </h2>
          <p className="text-slate-450 text-sm leading-relaxed font-semibold">
            Join thousands of developers using our AI-driven compiler diagnostics, personal coaching sessions, and verified skill map certifications.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          Premium Developer Growth Operating System
        </div>
      </div>
    </div>
  );
}
