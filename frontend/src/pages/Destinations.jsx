import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Route, ArrowUpRight, Search, Compass, Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTrip } from '../context/TripContext';
import SmartImage from '../components/SmartImage';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

export default function Destinations() {
  const navigate = useNavigate();
  const { updatePlanner } = useTrip();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/destinations/`, { timeout: 8000 });
        if (!cancelled) setDestinations(res.data?.data || []);
      } catch {
        if (!cancelled) setDestinations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    destinations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ['All', ...Array.from(set)];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.district && d.district.toLowerCase().includes(q)) ||
        (d.short_description && d.short_description.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === 'All' || d.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [destinations, query, selectedCategory]);

  const handlePlanTripTo = (d, e) => {
    e.stopPropagation();
    updatePlanner({ destination: d.name });
    navigate('/plan-trip');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <PageHeader
        eyebrow="Explore India"
        title="Curated Travel Destinations"
        subtitle="Discover ancient heritage capitals, tranquil coasts, and misty hill escapes across Karnataka."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan Journey</span>
        </button>
      </PageHeader>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, region, or keyword (e.g. Hampi, Coorg)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder-cream/30 focus:border-safari-400 outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-safari-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-cream/70 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Discovering destinations across India..." />
      ) : filteredDestinations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10">
          <Compass className="w-10 h-10 text-cream/30 mx-auto mb-3" />
          <p className="text-cream/70 text-sm">No destinations found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((d) => (
            <div
              key={d.slug}
              onClick={() => navigate(`/destinations/${d.slug}`)}
              className="group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/30"
            >
              <div>
                <div className="relative h-56 bg-ink-900 overflow-hidden">
                  <SmartImage
                    src={d.hero_image}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />

                  {d.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-safari-300">
                      {d.category}
                    </span>
                  )}

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-cream/90">
                    {d.places_count} Attractions
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display font-semibold text-2xl text-white group-hover:text-safari-300 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-[11px] text-cream/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-safari-400" />
                      <span>{d.district ? `${d.district}, ` : ''}{d.state}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-cream/70 leading-relaxed line-clamp-2">
                    {d.short_description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-safari-300 group-hover:text-white transition-colors flex items-center gap-1">
                  <span>Explore Destination</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePlanTripTo(d, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-safari-600/20 hover:bg-safari-600 text-safari-300 hover:text-white border border-safari-500/40 text-xs font-bold transition-all"
                >
                  <Route className="w-3 h-3" />
                  <span>Plan Trip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
