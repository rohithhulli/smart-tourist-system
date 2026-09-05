import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Bookmark, Route, LogOut,
  Pencil, X, Check, Loader2, AlertTriangle, Sparkles,
  Heart, Compass, Shield,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const TRAVEL_PREFERENCES_PRESETS = [
  'Heritage & Palaces', 'Nature & Waterfalls', 'Temple Architecture',
  'Wildlife Safaris', 'Coastal Escapes', 'Authentic Food',
];

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout, handleSessionExpired } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
  });

  const getDisplayUser = () => ({
    ...(currentUser || {}),
    ...(profile || {}),
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
          timeout: 6000,
        });
        const user = res.data?.user;
        setProfile(user);
        setForm({
          name: user?.name || currentUser?.name || '',
          email: user?.email || currentUser?.email || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (err.response?.status === 401) {
          handleSessionExpired();
          return;
        }
        if (currentUser) {
          setForm({
            name: currentUser.name || '',
            email: currentUser.email || '',
          });
        }
        setError('Could not load full profile from backend.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, handleSessionExpired]);

  const handleSave = async () => {
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError('Name cannot be empty.');
      return;
    }
    if (!email) {
      setError('Email cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/me`,
        { name, email },
        { withCredentials: true, timeout: 6000 }
      );

      const user = res.data?.user;
      setProfile(user);
      setForm({
        name: user?.name || name,
        email: user?.email || email,
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      if (err.response?.status === 401) {
        handleSessionExpired();
        return;
      }
      setError(err.response?.data?.detail || 'Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const user = getDisplayUser();
  const initials = (user.name || user.email || 'Traveller')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header (Phase 2H Requirement) */}
      <PageHeader
        eyebrow="Account Settings"
        title="Traveller Profile"
        subtitle="Manage your personal travel identity, synced itineraries and preferences."
      >
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </PageHeader>

      {error && (
        <div className="p-4 rounded-2xl bg-sunset-500/10 border border-sunset-500/20 text-xs text-sunset-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-2xl bg-safari-500/20 border border-safari-500/40 text-safari-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading your traveller profile..." />
      ) : (
        <div className="space-y-6">
          {/* User Card Banner */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-safari-500 to-safari-700 flex items-center justify-center text-white font-display font-bold text-2xl shadow-xl shadow-safari-900/50 border border-white/20">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-2xl text-white">
                    {user.name || 'Explorer'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-safari-500/15 border border-safari-500/30 text-[10px] font-bold text-safari-300 uppercase tracking-wider">
                    Member
                  </span>
                </div>
                <p className="text-xs text-cream/60 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-safari-400" />
                  <span>{user.email || '—'}</span>
                </p>
                {user.created_at && (
                  <p className="text-[11px] text-cream/40 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-safari-400" />
                    <span>Member since {formatDate(user.created_at)}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-cream text-xs font-semibold transition-all shrink-0"
            >
              {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5 text-safari-400" />}
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-safari-400 text-xs font-semibold">
                <Bookmark className="w-4 h-4" /> Saved Trips
              </div>
              <p className="font-display text-2xl font-semibold text-white mt-1">
                {user.trips_count ?? '—'}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <Heart className="w-4 h-4" /> Bookmarks
              </div>
              <p className="font-display text-2xl font-semibold text-white mt-1">
                {user.favorites_count ?? '—'}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-3xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-sunset-400 text-xs font-semibold">
                <Shield className="w-4 h-4" /> Account Status
              </div>
              <p className="font-display text-2xl font-semibold text-safari-300 mt-1">
                Verified
              </p>
            </div>
          </div>

          {/* Edit Form or View Information (Phase 2H) */}
          {editing ? (
            <div className="rounded-3xl border border-safari-500/40 bg-white/[0.02] p-6 sm:p-8 space-y-6 animate-fade-in">
              <h3 className="font-display text-lg font-semibold text-white">Update Profile Details</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-900 border border-white/10 text-white focus:border-safari-400 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-900 border border-white/10 text-white focus:border-safari-400 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-cream text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-lg shadow-safari-900/40"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            /* Travel Preferences (Phase 2H Requirement: Travel preferences if available) */
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-display text-lg font-semibold text-white">Travel Preferences</h3>
              </div>
              <p className="text-xs text-cream/60">
                These interests tailor your recommendations across Karnataka:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {TRAVEL_PREFERENCES_PRESETS.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-cream/80 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
