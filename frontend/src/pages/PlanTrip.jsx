import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route,
  MapPin,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Navigation,
  Sparkles,
  Loader2,
  AlertTriangle,
  IndianRupee,
  Calendar,
  RefreshCw,
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

const INTEREST_OPTIONS = [
  'History', 'Heritage', 'Nature', 'Waterfalls', 'Temples', 'Beaches',
  'Trekking', 'Wildlife', 'Food', 'Shopping', 'Adventure', 'Museums',
  'Spiritual', 'Hill Stations',
];

const CATEGORY_OPTIONS = [
  'Heritage', 'Temple', 'Nature', 'Waterfall', 'Wildlife', 'Beach',
  'Trekking', 'Museum', 'Shopping', 'Food', 'Adventure', 'Garden',
  'Monument', 'Hill Station',
];

const ACTIVITY_OPTIONS = [
  'Photography', 'Trekking', 'Temple Darshan', 'Waterfall Viewing', 'Shopping',
  'Street Food', 'Wildlife Safari', 'Boating', 'Camping', 'Sightseeing',
];

const UNAVAILABLE_MSG = 'Recommendation service temporarily unavailable.';
const FIELD_ORDER = ['startLocation', 'destination', 'travelers', 'budget', 'startDate', 'endDate', 'interests', 'categories', 'activities'];

const PlanTrip = () => {
  const navigate = useNavigate();
  const { refreshTripsCount } = useAuth();
  const { setTripData, draftTrip, clearDraftTrip } = useTrip();
  const [isPlanGenerated, setIsPlanGenerated] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Input form state
  const [startLocation, setStartLocation] = useState('Bengaluru');
  const [destination, setDestination] = useState('Mysuru');
  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [budget, setBudget] = useState(18000);
  const [travelers, setTravelers] = useState(2);
  const [durationDays, setDurationDays] = useState('');
  const [interests, setInterests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);

  // Load a saved trip into the planner (from "Edit in Planner" on TripDetail).
  useEffect(() => {
    if (!draftTrip) return;
    setStartLocation(draftTrip.start_location || '');
    setDestination(draftTrip.destination || '');
    setStops(draftTrip.stops || []);
    setBudget(draftTrip.budget ?? 18000);
    setTravelers(draftTrip.travelers ?? 2);
    if (draftTrip.start_date) setStartDate(new Date(`${draftTrip.start_date}T00:00:00`));
    if (draftTrip.end_date) setEndDate(new Date(`${draftTrip.end_date}T00:00:00`));
    setInterests(draftTrip.interests || []);
    setCategories(draftTrip.categories || []);
    setActivities(draftTrip.activities || []);
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

  // Validation
  const [errors, setErrors] = useState({});

  // Results state
  const [recommendations, setRecommendations] = useState([]);
  const [groupedRecommendations, setGroupedRecommendations] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [itineraryStats, setItineraryStats] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState('');
  const [detailsRec, setDetailsRec] = useState(null);
  const [saveError, setSaveError] = useState('');

  const tripLocations = useMemo(() => {
    const ordered = [
      startLocation.trim(),
      ...stops.map((s) => s.trim()).filter(Boolean),
      destination.trim(),
    ].filter(Boolean);
    return ordered;
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

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const errs = {};

    if (!String(startLocation).trim()) errs.startLocation = 'Starting location is required.';

    if (!String(destination).trim()) errs.destination = 'Destination is required.';

    const travelersStr = String(travelers).trim();
    const travelersNum = Number(travelers);
    if (travelersStr === '') {
      errs.travelers = 'Number of travelers is required.';
    } else if (Number.isNaN(travelersNum)) {
      errs.travelers = 'Travelers must be a number.';
    } else if (travelersNum < 1) {
      errs.travelers = 'Travelers must be at least 1.';
    }

    const budgetStr = String(budget).trim();
    const budgetNum = Number(budget);
    if (budgetStr === '') {
      errs.budget = 'Budget is required.';
    } else if (Number.isNaN(budgetNum) || budgetNum <= 0) {
      errs.budget = 'Budget must be a valid positive number.';
    }

    if (!startDate) {
      errs.startDate = 'Start Date is required.';
    } else if (toISODate(startDate) < toISODate(new Date())) {
      errs.startDate = 'Start Date cannot be in the past.';
    }

    if (!endDate) {
      errs.endDate = 'End date is required.';
    } else if (startDate && toISODate(endDate) < toISODate(startDate)) {
      errs.endDate = 'End date must be after the start date.';
    }

    if (interests.length === 0) {
      errs.interests = 'Select at least one interest.';
    }

    if (categories.length === 0) {
      errs.categories = 'Select at least one category.';
    }

    if (activities.length === 0) {
      errs.activities = 'Select at least one activity.';
    }

    return errs;
  };

  const scrollToFirstError = (errs) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el = document.getElementById(`plan-${first}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function' && !el.disabled) el.focus();
    }
  };

  const toggleChip = (list, setList, value, field) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    if (field) clearFieldError(field);
  };

  const handleToggleSelect = (rec, tripLocation = null) => {
    const place = rec.place || rec;
    if (selectedPlaces.some((p) => p.id === (place.id || place.name))) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.id !== (place.id || place.name)));
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
        opening_time: place.opening_time || place.open_time || null,
        closing_time: place.closing_time || place.close_time || null,
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

  const handleViewMap = () => {
    setTripData(buildMapTripData());
    navigate('/map');
  };

  // "View on Map" for a single recommendation: show the whole trip on the
  // map but center on and highlight that specific place.
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

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

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
      categories,
      activities,
      budget: Number(budget) || 0,
      travelers: Number(travelers) || 1,
      duration_days: effectiveDuration,
      start_date: toISODate(startDate),
      end_date: toISODate(endDate),
      top_n: 12,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/planner/recommend`, payload);
      setRecommendations(res.data.recommendations || []);
      setGroupedRecommendations(res.data.locations || []);
      setSelectedPlaces([]);
      setErrorMessage('');
    } catch (err) {
      console.error('Recommendation API error:', err);
      setRecommendations([]);
      setGroupedRecommendations([]);
      setSelectedPlaces([]);
      setErrorMessage(UNAVAILABLE_MSG);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const generateItinerary = async () => {
    if (selectedPlaces.length === 0) {
      setItineraryError('Select at least one recommended place to generate an itinerary.');
      return;
    }

    setLoadingItinerary(true);
    setItineraryError('');

    const payload = {
      destination: destination.trim(),
      start_location: startLocation.trim(),
      stops: stops.map((s) => s.trim()).filter(Boolean),
      interests,
      categories,
      activities,
      budget: Number(budget) || 0,
      travelers: Number(travelers) || 1,
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

  const handleAddStop = () => {
    const s = newStop.trim();
    if (!s) return;
    setStops((prev) => [...prev, s]);
    setNewStop('');
  };

  const handleRemoveStop = (index) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const buildSavePayload = () => ({
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
    categories,
    activities,
    selected_places: selectedPlaces,
    cover_image: selectedPlaces[0]?.image || null,
    status: 'Active',
    itinerary: generatedItinerary ? { days: generatedItinerary } : null,
    route: {
      routeStops: tripLocations,
      waypoints: buildMapTripData().waypoints,
      stats: itineraryStats,
    },
  });

  const handleSaveTrip = async () => {
    if (selectedPlaces.length === 0) return;
    const payload = buildSavePayload();
    setSaveError('');

    try {
      await axios.post(`${API_BASE_URL}/api/trips/`, payload, {
        withCredentials: true,
        timeout: 8000,
      });
    } catch (err) {
      console.error('Backend save failed:', err.message);
      setSaveError(
        err.response?.status === 401
          ? 'Your session has expired. Please log in again to save the trip.'
          : 'Could not save the trip right now. Please try again.'
      );
      return;
    }

    await refreshTripsCount();
    setTripData(buildMapTripData());
    navigate('/my-trips');
  };

  const planDetails = useMemo(() => {
    const b = Number(budget) || 18000;
    return {
      duration: `${effectiveDuration} Days`,
      breakdown: {
        transport: Math.floor(b * 0.3),
        stay: Math.floor(b * 0.4),
        food: Math.floor(b * 0.2),
        misc: b - Math.floor(b * 0.3) - Math.floor(b * 0.4) - Math.floor(b * 0.2),
      },
    };
  }, [budget, effectiveDuration]);

  const groupedSelectedByLocation = useMemo(() => {
    const map = new Map();
    for (const p of selectedPlaces) {
      const loc = p.tripLocation || p.city || 'Selected Places';
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc).push(p);
    }
    return Array.from(map.entries());
  }, [selectedPlaces]);

  const inputClass = (field) =>
    `bg-[#0b0f19] border px-3 py-2 rounded-xl mt-1 text-sm w-full text-white focus:outline-none transition ${
      errors[field] ? 'border-rose-500/70' : 'border-slate-800 focus:border-indigo-500'
    }`;

  const chipGroup = (label, icon, options, list, setList, field) => (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleChip(list, setList, opt, field)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
              list.includes(opt)
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-[#0b0f19] border-slate-700 text-slate-300 hover:border-indigo-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <ValidationMessage message={errors[field]} />
    </div>
  );

  const skeletonCards = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-[#121827] border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
        <div className="h-48 bg-slate-800" />
        <div className="p-4 space-y-2">
          <div className="h-3 w-24 bg-slate-800 rounded" />
          <div className="h-4 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-1/2 bg-slate-800 rounded" />
          <div className="h-3 w-full bg-slate-800 rounded" />
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 space-y-8">

      {/* SECTION 1: Route Input Planner */}
      <div className="bg-[#121827] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
          <Route className="w-6 h-6" /> Plan Your Trip
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="plan-startLocation" className="text-xs font-semibold text-slate-400 uppercase">Starting City / Location</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mt-1 ${errors.startLocation ? 'bg-[#0b0f19] border border-rose-500/70' : 'bg-[#0b0f19] border border-slate-800'}`}>
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                id="plan-startLocation"
                value={startLocation}
                onChange={(e) => {
                  setStartLocation(e.target.value);
                  clearFieldError('startLocation');
                }}
                aria-invalid={!!errors.startLocation}
                aria-describedby={errors.startLocation ? 'plan-startLocation-error' : undefined}
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              />
            </div>
            <ValidationMessage message={errors.startLocation} id="plan-startLocation-error" />
          </div>

          <div>
            <label htmlFor="plan-destination" className="text-xs font-semibold text-slate-400 uppercase">Destination</label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mt-1 ${errors.destination ? 'bg-[#0b0f19] border border-rose-500/70' : 'bg-[#0b0f19] border border-slate-800'}`}>
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <input
                id="plan-destination"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  clearFieldError('destination');
                }}
                aria-invalid={!!errors.destination}
                aria-describedby={errors.destination ? 'plan-destination-error' : undefined}
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              />
            </div>
            <ValidationMessage message={errors.destination} id="plan-destination-error" />
          </div>

          <div>
            <label htmlFor="plan-travelers" className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Travelers
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mt-1 ${errors.travelers ? 'bg-[#0b0f19] border border-rose-500/70' : 'bg-[#0b0f19] border border-slate-800'}`}>
              <input
                id="plan-travelers"
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => {
                  setTravelers(e.target.value);
                  clearFieldError('travelers');
                }}
                aria-invalid={!!errors.travelers}
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              />
            </div>
            <ValidationMessage message={errors.travelers} />
          </div>

          <div>
            <label htmlFor="plan-duration" className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
              <CalendarIcon /> Trip Duration (days)
            </label>
            <div className="mt-1 flex items-center gap-2 bg-[#0b0f19] border border-slate-800 px-3 py-2 rounded-xl">
              <input
                id="plan-duration"
                type="number"
                min="1"
                placeholder="Auto from dates"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              />
            </div>
          </div>

          <DatePicker
            id="plan-startDate"
            label="Start Date"
            placeholder="Select Start Date"
            value={startDate}
            minDate={new Date()}
            error={errors.startDate}
            onChange={(date) => {
              setStartDate(date);
              clearFieldError('startDate');
              if (endDate && date && toISODate(endDate) < toISODate(date)) {
                setEndDate(null);
              }
            }}
          />

          <DatePicker
            id="plan-endDate"
            label="End Date"
            placeholder="Select End Date"
            value={endDate}
            minDate={new Date()}
            disabledBefore={startDate}
            error={errors.endDate}
            onChange={(date) => {
              setEndDate(date);
              clearFieldError('endDate');
            }}
          />

          <div>
            <label htmlFor="plan-budget" className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" /> Estimated Budget (₹)
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mt-1 ${errors.budget ? 'bg-[#0b0f19] border border-rose-500/70' : 'bg-[#0b0f19] border border-slate-800'}`}>
              <input
                id="plan-budget"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  clearFieldError('budget');
                }}
                aria-invalid={!!errors.budget}
                className="bg-transparent border-none focus:outline-none text-sm w-full text-white"
              />
            </div>
            <ValidationMessage message={errors.budget} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Via / Stops (add middle stops)</label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {stops.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#0b1320] border border-slate-800 px-3 py-1 rounded-full text-sm">
                    <span className="text-slate-200">{s}</span>
                    <button type="button" onClick={() => handleRemoveStop(idx)} className="text-slate-400 hover:text-rose-400" aria-label={`Remove stop ${s}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 items-center mt-1">
                <input
                  value={newStop}
                  onChange={(e) => setNewStop(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStop();
                    }
                  }}
                  placeholder="Add stop (e.g., Badami)"
                  className="flex-1 bg-[#0b0f19] border border-slate-800 px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                />
                <button type="button" onClick={handleAddStop} className="px-3 py-2 bg-indigo-600 rounded-xl text-white" aria-label="Add stop">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {chipGroup('Interests', <Sparkles className="w-3.5 h-3.5 text-amber-400" />, INTEREST_OPTIONS, interests, setInterests, 'interests')}
          {chipGroup('Categories', <MapPin className="w-3.5 h-3.5 text-emerald-400" />, CATEGORY_OPTIONS, categories, setCategories, 'categories')}
          {chipGroup('Activities', <CheckCircle className="w-3.5 h-3.5 text-rose-400" />, ACTIVITY_OPTIONS, activities, setActivities, 'activities')}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loadingPlaces}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          {loadingPlaces ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loadingPlaces ? 'Generating Recommendations...' : 'Generate AI Recommendations'}
        </button>
      </div>

      {/* SECTION 2: RESULTS */}
      {isPlanGenerated || loadingPlaces ? (
        <div className="space-y-8">

          {/* Loading state */}
          {loadingPlaces ? (
            <div className="bg-[#121827] border border-slate-800 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center gap-2 text-indigo-400 text-sm font-semibold">
                  <Sparkles className="w-5 h-5 animate-pulse" /> Analyzing your trip...
                </div>
                <div className="mt-4 flex flex-col items-center gap-1.5 text-slate-300 text-sm font-medium">
                  <span className="text-xs text-slate-400">Finding places for:</span>
                  {tripLocations.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                      {tripLocations.map((loc, i) => (
                        <React.Fragment key={`${loc}-${i}`}>
                          {i > 0 && <span className="text-slate-600">↓</span>}
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-200">
                            {loc}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{skeletonCards()}</div>
            </div>
          ) : errorMessage ? (
            /* Error banner (recommendation API unavailable) */
            <div className="bg-[#121827] border border-rose-500/40 rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-white">⚠ {errorMessage}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Please make sure the backend is running, then try again. Your entered values are kept.
                </p>
                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <RefreshIcon /> Retry
                </button>
              </div>
            </div>
          ) : (
            /* 2A. Grouped Recommended Tourist Places */
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className="text-lg font-bold text-slate-200">
                  Recommended Places Along Your Trip
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedPlaces.length > 0 ? `${selectedPlaces.length} places selected` : 'No places selected yet'}
                </span>
              </div>

              {groupedRecommendations.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#121827] p-8 text-center text-sm text-slate-400">
                  No recommendations found. Try different interests or a different destination.
                </div>
              ) : (
                <div className="space-y-10">
                  {groupedRecommendations.map((group, idx) => (
                    <LocationRecommendationGroup
                      key={`${group.location}-${idx}`}
                      group={group}
                      selectedPlaces={selectedPlaces}
                      onToggleSelect={handleToggleSelect}
                      onViewDetails={(rec) => setDetailsRec(rec)}
                      onViewOnMap={handleViewPlaceOnMap}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2B. Trip Summary + Itinerary */}
          {!errorMessage && !loadingPlaces && (
            <div className="bg-[#121827] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-indigo-400 mb-2">Trip Summary</h3>
              <p className="text-sm text-slate-300 mb-4">
                Route: <span className="text-white font-semibold">{startLocation} → {destination}</span>
              </p>

              {groupedSelectedByLocation.length > 0 && (
                <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs uppercase tracking-wide mb-2">
                    <CheckCircle className="w-4 h-4" /> Selected Places by Location
                  </div>
                  <div className="space-y-2">
                    {groupedSelectedByLocation.map(([loc, items]) => (
                      <div key={loc} className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">📍 {loc}</span>
                        {items.map((p) => (
                          <span key={p.id} className="bg-slate-800/70 text-slate-200 px-2 py-0.5 rounded-full border border-slate-700">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Total Distance</span>
                  <p className="text-base font-bold text-slate-100">
                    {itineraryStats ? `${itineraryStats.totalDistanceKm} km` : '—'}
                  </p>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Duration</span>
                  <p className="text-base font-bold text-slate-100">{planDetails.duration}</p>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Selected Spots</span>
                  <p className="text-base font-bold text-emerald-400">{selectedPlaces.length} Spots Added</p>
                </div>
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Est. Budget</span>
                  <p className="text-base font-bold text-slate-100">₹{Number(budget).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid gap-3 mt-4 md:grid-cols-2">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Transport</p>
                  <p className="mt-2 text-sm text-white font-semibold">₹{planDetails.breakdown.transport.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Includes buses, taxis and inter-stop travel.</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Stay</p>
                  <p className="mt-2 text-sm text-white font-semibold">₹{planDetails.breakdown.stay.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Hotel or lodge booking recommendation.</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Food / Shopping</p>
                  <p className="mt-2 text-sm text-white font-semibold">₹{planDetails.breakdown.food.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Meals, snacks and local souvenirs.</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Miscellaneous</p>
                  <p className="mt-2 text-sm text-white font-semibold">₹{planDetails.breakdown.misc.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Tips, entry fees, and buffer expenses.</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={generateItinerary}
                  disabled={loadingItinerary}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {loadingItinerary ? <Loader2 className="w-5 h-5 animate-spin" /> : <Route className="w-5 h-5" />}
                  {loadingItinerary ? 'Building Itinerary...' : generatedItinerary ? 'Regenerate Plan' : 'Generate Plan'}
                </button>
                <button
                  onClick={handleViewMap}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> View Map
                </button>
                <button
                  onClick={handleSaveTrip}
                  disabled={selectedPlaces.length === 0}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Save Trip
                </button>
              </div>

              {itineraryError && (
                <div className="mt-4 rounded-2xl border border-rose-500/40 bg-slate-950/70 p-4 flex items-start gap-3 text-sm text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" /> {itineraryError}
                </div>
              )}

              {saveError && (
                <div className="mt-4 rounded-2xl border border-rose-500/40 bg-slate-950/70 p-4 flex items-start gap-3 text-sm text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" /> {saveError}
                </div>
              )}

              <div className="mt-6 border-t border-slate-800 pt-5 space-y-4">
                <h4 className="text-sm font-bold text-white">Itinerary</h4>
                <div className="space-y-3">
                  {generatedItinerary ? (
                    <TripTimeline itinerary={{ days: generatedItinerary }} />
                  ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                      No generated itinerary yet. Select places and click "Generate Plan" to create a day-wise plan based on selected places.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="h-full min-h-[350px] bg-[#121827] border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            <Route className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No AI Plan Generated Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Enter your trip details and click "Generate AI Recommendations" to see places scored against your interests.
          </p>
        </div>
      )}

      {/* Place Details Modal */}
      {detailsRec && (
        <PlaceDetailsModal
          place={detailsRec.place || detailsRec}
          rec={detailsRec}
          onClose={() => setDetailsRec(null)}
        />
      )}
    </div>
  );
};

const CalendarIcon = () => <Calendar className="w-3.5 h-3.5" />;

const RefreshIcon = () => <RefreshCw className="w-4 h-4" />;

export default PlanTrip;
