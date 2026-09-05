import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Route, Compass, Sparkles, ArrowRight, ArrowUpRight, Star, CalendarDays,
  Sun, TrainFront, BedDouble, Utensils, Plane, Shield, Bus, Map as MapIcon,
  Users, Wallet, TreePine, Waves, Landmark, Mountain, PawPrint,
  MountainSnow, UtensilsCrossed, Loader2,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SmartImage from '../components/SmartImage';

// -----------------------------------------------------------------------------
// Static (curated, original) content — never duplicated from the backend.
// These present the platform as a real tourism product. The dynamic sections
// below pull real places from the API.
// -----------------------------------------------------------------------------

const TRAVEL_THEMES = [
  { id: 'Heritage', label: 'Heritage & History', desc: 'Palaces, temples and ancient cities', icon: Landmark, img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80', accent: 'from-sunset-500/90 to-sunset-700/90' },
  { id: 'Nature', label: 'Nature & Waterfalls', desc: 'Misty ghats, cascades and coffee', icon: TreePine, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', accent: 'from-safari-600/90 to-safari-800/90' },
  { id: 'Wildlife', label: 'Wildlife & Safari', desc: 'Tigers, elephants and bird sanctuaries', icon: PawPrint, img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', accent: 'from-clay-500/90 to-clay-700/90' },
  { id: 'Beach', label: 'Beaches & Coast', desc: 'Golden sands and Arabian Sea sunsets', icon: Waves, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', accent: 'from-sky-500/90 to-sky-800/90' },
  { id: 'Temple', label: 'Spiritual Journeys', desc: 'Sacred shrines and pilgrim trails', icon: Compass, img: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=800&q=80', accent: 'from-sunset-500/90 to-clay-700/90' },
  { id: 'Hill Station', label: 'Hill Escapes', desc: 'Cool mountain towns and treks', icon: Mountain, img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', accent: 'from-safari-600/90 to-ink-800/90' },
  { id: 'Monument', label: 'Monuments & Forts', desc: 'Timeless ruins and stone marvels', icon: MountainSnow, img: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80', accent: 'from-ink-600/90 to-ink-800/90' },
  { id: 'Food', label: 'Food & Culture', desc: 'Local flavours and living traditions', icon: UtensilsCrossed, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', accent: 'from-clay-500/90 to-sunset-800/90' },
];

const TRAVEL_INFO = [
  { icon: Sun, title: 'Best Time to Visit', desc: 'October to March offers pleasant weather across most of Karnataka — ideal for heritage, hills and wildlife. The monsoon (June–Sep) is spectacular for waterfalls.', tag: 'Weather' },
  { icon: Plane, title: 'How to Reach', desc: 'Bengaluru (BLR) and Mangaluru (IXE) are the main air gateways. State-run KSRTC buses and an extensive rail network link every major region.', tag: 'Getting There' },
  { icon: BedDouble, title: 'Where to Stay', desc: 'From heritage homestays in Malnad to coastal resorts and jungle lodges — every traveller style has a place. Budget stays are comfortable across cities.', tag: 'Accommodation' },
  { icon: Bus, title: 'Local Transport', desc: 'City buses, auto-rickshaws and cab aggregators are reliable in cities. Hill and coastal regions are best explored with a private vehicle or guided day trips.', tag: 'Getting Around' },
  { icon: Wallet, title: 'Travel Budget', desc: 'ExploreIndiaAI breaks your budget into transport, stay, food and experiences — so you always know what a trip really costs before you go.', tag: 'Planning' },
  { icon: Shield, title: 'Safety & Entry', desc: 'Carry a valid ID and keep entry timings handy — many temples and monuments close in the afternoon. Stay hydrated and follow wildlife-park rules.', tag: 'Stay Safe' },
];

const EVENTS = [
  { name: 'Mysuru Dasara 2026', date: '18–28 Oct 2026', location: 'Mysuru', category: 'Festival', img: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hampi Heritage Conclave', date: '3–6 Nov 2026', location: 'Hampi', category: 'Culture', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80' },
  { name: 'Coorg Coffee Festival', date: '21–23 Dec 2026', location: 'Madikeri', category: 'Food', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80' },
  { name: 'Gokarna Beach & Yoga Retreat', date: '14–17 Jan 2027', location: 'Gokarna', category: 'Wellness', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
];

const RESOURCES = [
  { icon: BedDouble, title: 'Accommodations', desc: 'Stays for every budget & region', to: '/plan-trip' },
  { icon: Utensils, title: 'Local Food', desc: 'Where to eat across the state', to: '/nearby' },
  { icon: Users, title: 'Tourist Guides', desc: 'Bring the history to life', to: '/contact' },
  { icon: TrainFront, title: 'Transport', desc: 'Rail, road and air connections', to: '/plan-trip' },
  { icon: MapIcon, title: 'Interactive Maps', desc: 'Explore routes & nearby places', to: '/map' },
  { icon: Shield, title: 'Emergency Services', desc: 'Nearby essentials, live', to: '/nearby' },
];

// Static hero image selection from Unsplash (tourism generators).
const HERO_IMG = 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1800&q=80';
const MAP_BANNER_IMG = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80';

// -----------------------------------------------------------------------------
// Reusable section bits
// -----------------------------------------------------------------------------

function SectionHeader({ eyebrow, title, subtitle, ctaLabel, ctaTo }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400 mb-2">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-white text-balance">{title}</h2>
        {subtitle && <p className="text-sm text-cream/55 mt-2 max-w-xl text-pretty">{subtitle}</p>}
      </div>
      {ctaLabel && (
        <button
          onClick={() => navigate(ctaTo)}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-safari-300 hover:text-safari-200 transition-colors shrink-0"
        >
          {ctaLabel}
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      )}
    </div>
  );
}

function ThemeCard({ theme, onExplore }) {
  const Icon = theme.icon;
  return (
    <button
      onClick={() => onExplore(theme)}
      className="group relative rounded-2xl overflow-hidden text-left h-52 w-full border border-white/10 hover:border-safari-400/40 transition-all duration-300"
    >
      <SmartImage
        src={theme.img}
        alt={theme.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${theme.accent} opacity-60 blur-xl group-hover:opacity-80 transition-opacity`} />
      <div className="relative h-full flex flex-col justify-end p-4">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-2">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white leading-tight">{theme.label}</h3>
        <p className="text-xs text-cream/70 mt-0.5">{theme.desc}</p>
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Main page
// -----------------------------------------------------------------------------

export default function Home() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/places/`, { timeout: 8000 });
        if (!cancelled) setPlaces(res.data?.data || []);
      } catch {
        if (!cancelled) setPlaces([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Featured destinations: group by city, pick popular ones with counts.
  const destinationGroups = useMemo(() => {
    const byCity = {};
    for (const p of places) {
      const c = p.city || 'Unknown';
      byCity[c] = byCity[c] || [];
      byCity[c].push(p);
    }
    return Object.entries(byCity)
      .map(([city, items]) => ({ city, count: items.length, items }))
      .sort((a, b) => b.count - a.count);
  }, [places]);

  const categoryCount = useMemo(
    () => new Set(places.map((p) => p.category).filter(Boolean)).size,
    [places]
  );

  const featuredDestinations = useMemo(() => {
    const preferred = ['Mysuru', 'Hampi', 'Gokarna', 'Chikkamagaluru', 'Udupi', 'Mangaluru', 'Madikeri', 'Badami', 'Belur', 'Bengaluru'];
    const ordered = [];
    for (const p of preferred) {
      const found = destinationGroups.find((d) => d.city.toLowerCase() === p.toLowerCase());
      if (found) ordered.push(found);
    }
    for (const d of destinationGroups) {
      if (!ordered.some((o) => o.city === d.city)) ordered.push(d);
    }
    return ordered.slice(0, 8);
  }, [destinationGroups]);

  const topAttractions = useMemo(
    () => [...places].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8),
    [places]
  );

  const onExploreTheme = (theme) => {
    navigate('/nearby', { state: { category: theme.id } });
  };

  const heroImage = places.length > 0
    ? topAttractions[0]?.image || HERO_IMG
    : HERO_IMG;

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[82vh] flex items-end overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <SmartImage
            src={heroImage}
            alt="Karnataka"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 w-full">
          <div className="max-w-2xl animate-fade-up">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white mb-5">
              <Sparkles className="w-3.5 h-3.5 text-safari-300" />
              AI-powered travel companion
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold text-white leading-[1.05] text-balance">
              Discover Karnataka, one itinerary at a time.
            </h1>
            <p className="text-base md:text-lg text-cream/80 mt-5 max-w-xl text-pretty">
              Explore heritage capitals, misty hill stations, golden coasts and untamed wildlife — curated, mapped and planned for you.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/plan-trip')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-safari-600 hover:bg-safari-500 text-white font-bold text-sm rounded-full shadow-xl shadow-safari-900/50 transition-all"
              >
                <Route className="w-4 h-4" /> Plan My Trip
              </button>
              <button
                onClick={() => navigate('/nearby')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-full border border-white/20 backdrop-blur-md transition-all"
              >
                <MapPin className="w-4 h-4" /> Explore Nearby
              </button>
              <button
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-white font-semibold text-sm rounded-full border border-white/20 hover:border-white/40 transition-all"
              >
                <MapIcon className="w-4 h-4" /> View Map
              </button>
            </div>
          </div>

          {/* Under-hero stat strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-md">
            {[
              { value: places.length ? `${places.length}+` : '—', label: 'Crafted Attractions' },
              { value: destinationGroups.length ? `${destinationGroups.length}` : '—', label: 'Destinations' },
              { value: categoryCount ? `${categoryCount}` : '—', label: 'Travel Themes' },
              { value: 'AI', label: 'Smart Planning' },
            ].map((s, idx) => (
              <div key={idx} className="bg-ink-950/70 px-5 py-4">
                <p className="font-display text-2xl font-semibold text-safari-300">{s.value}</p>
                <p className="text-[11px] text-cream/60 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QUICK ACTIONS ===================== */}
      <section className="relative -mt-2 z-10 bg-ink-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Route, title: 'Plan My Trip', desc: 'AI itineraries for getaway', to: '/plan-trip', accent: 'text-safari-300 bg-safari-500/10 border-safari-500/30', iconCls: 'bg-safari-500/15 text-safari-300' },
              { icon: MapPin, title: 'Nearby Discovery', desc: 'Live places around you', to: '/nearby', accent: 'text-sky-300 bg-sky-500/10 border-sky-500/30', iconCls: 'bg-sky-500/15 text-sky-300' },
              { icon: MapIcon, title: 'Map-First Explore', desc: 'Routes & every stop plotted', to: '/map', accent: 'text-sunset-300 bg-sunset-500/10 border-sunset-500/30', iconCls: 'bg-sunset-500/15 text-sunset-300' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.title}
                  onClick={() => navigate(a.to)}
                  className={`group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border ${a.accent} hover:-translate-y-0.5 transition-all text-left`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${a.iconCls}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-white">{a.title}</h3>
                    <p className="text-xs text-cream/55 mt-0.5">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cream/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== TRAVEL THEMES ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow="Find your vibe"
          title="Pick your travel theme"
          subtitle="From temple towns to treks and tiger country — start with what moves you."
          ctaLabel="Explore all"
          ctaTo="/nearby"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRAVEL_THEMES.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} onExplore={onExploreTheme} />
          ))}
        </div>
      </section>

      {/* ===================== FEATURED DESTINATIONS ===================== */}
      <section className="max-w-7xl mx-auto px-6 pb-0">
        <SectionHeader
          eyebrow="Favourite destinations"
          title="Towns worth the detour"
          subtitle="Iconic cities, hidden gems and local favourites — all within reach and mapped for you."
          ctaLabel="View all destinations"
          ctaTo="/destinations"
        />
        {loading ? (
          <div className="flex items-center justify-center py-16 text-cream/50">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading destinations…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredDestinations.map((d, i) => {
              const cover = d.items.find((p) => p.image)?.image;
              const isWide = i === 0;
              const destSlug = d.city.toLowerCase().replace(/\s+/g, '-');
              return (
                <button
                  key={d.city}
                  onClick={() => navigate(`/destinations/${destSlug}`)}
                  className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-safari-400/40 transition-all duration-300 h-64 ${isWide ? 'sm:col-span-2 lg:row-span-1' : ''}`}
                >
                  <SmartImage
                    src={cover}
                    alt={d.city}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ink-950/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-safari-200 uppercase tracking-wider">
                    Explore
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-xl font-semibold text-white">{d.city}</h3>
                    <p className="text-xs text-cream/70 mt-0.5">
                      {d.count} place{d.count > 1 ? 's' : ''} · top spots
                    </p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ===================== CURATED ATTRACTIONS ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow="Curated by our engines"
          title="Places travellers rate the highest"
          subtitle="The strongest-rated experiences across Karnataka, ready to add to your plan."
          ctaLabel="View all attractions"
          ctaTo="/attractions"
        />
        {loading ? (
          <div className="flex items-center justify-center py-16 text-cream/50">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading gems…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topAttractions.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/places/${p.slug || p.id}`)}
                className="group rounded-2xl overflow-hidden border border-white/10 hover:border-safari-400/40 hover:-translate-y-1 transition-all duration-300 bg-white/[0.02] text-left"
              >
                <div className="relative h-40 overflow-hidden bg-ink-900">
                  <SmartImage
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-ink-950/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-cream/90 capitalize">
                    {p.category}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-ink-950 text-xs font-bold">
                    <Star className="w-3 h-3 fill-ink-950" /> {p.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-white line-clamp-1 group-hover:text-safari-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-cream/55 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
                    {p.city}, {p.state}
                  </p>
                  <p className="text-[11px] text-cream/40 mt-2 line-clamp-2">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ===================== EVENTS ===================== */}
      <section className="bg-white/[0.02] border-y border-white/5 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="What's on"
            title="Upcoming events & festivals"
            subtitle="Plan your travels around Karnataka's cultural calendar."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EVENTS.map((ev) => (
              <button
                key={ev.name}
                onClick={() => navigate('/plan-trip')}
                className="group rounded-2xl overflow-hidden border border-white/10 hover:border-sunset-400/40 transition-all duration-300 bg-ink-900 text-left"
              >
                <div className="relative h-36 overflow-hidden">
                  <SmartImage
                    src={ev.img}
                    alt={ev.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-sunset-500 text-ink-950 text-[10px] font-bold uppercase tracking-wider">
                    {ev.category}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sunset-300 mb-2">
                    <CalendarDays className="w-3.5 h-3.5" /> {ev.date}
                  </div>
                  <h3 className="font-display text-base font-semibold text-white leading-snug group-hover:text-sunset-200 transition-colors">
                    {ev.name}
                  </h3>
                  <p className="text-xs text-cream/55 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sunset-400 shrink-0" /> {ev.location}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ESSENTIAL TRAVEL INFO ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow="Essential guides"
          title="Travel smart, travel easy"
          subtitle="Everything you need to know before you set off — in one place."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRAVEL_INFO.map((info) => {
            const Icon = info.icon;
            return (
              <div
                key={info.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-safari-400/30 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-safari-500/10 border border-safari-500/30 flex items-center justify-center text-safari-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-cream/60 uppercase tracking-wider">
                    {info.tag}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-white mt-4">{info.title}</h3>
                <p className="text-sm text-cream/60 mt-2 leading-relaxed">{info.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== MAP-FIRST BANNER ===================== */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 min-h-[320px] flex items-center bg-ink-900">
          <div className="absolute inset-0">
            <SmartImage
              src={MAP_BANNER_IMG}
              alt="Map discovery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
          </div>
          <div className="relative max-w-lg p-8 md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-300 mb-3">
              Map-first discovery
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white text-balance">
              Every stop, on one living map.
            </h2>
            <p className="text-sm text-cream/70 mt-3 leading-relaxed">
              Move naturally from card to detail to map — plot your whole route, check nearby hotels, restaurants and essentials, and share your itinerary with the world.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-safari-600 hover:bg-safari-500 text-white font-bold text-sm rounded-full shadow-lg transition-all"
              >
                <MapIcon className="w-4 h-4" /> Open Interactive Map
              </button>
              <button
                onClick={() => navigate('/plan-trip')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full border border-white/20 backdrop-blur transition-all"
              >
                Build a Route <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== RESOURCE HUB ===================== */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow="Resource hub"
          title="Your one-stop travel resource"
          subtitle="Everything you need to turn inspiration into a seamless journey."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.title}
                onClick={() => navigate(r.to)}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:-translate-y-0.5 hover:border-safari-400/30 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-safari-500/10 border border-safari-500/30 flex items-center justify-center text-safari-300 group-hover:bg-safari-500/20 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-cream/55 mt-0.5">{r.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-cream/40 group-hover:text-safari-300 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}