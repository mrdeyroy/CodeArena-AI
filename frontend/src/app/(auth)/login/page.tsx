'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[80vh] py-6 px-4">
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800/80 shadow-xl glow" glow>
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 mb-3">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Access your CodeArena AI personal Growth OS
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-450 text-xs font-semibold text-center leading-relaxed">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            variant="primary"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400 font-semibold">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-indigo-450 hover:text-indigo-400 transition-colors font-bold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
