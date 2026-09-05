import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Search, MapPin, Star, Navigation, Route,
  ArrowRight, X, Plus, Check, Loader2, Sparkles, Filter,
  BedDouble, Utensils, Fuel, Hospital, TrainFront, ShoppingBag,
  Car, Landmark, Banknote,
} from 'lucide-react';
import MapView from '../components/MapView';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import { useTrip } from '../context/TripContext';
import { haversineKm, formatDistance } from '../utils/places';
import { API_BASE_URL } from '../config';
import SmartImage from '../components/SmartImage';

const MAP_CATEGORIES = [
  { id: 'attractions', label: 'Attractions', icon: Landmark, type: 'places' },
  { id: 'hotels', label: 'Hotels', icon: BedDouble, type: 'service' },
  { id: 'restaurants', label: 'Restaurants', icon: Utensils, type: 'service' },
  { id: 'fuel', label: 'Fuel', icon: Fuel, type: 'service' },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital, type: 'service' },
  { id: 'transport', label: 'Transport', icon: TrainFront, type: 'service' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, type: 'service' },
  { id: 'parking', label: 'Parking', icon: Car, type: 'service' },
  { id: 'atms', label: 'ATM', icon: Banknote, type: 'service' },
];

export default function MapViewPage() {
  const navigate = useNavigate();
  const { tripData, setTripData } = useTrip();

  const routeStops = useMemo(
    () => (tripData?.routeStops && tripData.routeStops.length ? tripData.routeStops.filter(Boolean) : []),
    [tripData]
  );

  const selectedPlaces = useMemo(
    () => (tripData?.selectedPlaces && tripData.selectedPlaces.length ? tripData.selectedPlaces : []),
    [tripData]
  );

  const [selectedStop, setSelectedStop] = useState(routeStops[0] || 'Mysuru');
  const [activeCategory, setActiveCategory] = useState('attractions');
  const [searchQuery, setSearchQuery] = useState('');
  const [fitSignal, setFitSignal] = useState(0);
  const [previewPlace, setPreviewPlace] = useState(null);
  const [detailsPlace, setDetailsPlace] = useState(null);
  const [localAdded, setLocalAdded] = useState([]);
  const mapRef = useRef(null);

  const [livePlaces, setLivePlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryServices, setCategoryServices] = useState([]);

  useEffect(() => {
    setSelectedStop(routeStops[0] || 'Mysuru');
    setFitSignal((s) => s + 1);
  }, [routeStops]);

  const waypoints = useMemo(() => {
    if (tripData?.waypoints && tripData.waypoints.length > 0) {
      return tripData.waypoints.map((w, idx) => ({
        name: w.name || `Stop ${idx + 1}`,
        stop_number: w.stop_number || idx + 1,
        lat: w.lat ?? null,
        lng: w.lng ?? null,
        description: w.description || '',
      }));
    }
    // Default route anchors if no active planner trip loaded
    return [
      { name: 'Bengaluru', stop_number: 1, lat: 12.9716, lng: 77.5946, description: 'Karnataka Capital' },
      { name: 'Mysuru', stop_number: 2, lat: 12.2958, lng: 76.6394, description: 'Heritage City' },
    ];
  }, [tripData]);

  const validWaypoints = useMemo(
    () => waypoints.filter((w) => w.lat != null && w.lng != null),
    [waypoints]
  );

  // Focus target from TripContext (e.g. from Recommendations "View on Map")
  useEffect(() => {
    const target = tripData?.focusPlace;
    if (target && target.lat != null && target.lng != null) {
      setPreviewPlace(target);
      const t = setTimeout(() => mapRef.current?.centerOn(target.lat, target.lng, 14), 500);
      return () => clearTimeout(t);
    }
  }, [tripData?.focusPlace]);

  // Active anchor coordinates
  const currentAnchor = useMemo(() => {
    const match = waypoints.find((w) => w.name.toLowerCase() === selectedStop.toLowerCase());
    if (match && match.lat && match.lng) return { lat: match.lat, lng: match.lng };
    if (validWaypoints.length > 0) return { lat: validWaypoints[0].lat, lng: validWaypoints[0].lng };
    return { lat: 12.9716, lng: 77.5946 };
  }, [selectedStop, waypoints, validWaypoints]);

  // Load places or services depending on activeCategory
  useEffect(() => {
    let cancelled = false;
    const loadContent = async () => {
      setLoading(true);
      const activeCatObj = MAP_CATEGORIES.find((c) => c.id === activeCategory);

      try {
        if (activeCatObj?.type === 'service') {
          // Fetch Overpass services
          const params = new URLSearchParams({
            lat: currentAnchor.lat,
            lng: currentAnchor.lng,
            category: activeCategory,
            radius: 20,
          });
          const res = await fetch(`${API_BASE_URL}/api/nearby/services?${params.toString()}`);
          const data = await res.json();
          if (!cancelled && data.status === 'success') {
            const mapped = (data.data || []).map((s) => ({
              id: s.id,
              name: s.name,
              category: activeCatObj.label,
              lat: s.lat,
              lng: s.lng,
              distance_km: s.distance_km,
              address: s.address,
              phone: s.phone,
              isService: true,
            }));
            setCategoryServices(mapped);
          }
        } else {
          // Fetch Attractions from database
          const params = new URLSearchParams();
          if (currentAnchor.lat && currentAnchor.lng) {
            params.set('lat', currentAnchor.lat);
            params.set('lng', currentAnchor.lng);
            params.set('radius', 50);
          }
          const res = await fetch(`${API_BASE_URL}/api/places/?${params.toString()}`);
          const data = await res.json();
          if (!cancelled && data.status === 'success') {
            setLivePlaces(data.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching map items:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContent();
    return () => { cancelled = true; };
  }, [activeCategory, currentAnchor]);

  // Active items for display
  const displayItems = useMemo(() => {
    const isService = MAP_CATEGORIES.find((c) => c.id === activeCategory)?.type === 'service';
    const source = isService ? categoryServices : livePlaces;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q))
    );
  }, [activeCategory, categoryServices, livePlaces, searchQuery]);

  const mapSelectedPlaces = useMemo(() => {
    return displayItems.slice(0, 30).map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat ?? p.latitude,
      lng: p.lng ?? p.longitude,
      category: p.category,
      image: p.image,
      rating: p.rating,
      description: p.description,
      city: p.city,
      distance_km: p.distance_km,
    }));
  }, [displayItems]);

  const handleMarkerClick = (marker) => {
    setPreviewPlace(marker);
    if (marker.lat && marker.lng) {
      mapRef.current?.centerOn(marker.lat, marker.lng, 14);
    }
  };

  const handleAddToTrip = (place) => {
    setLocalAdded((prev) => [...prev, place]);
    if (tripData?.selectedPlaces) {
      const exists = tripData.selectedPlaces.some((p) => String(p.id) === String(place.id));
      if (!exists) {
        setTripData({
          ...tripData,
          selectedPlaces: [...tripData.selectedPlaces, place],
        });
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-ink-950">
      {/* ================================================================ */}
      {/* LEFT: PROFESSIONAL SIDE PANEL                                    */}
      {/* ================================================================ */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] bg-ink-900 border-r border-white/10 flex flex-col shrink-0 z-20 overflow-hidden shadow-2xl">
        {/* Panel Header & Search */}
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-safari-600/20 border border-safari-500/30 flex items-center justify-center text-safari-300">
                <Compass className="w-4 h-4" />
              </div>
              <h1 className="font-display text-lg font-semibold text-white">Interactive Map</h1>
            </div>
            {routeStops.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-safari-500/15 border border-safari-500/30 text-[10px] font-bold text-safari-300 uppercase tracking-wider">
                Trip Route Active
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attractions, stays, food..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white placeholder-cream/30 text-xs focus:border-safari-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categories Grid (Phase 2D categories) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cream/50">
              <span>Categories</span>
              <span>{displayItems.length} found</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {MAP_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      active
                        ? 'bg-safari-600 text-white shadow-md shadow-safari-900/30'
                        : 'bg-white/5 hover:bg-white/10 text-cream/70 border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Route Anchors (if trip route exists) */}
        {validWaypoints.length > 0 && (
          <div className="px-4 py-2.5 bg-ink-950/60 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-bold text-cream/40 shrink-0">Route:</span>
            {validWaypoints.map((w) => (
              <button
                key={w.name}
                type="button"
                onClick={() => {
                  setSelectedStop(w.name);
                  mapRef.current?.centerOn(w.lat, w.lng, 12);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedStop.toLowerCase() === w.name.toLowerCase()
                    ? 'bg-safari-500/20 text-safari-300 border border-safari-500/40'
                    : 'text-cream/60 hover:text-white'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-white/5">
          {loading ? (
            <div className="py-16 text-center text-xs text-cream/50 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-safari-400" />
              <span>Loading map locations...</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-cream/50 space-y-1">
              <p className="font-semibold text-cream/70">No places found in this view</p>
              <p>Try clearing your search query or choosing another category.</p>
            </div>
          ) : (
            displayItems.map((p) => {
              const isSelected = previewPlace?.name === p.name;
              return (
                <div
                  key={p.id || p.name}
                  onClick={() => handleMarkerClick(p)}
                  className={`pt-2.5 first:pt-0 p-2 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-safari-600/15 border border-safari-500/40'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {p.image ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink-950 shrink-0 border border-white/10">
                      <SmartImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-300 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-display font-semibold text-xs sm:text-sm text-white truncate">
                        {p.name}
                      </h4>
                      {p.rating && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400" /> {p.rating}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-cream/50 flex items-center gap-1 mt-0.5">
                      <span className="truncate">{p.category || p.city || 'Karnataka'}</span>
                      {p.distance_km != null && (
                        <span className="text-safari-300">· {formatDistance(p.distance_km)}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ================================================================ */}
      {/* RIGHT: LEAFLET MAP & PLACE PREVIEW (PHASE 2D)                    */}
      {/* ================================================================ */}
      <main className="flex-1 relative h-full bg-ink-950">
        <MapView
          ref={mapRef}
          height="100%"
          waypoints={validWaypoints}
          selectedPlaces={mapSelectedPlaces}
          fitSignal={fitSignal}
          onMarkerClick={handleMarkerClick}
        />

        {/* Floating Quick Map Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setFitSignal((s) => s + 1)}
            className="px-3.5 py-2 rounded-xl bg-ink-950/90 hover:bg-ink-900 border border-white/15 text-white text-xs font-semibold shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5"
            title="Fit map view to all destinations"
          >
            <Route className="w-3.5 h-3.5 text-safari-400" />
            <span>Reset View</span>
          </button>
        </div>

        {/* Clean Place Preview Card (Phase 2D Requirement) */}
        {previewPlace && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-[400] animate-fade-up">
            <div className="rounded-3xl bg-ink-900/95 border border-safari-500/40 p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {previewPlace.image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-950 shrink-0 border border-white/10">
                      <SmartImage src={previewPlace.image} alt={previewPlace.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-safari-300">
                      {previewPlace.category || 'Tourist Place'}
                    </span>
                    <h3 className="font-display font-semibold text-base text-white leading-snug line-clamp-1">
                      {previewPlace.name}
                    </h3>
                    <p className="text-xs text-cream/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-safari-400" />
                      <span>{previewPlace.city || previewPlace.address || 'Karnataka'}</span>
                      {previewPlace.distance_km != null && (
                        <span>· {formatDistance(previewPlace.distance_km)}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewPlace(null)}
                  className="text-cream/40 hover:text-white p-1 rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewPlace.description && (
                <p className="text-xs text-cream/70 leading-relaxed line-clamp-2">
                  {previewPlace.description}
                </p>
              )}

              {/* Action Buttons: View Details & Add to Trip */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDetailsPlace(previewPlace)}
                  className="flex-1 py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 text-cream text-xs font-semibold transition-colors text-center border border-white/10"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToTrip(previewPlace)}
                  className="flex-1 py-2 px-3 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/40 text-center flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Place Details Modal */}
      {detailsPlace && (
        <PlaceDetailsModal
          place={detailsPlace}
          onClose={() => setDetailsPlace(null)}
          onAddToTrip={(p) => handleAddToTrip(p)}
        />
      )}
    </div>
  );
}
