import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, IndianRupee, Users, Route as RouteIcon,
  Star, Navigation, Pencil, Trash2, Copy, Check, Loader2, AlertTriangle,
  Bookmark, Sparkles, X, Plus,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import SmartImage from '../components/SmartImage';
import PlaceCard from '../components/PlaceCard';
import TripTimeline from '../components/TripTimeline';

const INTEREST_OPTIONS = [
  'History', 'Heritage', 'Nature', 'Waterfalls', 'Temples', 'Beaches',
  'Trekking', 'Wildlife', 'Food', 'Shopping', 'Adventure', 'Museums',
  'Spiritual', 'Hill Stations',
];

const ACTIVITY_OPTIONS = [
  'Photography', 'Trekking', 'Temple Darshan', 'Waterfall Viewing', 'Shopping',
  'Street Food', 'Wildlife Safari', 'Boating', 'Camping', 'Sightseeing',
];

const CATEGORY_OPTIONS = [
  'Heritage', 'Temple', 'Nature', 'Waterfall', 'Wildlife', 'Beach',
  'Trekking', 'Museum', 'Shopping', 'Food', 'Adventure', 'Garden',
  'Monument', 'Hill Station',
];

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { refreshTripsCount, handleSessionExpired } = useAuth();
  const { setTripData, setDraftTrip } = useTrip();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({});

  const fetchTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/trips/${tripId}`, {
        withCredentials: true,
        timeout: 6000,
      });
      setTrip(res.data?.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.status === 404
          ? 'Trip not found.'
          : 'Could not load this trip. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      setForm({
        title: trip.title || '',
        start_location: trip.start_location || '',
        destination: trip.destination || '',
        stops: trip.stops || [],
        newStop: '',
        travelers: trip.travelers || '',
        budget: trip.budget || '',
        start_date: trip.start_date || '',
        end_date: trip.end_date || '',
        interests: trip.interests || [],
        categories: trip.categories || [],
        activities: trip.activities || [],
        status: trip.status || 'Active',
      });
    }
  }, [trip, editing]);

  const toggleChip = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const addStop = () => {
    const s = String(form.newStop || '').trim();
    if (!s) return;
    setForm((prev) => ({ ...prev, stops: [...prev.stops, s], newStop: '' }));
  };

  const removeStop = (idx) => {
    setForm((prev) => ({ ...prev, stops: prev.stops.filter((_, i) => i !== idx) }));
  };

  const buildMapData = () => {
    const routeStops =
      trip.route?.routeStops ||
      [trip.start_location, ...(trip.stops || []), trip.destination].filter(Boolean);
    return {
      fromNearby: false,
      startLocation: trip.start_location,
      destination: trip.destination,
      stops: trip.stops || [],
      routeStops,
      waypoints: trip.route?.waypoints || [],
      selectedPlaces: trip.selected_places || [],
      groupedRecommendations: [],
      itinerary: trip.itinerary?.days || trip.itinerary || null,
      stats: trip.route?.stats || null,
    };
  };

  const handleViewOnMap = () => {
    setTripData(buildMapData());
    navigate('/map');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete trip "${trip.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        withCredentials: true,
        timeout: 6000,
      });
      await refreshTripsCount();
      navigate('/my-trips');
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      console.error('Error deleting trip:', err);
      setError('Could not delete the trip.');
    }
  };

  const handleDuplicate = async () => {
    const payload = {
      title: `${trip.title} (Copy)`,
      start_location: trip.start_location,
      destination: trip.destination,
      stops: trip.stops || [],
      dates: trip.dates,
      budget: trip.budget,
      travelers: trip.travelers,
      start_date: trip.start_date,
      end_date: trip.end_date,
      duration_days: trip.duration_days,
      interests: trip.interests || [],
      categories: trip.categories || [],
      activities: trip.activities || [],
      selected_places: trip.selected_places || [],
      cover_image: trip.cover_image,
      status: trip.status,
      itinerary: trip.itinerary,
      route: trip.route,
    };
    try {
      await axios.post(`${API_BASE_URL}/api/trips/`, payload, { withCredentials: true, timeout: 8000 });
      await refreshTripsCount();
      navigate('/my-trips');
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      console.error('Error duplicating trip:', err);
      setError('Could not duplicate the trip.');
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    const payload = {
      title: String(form.title || '').trim() || trip.title,
      start_location: form.start_location,
      destination: form.destination,
      stops: form.stops,
      dates: trip.dates,
      budget: Number(form.budget) || 0,
      travelers: Number(form.travelers) || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      duration_days: trip.duration_days,
      interests: form.interests,
      categories: form.categories,
      activities: form.activities,
      selected_places: trip.selected_places || [],
      cover_image: trip.cover_image,
      status: form.status,
      itinerary: trip.itinerary,
      route: trip.route,
    };
    try {
      const res = await axios.put(`${API_BASE_URL}/api/trips/${trip.id}`, payload, {
        withCredentials: true,
        timeout: 8000,
      });
      setTrip(res.data?.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await refreshTripsCount();
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      console.error('Error updating trip:', err);
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 py-20 flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
          <h3 className="text-lg font-bold text-white">{error || 'Trip not found.'}</h3>
          <button
            onClick={() => navigate('/my-trips')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  const places = trip.selected_places || [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-trips')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Back to My Trips"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Bookmark className="w-4 h-4" /> Saved Trip Details
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{trip.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleViewOnMap}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> View on Map
          </button>
          <button
            onClick={() => { setDraftTrip(trip); navigate('/plan-trip'); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-bold rounded-xl transition-colors border border-indigo-500/30"
            title="Load this saved trip into the AI trip planner"
          >
            <RouteIcon className="w-3.5 h-3.5" /> Edit in Planner
          </button>
          <button
            onClick={() => { setEditing((e) => !e); setError(''); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-rose-600/20 text-rose-300 text-xs font-bold rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-2 text-sm text-emerald-300">
          <Check className="w-4 h-4" /> Trip updated successfully.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-center gap-2 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Cover */}
      {trip.cover_image && (
        <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-800">
          <SmartImage src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-md">
            {trip.status || 'Active'}
          </span>
        </div>
      )}

      {editing ? (
        /* ============ EDIT MODE ============ */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
            <Pencil className="w-5 h-5" /> Edit Trip
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option>Active</option>
                <option>Planned</option>
                <option>Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Starting Location</label>
              <input
                value={form.start_location}
                onChange={(e) => setForm({ ...form, start_location: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Destination</label>
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Travelers</label>
              <input
                type="number"
                min="1"
                value={form.travelers}
                onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Start Date</label>
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">End Date</label>
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">Via / Stops</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.stops.map((s, idx) => (
                <span key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-sm text-slate-200">
                  {s}
                  <button type="button" onClick={() => removeStop(idx)} className="text-slate-400 hover:text-rose-400" aria-label={`Remove ${s}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={form.newStop || ''}
                  onChange={(e) => setForm({ ...form, newStop: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStop(); } }}
                  placeholder="Add stop"
                  className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="button" onClick={addStop} className="p-1.5 bg-indigo-600 rounded-full text-white" aria-label="Add stop">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interests
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleChip('interests', opt)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      form.interests.includes(opt) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Categories
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleChip('categories', opt)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      form.categories.includes(opt) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Activities
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleChip('activities', opt)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      form.activities.includes(opt) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveEdit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      ) : (
        /* ============ VIEW MODE ============ */
        <>
          {/* Route + facts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <RouteIcon className="w-4 h-4 text-indigo-400" /> Route
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-emerald-600/15 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-semibold">
                  {trip.start_location || 'Start'}
                </span>
                {trip.stops && trip.stops.length > 0 && trip.stops.map((s) => (
                  <React.Fragment key={s}>
                    <span className="text-slate-500">➔</span>
                    <span className="bg-sky-600/15 text-sky-300 border border-sky-500/40 px-3 py-1 rounded-lg font-semibold">{s}</span>
                  </React.Fragment>
                ))}
                <span className="text-slate-500">➔</span>
                <span className="bg-rose-600/15 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-lg font-semibold">
                  {trip.destination}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Dates</p>
                  <p className="text-sm font-bold text-slate-200 mt-1">{trip.dates || '—'}</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> Travelers</p>
                  <p className="text-sm font-bold text-slate-200 mt-1">{trip.travelers || '—'}</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Budget</p>
                  <p className="text-sm font-bold text-indigo-400 mt-1">₹{(trip.budget || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3">
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><Bookmark className="w-3 h-3" /> Places</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{places.length}</p>
                </div>
              </div>

              {(trip.interests?.length > 0 || trip.categories?.length > 0 || trip.activities?.length > 0) && (
                <div className="mt-4 space-y-2">
                  {trip.interests?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-semibold">Interests:</span>
                      {trip.interests.map((i) => (
                        <span key={i} className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">{i}</span>
                      ))}
                    </div>
                  )}
                  {trip.categories?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-semibold">Categories:</span>
                      {trip.categories.map((c) => (
                        <span key={c} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                  {trip.activities?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-semibold">Activities:</span>
                      {trip.activities.map((a) => (
                        <span key={a} className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="mt-4 text-[10px] text-slate-500">
                Created {formatDate(trip.created_at)} · Updated {formatDate(trip.updated_at)}
              </p>
            </div>

            {/* Route summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-amber-400" /> Route Summary
              </h2>
              {trip.route?.stats ? (
                <div className="space-y-2 text-xs">
                  {trip.route.stats.totalDistanceKm != null && (
                    <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="font-bold text-slate-200">{trip.route.stats.totalDistanceKm} km</span></div>
                  )}
                  {trip.route.stats.durationDays != null && (
                    <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="font-bold text-slate-200">{trip.route.stats.durationDays} days</span></div>
                  )}
                  {trip.route.stats.totalCost != null && (
                    <div className="flex justify-between"><span className="text-slate-400">Est. Cost</span><span className="font-bold text-indigo-400">₹{Math.round(trip.route.stats.totalCost).toLocaleString()}</span></div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No route stats saved for this trip.</p>
              )}
            </div>
          </div>

          {/* Selected places */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-400" /> Selected Places ({places.length})
            </h2>
            {places.length === 0 ? (
              <p className="text-xs text-slate-500">No places were selected for this trip.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {places.map((p) => (
                  <PlaceCard key={p.id || p.name} place={p} />
                ))}
              </div>
            )}
          </div>

          {/* Itinerary */}
          {trip.itinerary && (trip.itinerary.days || Array.isArray(trip.itinerary)) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <RouteIcon className="w-4 h-4 text-emerald-400" /> Day-wise Itinerary
              </h2>
              <TripTimeline itinerary={trip.itinerary} />
            </div>
          )}

          {/* Waypoints summary */}
          {trip.route?.waypoints?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-indigo-400" /> Waypoints ({trip.route.waypoints.length})
              </h2>
              <div className="space-y-1.5 text-sm text-slate-300">
                {trip.route.waypoints.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`h-6 w-6 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 0 ? 'bg-emerald-600' : i === trip.route.waypoints.length - 1 ? 'bg-rose-600' : 'bg-indigo-600'} text-white`}>
                      {i === 0 ? 'S' : i === trip.route.waypoints.length - 1 ? 'E' : i + 1}
                    </span>
                    <span className="font-medium text-white">{w.name}</span>
                    {w.lat != null && <span className="text-[10px] text-slate-500 ml-auto">{w.lat.toFixed(4)}, {w.lng.toFixed(4)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
