import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Bookmark, Route, LogOut, Pencil, X, Check, Loader2, AlertTriangle, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout, handleSessionExpired } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true, timeout: 6000 });
        const user = res.data?.user;
        setProfile(user);
        setForm({ name: user?.name || '', email: user?.email || '' });
      } catch (err) {
        if (err.response?.status === 401) handleSessionExpired();
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/me`,
        { name: form.name.trim(), email: form.email.trim() },
        { withCredentials: true, timeout: 6000 }
      );
      const user = res.data?.user;
      setProfile(user);
      setForm({ name: user?.name || '', email: user?.email || '' });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError(err.response?.data?.detail || 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const display = profile || {};

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/30 shrink-0">
          {(display.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" /> Account Profile
          </div>
          <h1 className="text-2xl font-black text-white mt-1 truncate">{display.name || 'User'}</h1>
          <p className="text-xs text-slate-400 truncate">{display.email || ''}</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-2 text-sm text-emerald-300">
          <Check className="w-4 h-4" /> Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-start gap-2 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-300">Loading your profile...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/my-trips')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-indigo-500/50 transition-all group"
            >
              <Route className="w-5 h-5 text-emerald-400" />
              <p className="text-3xl font-black text-white mt-2">{display.trips_count ?? 0}</p>
              <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Saved Trips</p>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-indigo-500/50 transition-all group"
            >
              <Bookmark className="w-5 h-5 text-indigo-400" />
              <p className="text-3xl font-black text-white mt-2">{display.favorites_count ?? 0}</p>
              <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Favorite Places</p>
            </button>
          </div>

          {/* Account details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Account Details
              </h2>
              <button
                onClick={() => { setEditing((e) => !e); setError(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">{display.email || '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">Member since {formatDate(display.created_at)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-bold rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>

          <p className="text-[10px] text-slate-600 text-center">
            {currentUser ? `Signed in as ${currentUser.email}` : ''}
          </p>
        </>
      )}
    </div>
  );
}
