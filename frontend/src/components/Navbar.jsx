import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Search, LogOut, MapPin, Loader2, X, Menu, Sparkles, Bookmark } from 'lucide-react';
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
        const res = await axios.get(`${API_BASE_URL}/api/destinations/unified-search`, {
          params: { q, limit: 6 },
          timeout: 5000,
        });
        const data = res.data?.data || {};
        setResults({
          destinations: data.destinations || [],
          places: data.places || [],
        });
        setSearchOpen(true);
      } catch (err) {
        // Fallback to places search if needed
        try {
          const fallbackRes = await axios.get(`${API_BASE_URL}/api/places/search`, {
            params: { q, limit: 6 },
            timeout: 5000,
          });
          setResults({
            destinations: [],
            places: fallbackRes.data?.data || [],
          });
          setSearchOpen(true);
        } catch {
          setResults({ destinations: [], places: [] });
          setSearchOpen(false);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
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

  const logo = (
    <div
      onClick={() => navigate('/')}
      className="flex items-center gap-2.5 cursor-pointer group shrink-0"
    >
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-safari-500 to-safari-700 flex items-center justify-center text-white shadow-lg shadow-safari-900/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform">
        <Compass className="w-5 h-5" />
      </div>
      <div className="leading-tight">
        <div className="font-display font-semibold text-lg text-white tracking-tight">
          ExploreIndia<span className="text-safari-400">AI</span>
        </div>
        <p className="text-[9px] text-safari-200/60 -mt-0.5 tracking-wide">Discover · Plan · Explore</p>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-ink-950/85 backdrop-blur-md border-b border-white/10">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden text-cream/70 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {logo}
        </div>

        {/* Center search (desktop) */}
        <div className="hidden md:block relative w-80 lg:w-[26rem] mx-4" ref={searchBoxRef}>
          <Search className="w-4 h-4 text-cream/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setSearchOpen(true)}
              placeholder="Search temples, beaches, waterfalls…"
              className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-cream placeholder-cream/40 focus:outline-none focus:border-safari-500/60 focus:bg-white/10 focus:ring-1 focus:ring-safari-500/30 transition-all"
            />
            {searching && <Loader2 className="w-3.5 h-3.5 text-safari-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />}
            {!searching && query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {searchOpen && (
              <div className="absolute top-full mt-2 w-full bg-ink-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                {(!results.destinations?.length && !results.places?.length) ? (
                  <div className="p-4 text-center text-xs text-cream/50">No matching destinations or places found.</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {/* Destinations Section */}
                    {results.destinations?.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-safari-400">
                          Destinations
                        </div>
                        {results.destinations.map((dest) => (
                          <button
                            key={`dest-${dest.slug}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setQuery('');
                              navigate(`/destinations/${dest.slug}`);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                              {dest.hero_image ? (
                                <SmartImage src={dest.hero_image} alt={dest.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-safari-400"><Compass className="w-3.5 h-3.5" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-semibold text-white">{dest.name}</p>
                              <p className="truncate text-[10px] text-cream/50">
                                {dest.category} · {dest.district ? `${dest.district}, ` : ''}{dest.state}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-safari-300 shrink-0">Explore &rarr;</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Places Section */}
                    {results.places?.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-safari-400">
                          Attractions
                        </div>
                        {results.places.map((place, idx) => {
                          const p = normalizePlace(place);
                          const placeSlug = place.slug || place.id;
                          return (
                            <button
                              key={`place-${p.id}-${idx}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setQuery('');
                                navigate(`/places/${placeSlug}`);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors"
                            >
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-ink-800 shrink-0">
                                {p.image ? (
                                  <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-safari-400"><MapPin className="w-3.5 h-3.5" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-semibold text-white">{p.name}</p>
                                <p className="truncate text-[10px] text-cream/50">
                                  {p.category} · {p.city}{p.state ? `, ${p.state}` : ''}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-cream/60 shrink-0">View &rarr;</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Right: trips badge + profile */}
        <div className="flex items-center gap-3 ml-auto">
          {currentUser && (
            <button
              onClick={() => navigate('/my-trips')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-cream/80 hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4 text-safari-400" />
              <span>My Trips</span>
              <span className="bg-safari-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tripsCount}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 cursor-pointer group"
                title={currentUser.name}
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                  <span className="text-[9px] text-safari-400 flex items-center gap-1 justify-end mt-0.5">
                    <span className="w-1.5 h-1.5 bg-safari-400 rounded-full inline-block" /> Explorer
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-safari-500 to-sunset-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10 uppercase group-hover:ring-safari-400/50 transition-all">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-cream/50 hover:text-sunset-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-white bg-safari-600 hover:bg-safari-500 px-4 py-2 rounded-full transition-colors shadow-lg shadow-safari-900/30"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}