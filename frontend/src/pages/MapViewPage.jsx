import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, MapPin, Star, Clock3, Navigation, Flag, Route, ArrowRight, ListOrdered, Focus, X, Clock, Plus, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import MapView from '../components/MapView';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import { useTrip } from '../context/TripContext';
import { haversineKm, formatDistance } from '../utils/places';
import { API_BASE_URL } from '../config';
import SmartImage from '../components/SmartImage';

const CATEGORY_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Temple', value: 'Temple' },
  { label: 'Heritage', value: 'Heritage' },
  { label: 'Monument', value: 'Monument' },
  { label: 'Nature', value: 'Nature' },
  { label: 'Waterfall', value: 'Waterfall' },
  { label: 'Wildlife', value: 'Wildlife' },
  { label: 'Beach', value: 'Beach' },
  { label: 'Food', value: 'Food' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Trekking', value: 'Trekking' },
  { label: 'Museum', value: 'Museum' },
  { label: 'Garden', value: 'Garden' },
  { label: 'Hill Station', value: 'Hill Station' },
];

export default function MapViewPage() {
  const navigate = useNavigate();
  const { tripData } = useTrip();

  const routeStops = useMemo(
    () => (tripData?.routeStops && tripData.routeStops.length ? tripData.routeStops.filter(Boolean) : []),
    [tripData]
  );

  const selectedPlaces = useMemo(
    () => (tripData?.selectedPlaces && tripData.selectedPlaces.length ? tripData.selectedPlaces : []),
    [tripData]
  );

  const [selectedStop, setSelectedStop] = useState(routeStops[0] || '');
  const [activePlace, setActivePlace] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fitSignal, setFitSignal] = useState(0);
  const [mapSelected, setMapSelected] = useState(null);
  const [detailsPlace, setDetailsPlace] = useState(null);
  const [localAdded, setLocalAdded] = useState([]);
  const mapRef = useRef(null);

  const [livePlaces, setLivePlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedStop(routeStops[0] || '');
    setFitSignal((s) => s + 1);
  }, [routeStops]);

  // Center on a specific place (from "View on Map" actions or Nearby Places).
  useEffect(() => {
    const target = tripData?.focusPlace;
    if (target && target.lat != null && target.lng != null) {
      setMapSelected({ type: 'place', data: target });
      setActivePlace(target.name);
      const t = setTimeout(() => mapRef.current?.centerOn(target.lat, target.lng, 14), 500);
      return () => clearTimeout(t);
    }
    if (tripData?.fromNearby && validWaypoints.length > 0) {
      const last = validWaypoints[validWaypoints.length - 1];
      if (last && last.lat != null && last.lng != null) {
        setMapSelected({ type: 'place', data: last });
        setActivePlace(last.name);
        const t = setTimeout(() => mapRef.current?.centerOn(last.lat, last.lng, 14), 500);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripData?.focusPlace, tripData?.fromNearby]);

  const placesInTrip = useMemo(() => {
    const merged = [...selectedPlaces, ...localAdded];
    const seen = new Set();
    return merged.filter((p) => {
      const key = String(p.id || p.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedPlaces, localAdded]);

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
    // No fabricated waypoints: without trip data the map simply shows its
    // default view (Karnataka), and an honest empty-state panel is rendered.
    return [];
  }, [tripData, routeStops]);

  const validWaypoints = useMemo(() => waypoints.filter((w) => w.lat != null && w.lng != null), [waypoints]);

  useEffect(() => {
    const fetchPlaces = async () => {
      const stopData = waypoints.find((w) => w.name === selectedStop) || waypoints[0];
      if (!stopData || !stopData.lat || !stopData.lng) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({ lat: stopData.lat, lng: stopData.lng });
        if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
        const res = await fetch(`${API_BASE_URL}/api/places/?${params.toString()}`);
        const data = await res.json();
        if (data.status === 'success') {
          setLivePlaces(data.data);
        }
      } catch (err) {
        console.error('Error fetching live places:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [selectedStop, activeCategory, waypoints]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return livePlaces.filter((item) => {
      const matchesQuery =
        !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesQuery;
    });
  }, [livePlaces, searchQuery]);

  const totalDistanceKm = useMemo(() => {
    if (tripData?.stats?.totalDistanceKm) return tripData.stats.totalDistanceKm;
    let total = 0;
    for (let i = 1; i < validWaypoints.length; i++) {
      total += haversineKm(
        validWaypoints[i - 1].lat,
        validWaypoints[i - 1].lng,
        validWaypoints[i].lat,
        validWaypoints[i].lng
      );
    }
    return Math.round(total);
  }, [validWaypoints, tripData]);

  const durationLabel = useMemo(() => {
    if (tripData?.stats?.durationDays) return `${tripData.stats.durationDays} days`;
    return '—';
  }, [tripData]);

  const startName = routeStops[0] || 'Start';
  const endName = routeStops[routeStops.length - 1] || 'Destination';
  const viaStops = routeStops.slice(1, -1);

  const handleStopChip = (stop) => {
    setSelectedStop(stop);
    const w = waypoints.find((x) => x.name === stop);
    if (w && w.lat != null && w.lng != null) {
      mapRef.current?.centerOn(w.lat, w.lng, 11);
    }
  };

  const handleMarkerClick = (w) => {
    if (w.source === 'selected') {
      setMapSelected({ type: 'place', data: w });
      setActivePlace(w.name);
      mapRef.current?.centerOn(w.lat, w.lng, 13);
    } else {
      setMapSelected({ type: 'stop', data: w });
      setSelectedStop(w.name);
    }
  };

  const handlePlaceCardClick = (p) => {
    setMapSelected({ type: 'place', data: p });
    setActivePlace(p.name);
    if (p.lat != null && p.lng != null) {
      mapRef.current?.centerOn(p.lat, p.lng, 13);
    }
  };

  const toggleLocalAdd = (p) => {
    const key = String(p.id || p.name);
    setLocalAdded((prev) =>
      prev.some((x) => String(x.id || x.name) === key)
        ? prev.filter((x) => String(x.id || x.name) !== key)
        : [...prev, p]
    );
  };

  const handleStartNavigation = () => {
    if (validWaypoints.length < 2) return;
    const origin = `${validWaypoints[0].lat},${validWaypoints[0].lng}`;
    const destination = `${validWaypoints[validWaypoints.length - 1].lat},${validWaypoints[validWaypoints.length - 1].lng}`;
    const middle = validWaypoints
      .slice(1, -1)
      .map((w) => `${w.lat},${w.lng}`)
      .join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving${
      middle ? `&waypoints=${middle}` : ''
    }`;
    window.open(url, '_blank');
  };

  const buildRouteSummaryText = () => {
    const lines = validWaypoints.map((w, i) => {
      const label = i === 0 ? 'Start' : i === validWaypoints.length - 1 ? 'End' : `Stop ${i + 1}`;
      return `${label}: ${w.name}`;
    });
    return lines.join('\n');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" /> Interactive Map Dashboard
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Map View</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Trip route with numbered stops and your selected places. Click markers or cards to explore.
        </p>
      </div>

      {validWaypoints.length === 0 && selectedPlaces.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
          <h3 className="text-base font-bold text-white">No Trip to Show Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Plan a multi-stop trip or select a nearby place and tap "View on Map" to visualize your route here.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => navigate('/plan-trip')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Plan a Trip
            </button>
            <button
              onClick={() => navigate('/nearby')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Explore Nearby
            </button>
          </div>
        </div>
      ) : (
      <div className="grid xl:grid-cols-[1.25fr_1fr] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Search className="w-4 h-4 text-indigo-400" /> Search
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, hotels or restaurants"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />

            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    activeCategory === category.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {routeStops.map((stop) => (
                <button
                  key={stop}
                  onClick={() => handleStopChip(stop)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                    selectedStop === stop
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-700 bg-slate-950 text-slate-300'
                  }`}
                >
                  {stop}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <MapView
              ref={mapRef}
              waypoints={waypoints}
              selectedPlaces={placesInTrip}
              activeStopName={selectedStop}
              onMarkerClick={handleMarkerClick}
              fitSignal={fitSignal}
              height="440px"
            />
          </div>
        </div>

        {/* RIGHT COLUMN — Trip panel */}
        <div className="space-y-4">
          {/* Clicked marker detail panel (shows ONLY the clicked place) */}
          {mapSelected && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-lg shadow-indigo-500/10">
              {mapSelected.type === 'place' ? (() => {
                const p = mapSelected.data;
                const isInTrip = placesInTrip.some(
                  (x) => String(x.id || x.name) === String(p.id || p.name)
                );
                return (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                        <MapPin className="w-4 h-4" /> Selected Place
                      </div>
                      <button
                        onClick={() => setMapSelected(null)}
                        className="text-slate-500 hover:text-white transition"
                        aria-label="Close panel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {p.image && (
                      <div className="mt-3 h-32 rounded-xl overflow-hidden bg-slate-800">
                        <SmartImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="mt-3 text-lg font-black text-white">{p.name}</h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating || '—'}
                      </span>
                      {p.category && (
                        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 font-semibold text-indigo-300">
                          {p.category}
                        </span>
                      )}
                      {p.distance_km != null && (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-semibold text-emerald-300">
                          {p.distance_km >= 10 ? `${Math.round(p.distance_km)} km` : `${p.distance_km.toFixed(1)} km`}
                        </span>
                      )}
                    </div>

                    {(p.city || p.state) && (
                      <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {p.city}{p.state ? `, ${p.state}` : ''}
                      </p>
                    )}

                    {p.opening_time && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Opening: {p.opening_time}{p.closing_time ? ` – ${p.closing_time}` : ''}</span>
                      </div>
                    )}

                    {p.description && (
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">{p.description}</p>
                    )}

                    <div className="mt-4 grid gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-[11px] font-bold text-white transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Directions
                      </a>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetailsPlace(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 text-[11px] font-bold text-indigo-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Details
                        </button>
                        <button
                          onClick={() => toggleLocalAdd(p)}
                          disabled={isInTrip}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-colors ${
                            isInTrip
                              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 cursor-default'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isInTrip ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isInTrip ? 'In Trip' : 'Add to Trip'}
                        </button>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                      <Flag className="w-4 h-4" /> Route Stop
                    </div>
                    <button
                      onClick={() => setMapSelected(null)}
                      className="text-slate-500 hover:text-white transition"
                      aria-label="Close panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-white">{mapSelected.data.name}</h3>
                  {mapSelected.data.description && (
                    <p className="mt-1 text-xs text-slate-400">{mapSelected.data.description}</p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-500">
                    Stop #{mapSelected.data.stop_number || '—'} · {mapSelected.data.lat}, {mapSelected.data.lng}
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapSelected.data.lat},${mapSelected.data.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-[11px] font-bold text-white transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Directions
                  </a>
                </>
              )}
            </div>
          )}

          {/* Trip Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Route className="w-4 h-4" /> Trip Overview
            </div>

            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Flag className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">{startName}</span>
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="font-bold text-white">{endName}</span>
              </div>

              {viaStops.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="uppercase tracking-wide text-[10px]">Via:</span>
                  {viaStops.map((s, i) => (
                    <React.Fragment key={`${s}-${i}`}>
                      {i > 0 && <span className="text-slate-600">·</span>}
                      <button onClick={() => handleStopChip(s)} className="text-indigo-300 hover:text-indigo-200 font-medium">
                        {s}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#0b0f19] border border-slate-800 p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Distance</p>
                <p className="text-sm font-bold text-white">{totalDistanceKm} km</p>
              </div>
              <div className="rounded-xl bg-[#0b0f19] border border-slate-800 p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Duration</p>
                <p className="text-sm font-bold text-white">{durationLabel}</p>
              </div>
              <div className="rounded-xl bg-[#0b0f19] border border-slate-800 p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Places</p>
                <p className="text-sm font-bold text-emerald-400">{placesInTrip.length}</p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setFitSignal((s) => s + 1)}
                className="flex-1 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 flex items-center justify-center gap-1"
              >
                <Focus className="w-3.5 h-3.5" /> Fit Route
              </button>
              <button
                onClick={handleStartNavigation}
                disabled={validWaypoints.length < 2}
                className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-3 py-2 text-[11px] font-semibold text-white flex items-center justify-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" /> Start Navigation
              </button>
            </div>
          </div>

          {/* Places in Trip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
              <MapPin className="w-4 h-4" /> Places in Your Trip
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">{placesInTrip.length}</span>
            </div>

            {placesInTrip.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-center text-sm text-slate-400">
                No places selected yet. Go to Plan a Trip, select places and click "View Map".
              </div>
            ) : (
              <div className="mt-3 grid gap-2 max-h-[280px] overflow-y-auto pr-1">
                {placesInTrip.map((p, idx) => {
                  const isActive = activePlace === p.name;
                  return (
                    <button
                      key={`${p.id || p.name}-${idx}`}
                      onClick={() => handlePlaceCardClick(p)}
                      className={`text-left rounded-xl border p-2 flex gap-2.5 transition ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                      }`}
                    >
                      {p.image ? (
                        <SmartImage src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" iconClassName="w-4 h-4" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xl">📍</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                            {p.category || 'Tourist'}
                          </span>
                          {p.rating ? <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400" />{p.rating}</span> : null}
                          {p.city ? <span>{p.city}</span> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Route Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <ListOrdered className="w-4 h-4" /> Route Summary
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-slate-300">
              {validWaypoints.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`h-6 w-6 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      i === 0 ? 'bg-emerald-600' : i === validWaypoints.length - 1 ? 'bg-rose-600' : 'bg-indigo-600'
                    } text-white`}
                  >
                    {i === 0 ? 'S' : i === validWaypoints.length - 1 ? 'E' : i + 1}
                  </span>
                  <span className="font-medium text-white">{w.name}</span>
                  {i > 0 && (
                    <span className="text-[10px] text-slate-500 ml-auto">
                      ~{Math.round(haversineKm(validWaypoints[i - 1].lat, validWaypoints[i - 1].lng, w.lat, w.lng))} km
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                alert(buildRouteSummaryText());
              }}
              className="mt-3 w-full rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-200 flex items-center justify-center gap-1"
            >
              <Route className="w-3.5 h-3.5" /> Copy Route Summary
            </button>
          </div>

          {/* Nearby Spots browser */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Compass className="w-4 h-4" /> Nearby {CATEGORY_OPTIONS.find((item) => item.value === activeCategory)?.label || 'Places'}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Showing suggestions for <span className="text-white">{selectedStop}</span>.
            </p>
            <div className="mt-4 grid gap-3">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-400">Loading live data...</div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex gap-3">
                    {item.image ? (
                      <SmartImage src={item.image} alt={item.name} className="h-12 w-12 rounded-2xl object-cover" iconClassName="w-4 h-4" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl">📍</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.category}{item.city ? ` · ${item.city}` : ''}</p>
                        </div>
                        {item.estimated_cost != null && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                            ₹{item.estimated_cost}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        {item.rating ? (
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {item.rating}</span>
                        ) : null}
                        {item.distance_km != null ? (
                          <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> {formatDistance(item.distance_km)}</span>
                        ) : null}
                        {item.opening_time || item.open_time ? (
                          <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {item.opening_time || item.open_time}{item.closing_time || item.close_time ? ` – ${item.closing_time || item.close_time}` : ''}</span>
                        ) : null}
                      </div>
                      {item.description && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.city || ''))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200"
                        >
                          Directions
                        </a>
                        <button
                          onClick={() => handlePlaceCardClick(item)}
                          className="rounded-lg border border-indigo-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-300"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
                  No matching spots found for this filter yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Place Details Modal (from clicked marker) */}
      {detailsPlace && (
        <PlaceDetailsModal
          place={detailsPlace}
          rec={{ recommendation_score: detailsPlace.recommendation_score, distance_km: detailsPlace.distance_km }}
          onClose={() => setDetailsPlace(null)}
        />
      )}
    </div>
  );
}
