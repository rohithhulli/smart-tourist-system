import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Compass, User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { currentUser, signup, authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [justSignedUp, setJustSignedUp] = useState(false);

  // A user who is already logged in has no business on the signup page.
  if (currentUser && !justSignedUp) {
    return <Navigate to="/" replace />;
  }

  const validateEmail = (value) => {
    return String(value).toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await signup(fullName, email, password);
    if (result.ok) {
      setJustSignedUp(true);
      setSuccess('Account created successfully! Taking you to explore...');
      setTimeout(() => navigate('/'), 1200);
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-ink-950 min-h-full">
      <div className="w-full max-w-md bg-ink-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-safari-500 via-sunset-500 to-safari-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sunset-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-safari-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-safari-500 to-safari-700 flex items-center justify-center text-white shadow-lg shadow-safari-900/40 mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight">
            Create your account
          </h2>
          <p className="text-sm text-cream/55 mt-2">Start planning your next journey</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {error && (
            <div className="bg-clay-500/10 border border-clay-500/50 text-sunset-300 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-safari-500/10 border border-safari-500/50 text-safari-300 text-sm p-3 rounded-xl text-center">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cream/70 ml-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-safari-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-safari-500/30 transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cream/70 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-cream placeholder-cream/35 focus:outline-none focus:border-safari-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-safari-500/30 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 bg-safari-600 hover:bg-safari-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-safari-900/30 transition-all active:scale-[0.98] mt-2"
          >
            {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {authLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative z-10 mt-6 text-center">
          <p className="text-sm text-cream/55">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-safari-300 font-bold hover:text-safari-200 transition-colors"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}