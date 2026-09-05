import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Route, Navigation, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SmartImage from '../components/SmartImage';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import { useTrip } from '../context/TripContext';

const CATEGORIES = ['All', 'Heritage', 'Nature', 'Temple', 'Waterfall', 'Wildlife', 'Beach', 'Monument'];

export default function Attractions() {
  const navigate = useNavigate();
  const { setTripData } = useTrip();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [detailsPlace, setDetailsPlace] = useState(null);

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

  const filteredPlaces = useMemo(() => {
    let list = places;
    if (activeCat !== 'All') {
      list = list.filter((p) => (p.category || '').toLowerCase() === activeCat.toLowerCase());
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [places, activeCat, query]);

  const handleViewOnMap = (place) => {
    setTripData({
      fromNearby: true,
      routeStops: [place.name],
      waypoints: [
        {
          name: place.name,
          stop_number: 1,
          lat: place.latitude,
          lng: place.longitude,
          description: `${place.category} · ${place.city}`,
        },
      ],
      selectedPlaces: [place],
      groupedRecommendations: [],
      itinerary: null,
      stats: null,
    });
    navigate('/map');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <PageHeader
        eyebrow="Curated Heritage &amp; Landscapes"
        title="Must-Visit Attractions"
        subtitle="Explore high-rated monuments, temples, waterfalls and sanctuaries across Karnataka."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan with AI</span>
        </button>
      </PageHeader>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search attractions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:border-safari-400 outline-none"
            />
          </div>

          <span className="text-xs text-cream/50">
            Showing {filteredPlaces.length} attraction{filteredPlaces.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeCat === cat
                  ? 'bg-safari-600 text-white shadow-md shadow-safari-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-cream/70 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Curating top attractions..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPlaces.map((place) => {
            const placeSlug = place.slug || place.id;
            return (
              <div
                key={place.id}
                onClick={() => navigate(`/places/${placeSlug}`)}
                className="group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
              >
                <div>
                  <div className="relative h-44 bg-ink-900 overflow-hidden">
                    <SmartImage
                      src={place.image || place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

                    {place.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-cream/90">
                        {place.category}
                      </span>
                    )}

                    {place.rating && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-ink-950 text-xs font-black shadow-sm">
                        <Star className="w-3 h-3 fill-ink-950" /> {place.rating}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="font-display font-semibold text-base text-white group-hover:text-safari-300 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-cream/55 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" />
                      <span className="truncate">{place.city}, {place.state}</span>
                    </p>
                    {place.description && (
                      <p className="text-xs text-cream/65 line-clamp-2 mt-1 leading-relaxed">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/5 mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/places/${placeSlug}`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors text-center border border-white/10"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOnMap(place);
                    }}
                    className="py-2 px-3 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-1"
                    title="View on map"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailsPlace && (
        <PlaceDetailsModal
          place={detailsPlace}
          onClose={() => setDetailsPlace(null)}
          onAddToTrip={() => handleViewOnMap(detailsPlace)}
        />
      )}
    </div>
  );
}
