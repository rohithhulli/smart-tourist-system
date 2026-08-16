import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, Route, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 md:p-12 space-y-6">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Travel Assistant
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl">
          Explore Karnataka's Wonders with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Smart AI Guidance</span>
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
          Discover live GPS nearby attractions, heritage temples, misty hill stations, and build multi-stop customized travel itineraries in seconds.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button  
            onClick={() => navigate('/nearby')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Explore Nearby Places
          </button>
          
          <button
            onClick={() => navigate('/plan-trip')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Route className="w-4 h-4 text-indigo-400" /> Plan a Trip Now
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/nearby')}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 cursor-pointer hover:border-indigo-500/40 hover:scale-[1.02] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
            GPS Live Location
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Auto-detect your location to find nearby temples, resorts, pure-veg dining spots, timings, and history popups.
          </p>
          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Try Nearby Explorer <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div 
          onClick={() => navigate('/plan-trip')}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 cursor-pointer hover:border-indigo-500/40 hover:scale-[1.02] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Route className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
            Multi-Stop Itinerary Planner
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Input multiple destinations, set your budget slider, travel dates, and get day-by-day AI optimized routes.
          </p>
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Start Planning <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div 
          onClick={() => navigate('/map')}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 cursor-pointer hover:border-indigo-500/40 hover:scale-[1.02] transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
            Interactive Leaflet Maps
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Visualize your entire tour circuit with interactive OpenStreetMap markers, distance paths, and waypoints.
          </p>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Map View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
