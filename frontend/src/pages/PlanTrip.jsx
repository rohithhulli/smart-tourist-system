import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route, MapPin, Users, CheckCircle, Plus, Trash2, Navigation,
  Sparkles, Loader2, AlertTriangle, IndianRupee, Calendar,
  RefreshCw, Bookmark, Compass, ArrowRight, Heart, Info,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import DatePicker, { toISODate } from '../components/DatePicker';
import ValidationMessage from '../components/ValidationMessage';
import LocationRecommendationGroup from '../components/LocationRecommendationGroup';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import TripTimeline from '../components/TripTimeline';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const TRAVEL_STYLES = [
  { id: 'Relaxed', label: 'Relaxed', desc: 'Scenic pace, gentle visits' },
  { id: 'Adventure', label: 'Adventure', desc: 'Treks, wildlife & outdoor thrills' },
  { id: 'Cultural', label: 'Cultural', desc: 'History, living arts & traditions' },
  { id: 'Family', label: 'Family', desc: 'Comfortable, kid & elder friendly' },
  { id: 'Spiritual', label: 'Spiritual', desc: 'Sacred temples & peaceful retreats' },
  { id: 'Nature', label: 'Nature', desc: 'Waterfalls, ghats & misty hills' },
  { id: 'Budget', label: 'Budget', desc: 'Smart value, authentic stays' },
  { id: 'Luxury', label: 'Luxury', desc: 'Premium resorts & curated comfort' },
];

const INTERESTS = [
  'Heritage',
  'Nature',
  'Wildlife',
  'Food',
  'Beaches',
  'Adventure',
  'Culture',
  'Spiritual',
];

const POPULAR_START_CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'];
const POPULAR_DESTINATIONS = ['Mysuru', 'Hampi', 'Gokarna', 'Chikkamagaluru', 'Coorg', 'Udupi', 'Badami'];

const UNAVAILABLE_MSG = 'Recommendation service temporarily unavailable. Please try again.';

const dateFromISO = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function PlanTrip() {
  const navigate = useNavigate();
  const { refreshTripsCount } = useAuth();
  const { setTripData, draftTrip, clearDraftTrip, planner, updatePlanner, clearPlanner } = useTrip();

  // Form State
  const [startLocation, setStartLocation] = useState(planner.startLocation ?? 'Bengaluru');
  const [destination, setDestination] = useState(planner.destination ?? 'Mysuru');
  const [stops, setStops] = useState(planner.stops || []);
  const [newStop, setNewStop] = useState('');
  const [startDate, setStartDate] = useState(() => dateFromISO(planner.startDate));
  const [endDate, setEndDate] = useState(() => dateFromISO(planner.endDate));
  const [budget, setBudget] = useState(planner.budget ?? 15000);
  const [travelers, setTravelers] = useState(planner.travelers ?? 2);
  const [travelStyle, setTravelStyle] = useState(planner.travelerType || 'Cultural');
  const [durationDays, setDurationDays] = useState(planner.durationDays ?? '');
  const [interests, setInterests] = useState(planner.interests?.length ? planner.interests : ['Heritage', 'Culture']);

  // Results State
  const [isPlanGenerated, setIsPlanGenerated] = useState(Boolean(planner.isPlanGenerated));
  const [selectedPlaces, setSelectedPlaces] = useState(planner.selectedPlaces || []);
  const [groupedRecommendations, setGroupedRecommendations] = useState(planner.groupedRecommendations || []);
  const [generatedItinerary, setGeneratedItinerary] = useState(planner.itinerary || null);
  const [itineraryStats, setItineraryStats] = useState(planner.stats || null);

  // Status & Modal State
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [itineraryError, setItineraryError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [detailsRec, setDetailsRec] = useState(null);
  const [errors, setErrors] = useState({});

  // Restore Draft Trip from other pages (e.g. from TripDetail "Edit")
  useEffect(() => {
    if (!draftTrip) return;
    setStartLocation(draftTrip.start_location || '');
    setDestination(draftTrip.destination || '');
    setStops(draftTrip.stops || []);
    setBudget(draftTrip.budget ?? 15000);
    setTravelers(draftTrip.travelers ?? 2);
    if (draftTrip.start_date) setStartDate(new Date(`${draftTrip.start_date}T00:00:00`));
    if (draftTrip.end_date) setEndDate(new Date(`${draftTrip.end_date}T00:00:00`));
    setInterests(draftTrip.interests || ['Heritage', 'Culture']);
    if (draftTrip.traveler_type) setTravelStyle(draftTrip.traveler_type);
    setSelectedPlaces(
      (draftTrip.selected_places || []).map((p) => ({
        id: p.id || p.name,
        name: p.name,
        lat: p.lat ?? p.latitude ?? null,
        lng: p.lng ?? p.longitude ?? null,
        category: p.category || 'Tourist',
        image: p.image || null,
        rating: p.rating || 0,
        description: p.description || '',
        estimated_cost: p.estimated_cost || 0,
        city: p.city || '',
        state: p.state || '',
        tripLocation: p.tripLocation || p.city || '',
      }))
    );
    setIsPlanGenerated(false);
    clearDraftTrip();
  }, [draftTrip, clearDraftTrip]);

  // Sync back to planner context for reload resilience
  useEffect(() => {
    updatePlanner({
      startLocation,
      destination,
      stops,
      startDate: toISODate(startDate),
      endDate: toISODate(endDate),
      budget,
      travelers,
      travelerType: travelStyle,
      durationDays,
      interests,
      isPlanGenerated,
      groupedRecommendations,
      selectedPlaces,
      itinerary: generatedItinerary,
      stats: itineraryStats,
    });
  }, [
    startLocation, destination, stops, startDate, endDate, budget, travelers,
    travelStyle, durationDays, interests, isPlanGenerated, groupedRecommendations,
    selectedPlaces, generatedItinerary, itineraryStats, updatePlanner,
  ]);

  const tripLocations = useMemo(() => {
    return [
      startLocation.trim(),
      ...stops.map((s) => s.trim()).filter(Boolean),
      destination.trim(),
    ].filter(Boolean);
  }, [startLocation, stops, destination]);

  const effectiveDuration = useMemo(() => {
    const d = parseInt(durationDays, 10);
    if (!isNaN(d) && d > 0) return d;
    if (startDate && endDate) {
      const diff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff + 1);
    }
    return 3;
  }, [durationDays, startDate, endDate]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date && durationDays) {
      const days = parseInt(durationDays, 10);
      if (!isNaN(days) && days > 0) {
        const nextEnd = new Date(date.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
        setEndDate(nextEnd);
        return;
      }
    }
    if (date && endDate && endDate < date) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate && date && date >= startDate) {
      const diffMs = date.getTime() - startDate.getTime();
      const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const days = nights + 1;
      setDurationDays(String(days));
    }
  };

  const handleDurationDaysChange = (val) => {
    setDurationDays(val);
    const d = parseInt(val, 10);
    if (!isNaN(d) && d > 0 && startDate) {
      const nextEnd = new Date(startDate.getTime() + (d - 1) * 24 * 60 * 60 * 1000);
      setEndDate(nextEnd);
    }
  };

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: null }));
    }
  };

  const handleAddStop = () => {
    const s = newStop.trim();
    if (!s) return;
    if (!stops.includes(s)) {
      setStops((prev) => [...prev, s]);
    }
    setNewStop('');
  };

  const handleRemoveStop = (index) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewTrip = () => {
    if (!window.confirm('Start a new journey plan? This resets the form and clear the current plan.')) {
      return;
    }
    clearPlanner();
    setStartLocation('Bengaluru');
    setDestination('Mysuru');
    setStops([]);
    setNewStop('');
    setStartDate(null);
    setEndDate(null);
    setBudget(15000);
    setTravelers(2);
    setTravelStyle('Cultural');
    setDurationDays('');
    setInterests(['Heritage', 'Culture']);
    setIsPlanGenerated(false);
    setSelectedPlaces([]);
    setGroupedRecommendations([]);
    setGeneratedItinerary(null);
    setItineraryStats(null);
    setErrorMessage('');
    setItineraryError('');
    setSaveError('');
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!startLocation.trim()) errs.startLocation = 'Starting location is required.';
    if (!destination.trim()) errs.destination = 'Destination is required.';
    if (!travelers || Number(travelers) < 1) errs.travelers = 'Must have at least 1 traveler.';
    if (!budget || Number(budget) <= 0) errs.budget = 'Please specify a positive budget.';
    if (interests.length === 0) errs.interests = 'Select at least one travel interest.';
    return errs;
  };

  const handleCreateTrip = async (e) => {
    if (e) e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoadingPlaces(true);
    setErrorMessage('');
    setGeneratedItinerary(null);
    setItineraryStats(null);
    setItineraryError('');
    setIsPlanGenerated(true);

    const payload = {
      destination: destination.trim(),
      start_location: startLocation.trim(),
      stops: stops.map((s) => s.trim()).filter(Boolean),
      interests,
      categories: interests,
      activities: [],
      budget: Number(budget) || 15000,
      travelers: Number(travelers) || 2,
      traveler_type: travelStyle.toLowerCase(),
      duration_days: effectiveDuration,
      start_date: toISODate(startDate),
      end_date: toISODate(endDate),
      top_n: 12,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/planner/recommend`, payload);
      setGroupedRecommendations(res.data.locations || []);
      setSelectedPlaces([]);
      setErrorMessage('');
    } catch (err) {
      console.error('Recommendation API error:', err);
      setGroupedRecommendations([]);
      setSelectedPlaces([]);
      setErrorMessage(UNAVAILABLE_MSG);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const togglePlaceSelection = (rec, tripLocation = '') => {
    const place = rec.place || rec;
    const exists = selectedPlaces.some((p) => p.id === place.id);
    if (exists) {
      setSelectedPlaces((prev) => prev.filter((p) => p.id !== place.id));
    } else {
      const normalized = {
        id: place.id || place.name,
        name: place.name,
        lat: place.latitude ?? place.lat ?? null,
        lng: place.longitude ?? place.lng ?? null,
        category: (place.category || 'tourist').toString(),
        image: place.image || null,
        rating: place.rating || 0,
        description: place.description || '',
        estimated_cost: place.estimated_cost || 0,
        city: place.city || '',
        state: place.state || '',
        tags: place.tags || [],
        tripLocation: tripLocation || place.city || '',
      };
      setSelectedPlaces((prev) => [...prev, normalized]);
    }
  };

  const buildMapTripData = () => {
    const groups =
      groupedRecommendations.length > 0
        ? groupedRecommendations
        : tripLocations.map((name) => ({
            location: name,
            coords: null,
            location_type: '',
            resolved: false,
            recommendations: [],
            message: '',
          }));

    const waypoints = groups.map((g, i) => ({
      name: g.location,
      stop_number: i + 1,
      lat: g.coords ? g.coords[0] : null,
      lng: g.coords ? g.coords[1] : null,
      description:
        g.location_type === 'start'
          ? 'Starting point'
          : g.location_type === 'destination'
          ? 'Final destination'
          : `Stop ${i + 1} · ${g.location}`,
      category: g.location_type || 'stop',
      stopType: g.location_type || 'stop',
    }));

    return {
      startLocation,
      destination,
      stops,
      routeStops: tripLocations,
      waypoints,
      selectedPlaces,
      groupedRecommendations,
      itinerary: generatedItinerary,
      stats: itineraryStats || null,
    };
  };

  const handleGenerateItinerary = async () => {
    if (selectedPlaces.length === 0) {
      setItineraryError('Select at least one recommended place above to generate an itinerary.');
      return;
    }

    setLoadingItinerary(true);
    setItineraryError('');

    const payload = {
      destination: destination.trim(),
      start_location: startLocation.trim(),
      stops: stops.map((s) => s.trim()).filter(Boolean),
      interests,
      categories: interests,
      activities: [],
      budget: Number(budget) || 15000,
      travelers: Number(travelers) || 2,
      duration_days: effectiveDuration,
      start_date: toISODate(startDate),
      end_date: toISODate(endDate),
      place_ids: selectedPlaces.map((p) => p.id),
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/planner/itinerary`, payload);
      setGeneratedItinerary(res.data.days || []);
      const stats = {
        totalDistanceKm: Math.round(res.data.total_distance_km || 0),
        totalCost: res.data.total_cost || 0,
        durationDays: res.data.duration_days || effectiveDuration,
        selectedCount: res.data.total_places || selectedPlaces.length,
      };
      setItineraryStats(stats);

      if (setTripData) {
        const mapData = buildMapTripData();
        mapData.itinerary = res.data.days;
        mapData.stats = stats;
        setTripData(mapData);
      }
    } catch (err) {
      console.error('Itinerary API error:', err);
      setGeneratedItinerary(null);
      setItineraryStats(null);
      setItineraryError(UNAVAILABLE_MSG);
    } finally {
      setLoadingItinerary(false);
    }
  };

  const handleSaveTrip = async () => {
    if (selectedPlaces.length === 0) return;
    setSaveError('');

    const payload = {
      title: `${startLocation} → ${destination}`,
      start_location: startLocation,
      destination,
      stops,
      dates: startDate && endDate ? `${toISODate(startDate)} → ${toISODate(endDate)}` : '',
      budget: Number(budget) || 0,
      travelers: Number(travelers) || 1,
      start_date: startDate ? toISODate(startDate) : null,
      end_date: endDate ? toISODate(endDate) : null,
      duration_days: effectiveDuration,
      interests,
      categories: interests,
      activities: [],
      selected_places: selectedPlaces,
      cover_image: selectedPlaces[0]?.image || null,
      status: 'Active',
      itinerary: generatedItinerary ? { days: generatedItinerary } : null,
      route: {
        routeStops: tripLocations,
        waypoints: buildMapTripData().waypoints,
        stats: itineraryStats,
      },
    };

    try {
      await axios.post(`${API_BASE_URL}/api/trips/`, payload, {
        withCredentials: true,
        timeout: 8000,
      });
      await refreshTripsCount();
      setTripData(buildMapTripData());
      navigate('/my-trips');
    } catch (err) {
      console.error('Backend save failed:', err);
      setSaveError(
        err.response?.status === 401
          ? 'Your session has expired. Please log in again to save the trip.'
          : 'Could not save the trip right now. Please try again.'
      );
    }
  };

  const handleViewMap = () => {
    setTripData(buildMapTripData());
    navigate('/map');
  };

  const handleViewPlaceOnMap = (rec) => {
    const place = rec.place || rec;
    const mapData = buildMapTripData();
    const key = (x) => String(x.id || x.name);
    const exists = mapData.selectedPlaces.some((p) => key(p) === key(place));
    if (!exists) {
      mapData.selectedPlaces.push({
        id: place.id || place.name,
        name: place.name,
        lat: place.latitude ?? place.lat ?? null,
        lng: place.longitude ?? place.lng ?? null,
        category: place.category || 'Tourist',
        image: place.image || null,
        rating: place.rating || 0,
        description: place.description || '',
        city: place.city || '',
        state: place.state || '',
      });
    }
    mapData.focusPlace = mapData.selectedPlaces.find((p) => key(p) === key(place));
    setTripData(mapData);
    navigate('/map');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <PageHeader
        eyebrow="Smart Travel Planning"
        title="Plan Your Journey"
        subtitle="Tell us where you're going, what you enjoy, and how you want to travel."
      >
        <button
          type="button"
          onClick={handleNewTrip}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cream/70 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </PageHeader>

      {/* ================================================================ */}
      {/* SECTION 1–7 STRUCTURED FORM (PHASE 2A)                           */}
      {/* ================================================================ */}
      <form onSubmit={handleCreateTrip} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Routing & Timing & Budget */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Starting Location */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Starting Location</h2>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-safari-400" />
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => {
                      setStartLocation(e.target.value);
                      if (errors.startLocation) setErrors((prev) => ({ ...prev, startLocation: null }));
                    }}
                    placeholder="e.g. Bengaluru, Hubballi, Mysuru..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white placeholder-cream/30 text-sm outline-none transition-colors"
                  />
                </div>
                {errors.startLocation && <p className="text-xs text-sunset-400 pl-2">{errors.startLocation}</p>}

                {/* Quick Starting Points */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-cream/50">
                  <span className="text-[11px]">Popular:</span>
                  {POPULAR_START_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setStartLocation(c)}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                        startLocation.toLowerCase() === c.toLowerCase()
                          ? 'bg-safari-500/20 border-safari-400 text-safari-300'
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-cream/70'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Destination */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Destination</h2>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-safari-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (errors.destination) setErrors((prev) => ({ ...prev, destination: null }));
                    }}
                    placeholder="e.g. Mysuru, Hampi, Gokarna, Coorg..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white placeholder-cream/30 text-sm outline-none transition-colors"
                  />
                </div>
                {errors.destination && <p className="text-xs text-sunset-400 pl-2">{errors.destination}</p>}

                {/* Quick Destinations */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-cream/50">
                  <span className="text-[11px]">Popular:</span>
                  {POPULAR_DESTINATIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDestination(c)}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                        destination.toLowerCase() === c.toLowerCase()
                          ? 'bg-safari-500/20 border-safari-400 text-safari-300'
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-cream/70'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Via Locations */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-safari-300">
                  <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h2 className="font-display text-lg font-semibold text-white">Via Locations (Stops along the way)</h2>
                </div>
                <span className="text-xs text-cream/40">{stops.length} added</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStop}
                  onChange={(e) => setNewStop(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStop();
                    }
                  }}
                  placeholder="Add an intermediate stop (e.g. Srirangapatna, Hassan)..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white placeholder-cream/30 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-safari-600 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Stop
                </button>
              </div>

              {stops.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {stops.map((stop, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-safari-500/10 border border-safari-500/30 text-xs text-safari-200"
                    >
                      <span className="text-[10px] opacity-60 font-bold">Stop {idx + 1}:</span>
                      <span>{stop}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="hover:text-sunset-400 transition-colors ml-1"
                        aria-label={`Remove ${stop}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Travel Dates & Duration */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Travel Dates &amp; Duration</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wider mb-2">
                    Dates
                  </label>
                  <DatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wider mb-2">
                    Total Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={durationDays || effectiveDuration}
                    onChange={(e) => handleDurationDaysChange(e.target.value)}
                    placeholder={`${effectiveDuration} days`}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white placeholder-cream/30 text-sm outline-none"
                  />
                  <p className="text-[11px] text-safari-300 font-medium mt-1">
                    {effectiveDuration} Day(s) · {Math.max(0, effectiveDuration - 1)} Night(s)
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Budget & Travelers */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Budget &amp; Travelers</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wider mb-2">
                    Estimated Budget (₹ INR)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-safari-400" />
                    <input
                      type="number"
                      step="500"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        if (errors.budget) setErrors((prev) => ({ ...prev, budget: null }));
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white text-sm outline-none font-semibold"
                    />
                  </div>
                  {errors.budget && <p className="text-xs text-sunset-400 mt-1">{errors.budget}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream/70 uppercase tracking-wider mb-2">
                    Number of Travelers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-safari-400" />
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={travelers}
                      onChange={(e) => {
                        setTravelers(e.target.value);
                        if (errors.travelers) setErrors((prev) => ({ ...prev, travelers: null }));
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-ink-900 border border-white/10 focus:border-safari-400 text-white text-sm outline-none font-semibold"
                    />
                  </div>
                  {errors.travelers && <p className="text-xs text-sunset-400 mt-1">{errors.travelers}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Travel Style & Interests (Phase 2A requirements) */}
          <div className="space-y-6">
            {/* 6. Travel Style */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  6
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Travel Style</h2>
              </div>
              <p className="text-xs text-cream/50">Pick how you love to explore:</p>

              <div className="grid grid-cols-1 gap-2.5">
                {TRAVEL_STYLES.map((style) => {
                  const active = travelStyle.toLowerCase() === style.id.toLowerCase();
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        active
                          ? 'bg-safari-600/20 border-safari-400 shadow-md shadow-safari-900/30'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-sm text-white">{style.label}</span>
                        {active && <CheckCircle className="w-4 h-4 text-safari-400" />}
                      </div>
                      <p className="text-[11px] text-cream/50 mt-0.5">{style.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Interests */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-2 text-safari-300">
                <div className="w-7 h-7 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-xs font-bold">
                  7
                </div>
                <h2 className="font-display text-lg font-semibold text-white">Interests</h2>
              </div>
              <p className="text-xs text-cream/50">Select all that excite you:</p>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const active = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? 'bg-safari-600 text-white border-safari-500 shadow-md shadow-safari-900/30'
                          : 'bg-white/5 border-white/10 text-cream/70 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
              {errors.interests && <p className="text-xs text-sunset-400">{errors.interests}</p>}
            </div>

            {/* Main Submit CTA */}
            <div className="rounded-3xl border border-safari-500/30 bg-safari-950/20 p-6 space-y-4 text-center">
              <button
                type="submit"
                disabled={loadingPlaces}
                className="w-full py-4 px-6 rounded-full bg-safari-600 hover:bg-safari-500 text-white font-display font-semibold text-base shadow-xl shadow-safari-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingPlaces ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Discovering Attractions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-sunset-300" />
                    <span>Create My Trip</span>
                  </>
                )}
              </button>
              <p className="text-xs text-cream/50">
                Instantly recommends verified places along your route without leaving this page.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* ================================================================ */}
      {/* ERROR & LOADING STATES                                           */}
      {/* ================================================================ */}
      {loadingPlaces && (
        <LoadingState
          message="Discovering authentic places..."
          subtitle={`Curating recommendations from ${startLocation} to ${destination} across ${interests.join(', ')}`}
        />
      )}

      {errorMessage && (
        <ErrorState
          title="Unable to load recommendations"
          message={errorMessage}
          onRetry={handleCreateTrip}
        />
      )}

      {/* ================================================================ */}
      {/* PHASE 2B — RECOMMENDATION RESULTS                                */}
      {/* ================================================================ */}
      {isPlanGenerated && !loadingPlaces && groupedRecommendations.length > 0 && (
        <section className="pt-8 space-y-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400 mb-2">
                Handpicked Destinations
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                Your Personalized Journey
              </h2>
              <p className="text-sm text-cream/60 mt-1 max-w-xl">
                Choose the spots you want to visit, then click "Generate Smart Itinerary" to build your day-by-day travel timeline.
              </p>
            </div>

            {/* Selection Counter & Generate Action */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <span className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-safari-300">
                {selectedPlaces.length} Selected
              </span>
              <button
                type="button"
                onClick={handleGenerateItinerary}
                disabled={selectedPlaces.length === 0 || loadingItinerary}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-xl shadow-safari-900/50 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loadingItinerary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Building Timeline...</span>
                  </>
                ) : (
                  <>
                    <Route className="w-4 h-4" />
                    <span>Generate Smart Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {itineraryError && (
            <div className="p-4 rounded-2xl bg-sunset-500/10 border border-sunset-500/20 text-xs text-sunset-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{itineraryError}</span>
            </div>
          )}

          {/* Grouped Recommendation Cards */}
          <div className="space-y-12">
            {groupedRecommendations.map((group) => (
              <LocationRecommendationGroup
                key={group.location}
                group={group}
                selectedPlaces={selectedPlaces}
                onToggleSelect={togglePlaceSelection}
                onViewDetails={(rec) => setDetailsRec(rec)}
                onViewOnMap={(rec) => handleViewPlaceOnMap(rec)}
              />
            ))}
          </div>

          {/* Floating / Sticky Bottom Bar if places selected */}
          {selectedPlaces.length > 0 && (
            <div className="sticky bottom-6 z-30 p-4 rounded-3xl bg-ink-950/95 backdrop-blur-md border border-safari-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-safari-600/20 border border-safari-500/30 flex items-center justify-center text-safari-300 font-bold">
                  {selectedPlaces.length}
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-sm">
                    {selectedPlaces.length} place{selectedPlaces.length > 1 ? 's' : ''} in your travel roster
                  </p>
                  <p className="text-xs text-cream/50">
                    Ready to sequence into a day-by-day itinerary
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleViewMap}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cream"
                >
                  Preview on Map
                </button>
                <button
                  type="button"
                  onClick={handleGenerateItinerary}
                  disabled={loadingItinerary}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-lg shadow-safari-900/40 flex items-center justify-center gap-1.5"
                >
                  {loadingItinerary ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Route className="w-4 h-4" />
                  )}
                  <span>Generate Itinerary</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/* PHASE 2C — ITINERARY (DAY 1, DAY 2, DAY 3 TIMELINE)             */}
      {/* ================================================================ */}
      {loadingItinerary && (
        <LoadingState
          message="Building your journey..."
          subtitle="Calculating travel distances, visiting hours and sequencing optimal stops"
        />
      )}

      {generatedItinerary && !loadingItinerary && (
        <section className="pt-10 space-y-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400 mb-2">
                Travel Schedule
              </p>
              <h2 className="font-display text-3xl font-semibold text-white">
                Your Complete Itinerary
              </h2>
              <p className="text-sm text-cream/60 mt-1 max-w-xl">
                Structured day-by-day travel plan with morning, afternoon and evening recommendations.
              </p>
            </div>

            {/* Save Trip Button */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleViewMap}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
              >
                <Navigation className="w-4 h-4 text-safari-400" />
                <span>View Route on Map</span>
              </button>
              <button
                type="button"
                onClick={handleSaveTrip}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-xl shadow-safari-900/50"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Trip to My Trips</span>
              </button>
            </div>
          </div>

          {saveError && (
            <div className="p-4 rounded-2xl bg-sunset-500/10 border border-sunset-500/20 text-xs text-sunset-300">
              {saveError}
            </div>
          )}

          {/* Stats Bar */}
          {itineraryStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/10">
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-wider">Duration</p>
                <p className="font-display text-2xl font-semibold text-white mt-0.5">
                  {itineraryStats.durationDays} Days
                </p>
              </div>
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-wider">Total Route</p>
                <p className="font-display text-2xl font-semibold text-safari-300 mt-0.5">
                  ~{itineraryStats.totalDistanceKm} km
                </p>
              </div>
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-wider">Destinations</p>
                <p className="font-display text-2xl font-semibold text-white mt-0.5">
                  {itineraryStats.selectedCount} Stops
                </p>
              </div>
              <div>
                <p className="text-xs text-cream/50 uppercase tracking-wider">Est. Budget</p>
                <p className="font-display text-2xl font-semibold text-sunset-300 mt-0.5">
                  ₹{Number(itineraryStats.totalCost || budget).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Timeline View */}
          <TripTimeline
            itinerary={generatedItinerary}
            onOpenMapPlace={(place) => handleViewPlaceOnMap({ place })}
          />
        </section>
      )}

      {/* Place Details Modal */}
      {detailsRec && (
        <PlaceDetailsModal
          place={detailsRec.place || detailsRec}
          rec={detailsRec}
          onClose={() => setDetailsRec(null)}
          onAddToTrip={(p) => togglePlaceSelection({ place: p }, detailsRec.tripLocation)}
        />
      )}
    </div>
  );
}
