import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Route, Star, Bookmark, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/SmartImage';

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
      label: 'Tourist Places',
      value: meta ? String(meta.total_places) : null,
      icon: MapPin,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Cities Covered',
      value: meta ? String(meta.total_cities) : null,
      icon: Route,
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Saved Itineraries',
      value: `${tripsCount} Saved`,
      icon: Bookmark,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Avg Tourist Rating',
      value: meta?.avg_rating ? `${meta.avg_rating} ★` : null,
      icon: Star,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" /> System Analytics & Overview
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Tourist System Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Live statistics from the actual place database across Karnataka.</p>
        </div>
        <button
          onClick={() => navigate('/plan-trip')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Route className="w-4 h-4" /> Plan New Trip
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
                <p className="text-xl font-black text-white mt-1">
                  {stat.value ?? (meta === null ? <Loader2 className="w-4 h-4 animate-spin inline text-slate-500" /> : '—')}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Tourist Circuits */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Route className="w-4 h-4 text-indigo-400" /> Featured Tourist Circuits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Dakshina Kannada Pilgrimage",
              spots: "Dharmasthala, Subrahmanya, Mangaluru",
              img: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80"
            },
            {
              title: "Chikkamagaluru Western Ghats",
              spots: "Horanadu, Kudremukh, Mullayanagiri",
              img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            },
            {
              title: "Coastal Karnataka & Temple Trail",
              spots: "Udupi, Murudeshwara, Gokarna",
              img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
            }
          ].map((circuit, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden group">
              <div className="h-32 bg-slate-800 overflow-hidden">
                <SmartImage src={circuit.img} alt={circuit.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white line-clamp-1">{circuit.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{circuit.spots}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
