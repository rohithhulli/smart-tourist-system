import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Bookmark, Search, Sparkles, LogOut, MapPin, Loader2, X, Menu } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { normalizePlace, formatDistance } from '../utils/places';
import SmartImage from './SmartImage';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, tripsCount, logout } = useAuth();
  const { openPlaceOnMap } = useTrip();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const debounceRef = useRef(null);

  const activePath = location.pathname;

  useEffect(() => {
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/places/search`, {
          params: { q, limit: 6 },
          timeout: 5000,
        });
        setResults(res.data?.data || []);
        setSearchOpen(true);
      } catch (err) {
        setResults([]);
        setSearchOpen(false);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleResultClick = (place) => {
    setSearchOpen(false);
    setQuery('');
    openPlaceOnMap(place);
  };

  const go = (path) => navigate(path);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section: Brand Logo & My Trips Quick Access */}
      <div className="flex items-center gap-6">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div
          onClick={() => go(currentUser ? '/' : '/login')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-lg text-white tracking-tight">
              <span>SmartTourist</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Intelligent Karnataka Guide</p>
          </div>
        </div>

        {/* Quick Access: My Trips (Only if logged in) */}
        {currentUser && (
          <button
            onClick={() => go('/my-trips')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activePath.startsWith('/my-trips')
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-inner'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span>My Trips</span>
            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
              {tripsCount}
            </span>
          </button>
        )}
      </div>

      {/* Center Search Bar (Only if logged in) */}
      {currentUser && (
        <div className="hidden md:block relative w-72 lg:w-96" ref={searchBoxRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setSearchOpen(true)}
            placeholder="Search temples, waterfalls, beaches..."
            className="w-full pl-9 pr-9 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searching && <Loader2 className="w-3.5 h-3.5 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />}
          {!searching && query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {searchOpen && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              {results.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No matching places found.</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((place, idx) => {
                    const p = normalizePlace(place);
                    return (
                      <button
                        key={`${p.id}-${idx}`}
                        onClick={() => handleResultClick(place)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/60 last:border-0"
                      >
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          {p.image ? (
                            <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" iconClassName="w-4 h-4" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-indigo-400"><MapPin className="w-4 h-4" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                          <p className="truncate text-[10px] text-slate-400">
                            {p.category} · {p.city}{p.state ? `, ${p.state}` : ''}
                            {place.distance_km != null ? ` · ${formatDistance(place.distance_km)}` : ''}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-300 shrink-0">View on Map</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right Section: User Profile */}
      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping inline-block"></span> Explorer
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/10 ring-2 ring-indigo-500/30 uppercase">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => go('/login')}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
