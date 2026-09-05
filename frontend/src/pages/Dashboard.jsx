import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Route, Star, Bookmark, Loader2, ArrowRight, Compass } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tripsCount } = useAuth();
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/meta/stats`, { timeout: 6000 });
        if (!cancelled) setMeta(res.data?.data || null);
      } catch {
        if (!cancelled) setMeta(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      label: 'Verified Places',
      value: meta ? `${meta.total_places}+` : null,
      desc: 'Curated attractions in Karnataka',
      icon: MapPin,
      color: 'text-safari-300 bg-safari-500/10 border-safari-500/20',
    },
    {
      label: 'Regional Cities',
      value: meta ? String(meta.total_cities) : null,
      desc: 'Heritage, hills & coasts',
      icon: Route,
      color: 'text-sunset-300 bg-sunset-500/10 border-sunset-500/20',
    },
    {
      label: 'Your Saved Trips',
      value: `${tripsCount}`,
      desc: 'Active travel plans',
      icon: Bookmark,
      color: 'text-clay-400 bg-clay-500/10 border-clay-500/20',
    },
    {
      label: 'Avg Traveller Rating',
      value: meta?.avg_rating ? `${meta.avg_rating} ★` : null,
      desc: 'High satisfaction standard',
      icon: Star,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <PageHeader
        eyebrow="Platform Overview"
        title="ExploreIndiaAI Dashboard"
        subtitle="Live intelligence and platform analytics across the tourist database."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan New Journey</span>
        </button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between space-y-4 hover:border-safari-400/30 transition-all shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cream/50 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  {stat.value ?? (meta === null ? <Loader2 className="w-5 h-5 animate-spin inline text-cream/40" /> : '—')}
                </p>
                <p className="text-xs text-cream/50 mt-1">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launchpad */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400">Quick Travel Launchpad</p>
            <h2 className="font-display text-xl font-semibold text-white mt-1">Jump Into Exploration</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/plan-trip')}
            className="p-5 rounded-2xl border border-white/10 hover:border-safari-400/40 bg-ink-900/60 text-left transition-all group"
          >
            <Route className="w-6 h-6 text-safari-400 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="font-display font-semibold text-base text-white">AI Trip Planner</h3>
            <p className="text-xs text-cream/60 mt-1">Design day-by-day itineraries tailored to your style</p>
          </button>

          <button
            onClick={() => navigate('/nearby')}
            className="p-5 rounded-2xl border border-white/10 hover:border-safari-400/40 bg-ink-900/60 text-left transition-all group"
          >
            <MapPin className="w-6 h-6 text-sunset-400 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="font-display font-semibold text-base text-white">Nearby Discovery</h3>
            <p className="text-xs text-cream/60 mt-1">Uncover attractions within 30 km with live GPS</p>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="p-5 rounded-2xl border border-white/10 hover:border-safari-400/40 bg-ink-900/60 text-left transition-all group"
          >
            <Compass className="w-6 h-6 text-clay-400 group-hover:scale-110 transition-transform mb-2" />
            <h3 className="font-display font-semibold text-base text-white">Interactive Map</h3>
            <p className="text-xs text-cream/60 mt-1">Browse hotels, restaurants, ATMs and route waypoints</p>
          </button>
        </div>
      </div>
    </div>
  );
}
