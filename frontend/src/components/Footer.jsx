import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, Mail, Heart } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Destinations', to: '/' },
      { label: 'Attractions', to: '/nearby' },
      { label: 'Experiences', to: '/' },
      { label: 'Upcoming Events', to: '/' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { label: 'AI Trip Planner', to: '/plan-trip' },
      { label: 'My Trips', to: '/my-trips' },
      { label: 'Favorites', to: '/favorites' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Nearby Places', to: '/nearby' },
      { label: 'Interactive Map', to: '/map' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Travel Tips', to: '/' },
      { label: 'How to Reach', to: '/' },
      { label: 'Safety & Health', to: '/' },
      { label: 'Best Time to Visit', to: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'Feedback', to: '/contact' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
    ],
  },
];

export default function Footer({ minimal = false }) {
  const navigate = useNavigate();
  const go = (path) => navigate(path);

  if (minimal) {
    return (
      <footer className="border-t border-white/10 bg-ink-950 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <div className="flex items-center gap-2 font-semibold text-cream/80">
            <Compass className="w-4 h-4 text-safari-400" /> ExploreIndiaAI
          </div>
          <p>© {new Date().getFullYear()} ExploreIndiaAI. Discover · Plan · Explore.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-ink-950 mt-16">
      {/* Brand strip */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-white/10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-safari-500 to-safari-700 flex items-center justify-center text-white shadow-lg shadow-safari-900/40">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-semibold text-lg text-white">ExploreIndia<span className="text-safari-400">AI</span></div>
                <p className="text-[9px] text-safari-200/60 tracking-wide">Discover · Plan · Explore</p>
              </div>
            </div>
            <p className="text-sm text-cream/60 leading-relaxed">
              A smart, AI-powered way to discover Karnataka's heritage, hills, beaches and wildlife — and turn them into a personalised journey.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-cream/70">
              <MapPin className="w-3.5 h-3.5 text-safari-400" />
              <span>Karnataka, India</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 flex-1 max-w-3xl">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-safari-300 mb-3 font-sans">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => go(link.to)}
                        className="text-sm text-cream/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/45">
        <p>© {new Date().getFullYear()} ExploreIndiaAI. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made with <Heart className="w-3.5 h-3.5 text-sunset-400 fill-sunset-400" /> for curious travellers across India.
        </p>
      </div>
    </footer>
  );
}