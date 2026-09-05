import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, MapPin, Route, Map, Bookmark,
  Heart, User, Mail, Compass, X, Sparkles, Landmark,
  TreePine, CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripsCount } = useAuth();

  const primaryItems = [
    { path: '/', label: 'Home', icon: Home, badge: null, match: (p) => p === '/' },
    { path: '/plan-trip', label: 'Plan a Trip', icon: Route, badge: 'AI', match: (p) => p === '/plan-trip' },
    { path: '/nearby', label: 'Nearby Places', icon: MapPin, badge: 'GPS', match: (p) => p === '/nearby' },
    { path: '/map', label: 'Map View', icon: Map, badge: null, match: (p) => p === '/map' },
    { path: '/my-trips', label: 'My Trips', icon: Bookmark, badge: tripsCount, match: (p) => p.startsWith('/my-trips') },
    { path: '/favorites', label: 'Favorites', icon: Heart, badge: null, match: (p) => p === '/favorites' },
  ];

  const discoveryItems = [
    { path: '/destinations', label: 'Destinations', icon: Compass, match: (p) => p === '/destinations' },
    { path: '/attractions', label: 'Attractions', icon: Landmark, match: (p) => p === '/attractions' },
    { path: '/experiences', label: 'Experiences', icon: TreePine, match: (p) => p === '/experiences' },
    { path: '/events', label: 'Events & Festivals', icon: CalendarDays, match: (p) => p === '/events' },
    { path: '/ai-guide', label: 'AI Guide', icon: Sparkles, match: (p) => p === '/ai-guide' },
  ];

  const accountItems = [
    { path: '/profile', label: 'Profile', icon: User, match: (p) => p === '/profile' },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (p) => p === '/dashboard' },
    { path: '/contact', label: 'Contact Support', icon: Mail, match: (p) => p === '/contact' },
  ];

  const renderNavGroup = (items, heading) => (
    <div className="space-y-1">
      {heading && (
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-cream/40 pt-2 mb-1.5 font-sans">
          {heading}
        </p>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.match(location.pathname);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 group ${
              isActive
                ? 'bg-gradient-to-r from-safari-600 to-safari-500 text-white shadow-lg shadow-safari-900/30'
                : 'text-cream/65 hover:bg-white/5 hover:text-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-cream/40 group-hover:text-safari-300'
                }`}
              />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-safari-500/15 text-safari-300 border border-safari-500/30'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 shrink-0 bg-ink-900/95 border-r border-white/10 backdrop-blur-md flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out -translate-x-full lg:sticky lg:top-0 lg:left-auto lg:h-screen lg:translate-x-0 overflow-y-auto scrollbar-thin ${
        isOpen ? 'translate-x-0' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between px-3 mb-2 lg:hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50 font-sans">
            Navigation Menu
          </p>
          <button
            onClick={onClose}
            className="text-cream/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {renderNavGroup(primaryItems, 'Explore Menu')}
        {renderNavGroup(discoveryItems, 'Discovery')}
        {renderNavGroup(accountItems, 'Account & Platform')}
      </div>

      {/* Footer Brand Card */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 space-y-1.5 shrink-0">
        <div className="flex items-center gap-2 text-safari-300">
          <Compass className="w-4 h-4" />
          <span className="text-xs font-bold text-cream">ExploreIndiaAI</span>
        </div>
        <p className="text-[10px] text-cream/50 leading-relaxed">
          Discover India. Plan Smarter. Travel Better.
        </p>
      </div>
    </aside>
  );
}