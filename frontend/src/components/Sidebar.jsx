import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, MapPin, Route, Map, Bookmark, Heart, User, Mail, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripsCount } = useAuth();

  const menuItems = [
    { path: '/', label: 'Home', icon: Home, badge: null, match: (p) => p === '/' },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, match: (p) => p === '/dashboard' },
    { path: '/nearby', label: 'Nearby Places', icon: MapPin, badge: 'GPS', match: (p) => p === '/nearby' },
    { path: '/plan-trip', label: 'Plan a Trip', icon: Route, badge: 'AI', match: (p) => p === '/plan-trip' },
    { path: '/map', label: 'Map View', icon: Map, badge: null, match: (p) => p === '/map' },
    { path: '/my-trips', label: 'My Trips', icon: Bookmark, badge: tripsCount, match: (p) => p.startsWith('/my-trips') },
    { path: '/favorites', label: 'Favorites', icon: Heart, badge: null, match: (p) => p === '/favorites' },
    { path: '/profile', label: 'Profile', icon: User, badge: null, match: (p) => p === '/profile' },
    { path: '/contact', label: 'Contact Support', icon: Mail, badge: null, match: (p) => p === '/contact' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 md:min-h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out -translate-x-full md:translate-x-0 ${
        isOpen ? 'translate-x-0' : ''
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3 mb-3 md:hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="hidden md:block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Navigation Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(location.pathname);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/50 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <MapPin className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-200">Karnataka Tourist AI</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Discover temples, hill stations, and curated itineraries powered by real-time GPS.
        </p>
      </div>
    </aside>
  );
}
