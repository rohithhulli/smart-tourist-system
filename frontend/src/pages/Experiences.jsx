import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark, TreePine, PawPrint, Waves, Compass, Mountain,
  MountainSnow, UtensilsCrossed, ArrowRight, Route,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SmartImage from '../components/SmartImage';

const TRAVEL_THEMES = [
  {
    id: 'Heritage',
    label: 'Heritage & History',
    desc: 'Grand royal palaces, UNESCO stone temples and medieval forts',
    icon: Landmark,
    img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    tags: ['Mysuru Palace', 'Hampi Ruins', 'Badami Caves', 'Belur & Halebidu'],
  },
  {
    id: 'Nature',
    label: 'Nature & Waterfalls',
    desc: 'Cascading river gorges, lush rainforests and misty Ghat valleys',
    icon: TreePine,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    tags: ['Jog Falls', 'Abbey Falls', 'Western Ghats', 'Coorg Valleys'],
  },
  {
    id: 'Wildlife',
    label: 'Wildlife & Safari',
    desc: 'Royal Bengal tigers, Asian elephants and serene bird sanctuaries',
    icon: PawPrint,
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    tags: ['Nagarhole', 'Bandipur', 'Kabini Safari', 'Ranganathittu'],
  },
  {
    id: 'Beach',
    label: 'Coastal & Beaches',
    desc: 'Unspoiled golden coastlines, pristine sunsets and temple towns',
    icon: Waves,
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    tags: ['Om Beach Gokarna', 'Malpe Beach', 'Murudeshwar', 'Karwar'],
  },
  {
    id: 'Temple',
    label: 'Spiritual Journeys',
    desc: 'Ancient pilgrim paths, Vedic architecture and coastal shrines',
    icon: Compass,
    img: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80',
    tags: ['Udupi Krishna Matha', 'Dharmasthala', 'Kukke Subramanya', 'Sringeri'],
  },
  {
    id: 'Hill Station',
    label: 'Hill Escapes & Treks',
    desc: 'Cool plantation breezes, ridge trails and mountain horizons',
    icon: Mountain,
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    tags: ['Mullayanagiri', 'Kudremukha', 'Madikeri Hills', 'Kemmangundi'],
  },
  {
    id: 'Food',
    label: 'Culinary Traditions',
    desc: 'Authentic South Indian coastal gravies, filter coffee & sweets',
    icon: UtensilsCrossed,
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Mysore Pak', 'Mangalorean Seafood', 'Udupi Thali', 'Malnad Cuisine'],
  },
];

export default function Experiences() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      <PageHeader
        eyebrow="Signature Travel Themes"
        title="Curated Experiences"
        subtitle="Explore Karnataka by your passion — from historic royal circuits to untamed jungle trails."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan by Passion</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRAVEL_THEMES.map((theme) => {
          const Icon = theme.icon;
          return (
            <div
              key={theme.id}
              className="group rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/30"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-ink-900">
                  <SmartImage
                    src={theme.img}
                    alt={theme.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-ink-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-safari-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display font-semibold text-2xl text-white">{theme.label}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-cream/70 leading-relaxed min-h-[36px]">
                    {theme.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {theme.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-cream/75"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/nearby', { state: { category: theme.id } })}
                  className="text-xs font-semibold text-cream/60 hover:text-white transition-colors"
                >
                  Explore Spots
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/plan-trip')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-safari-600/20 hover:bg-safari-600 text-safari-300 hover:text-white border border-safari-500/40 text-xs font-bold transition-all"
                >
                  <span>Plan Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
