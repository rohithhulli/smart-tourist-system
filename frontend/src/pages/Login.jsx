import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // RequireAuth remembers which protected page the user wanted; send them
  // back there after signing in instead of always going home.
  const from = location.state?.from || '/';
  const { currentUser, login, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const result = await login(email, password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-ink-950 min-h-full">
      <div className="w-full max-w-md bg-ink-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-safari-500 via-sunset-500 to-safari-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-safari-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-sunset-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-safari-500 to-safari-700 flex items-center justify-center text-white shadow-lg shadow-safari-900/40 mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-cream/55 mt-2">Sign in to keep exploring Karnataka</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {error && (
            <div className="bg-clay-500/10 border border-clay-500/50 text-sunset-300 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cream/70 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-safari-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-safari-500/30 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cream/70 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-safari-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-safari-500/30 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 bg-safari-600 hover:bg-safari-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-safari-900/30 transition-all active:scale-[0.98]"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {authLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative z-10 mt-6 text-center">
          <p className="text-sm text-cream/55">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-safari-300 font-bold hover:text-safari-200 transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
