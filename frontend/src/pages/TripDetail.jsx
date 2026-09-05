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
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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
        setError(err.response?.status === 404 ? 'Trip not found.' : 'Could not load this trip.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
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
        status: trip.status || 'Active',
      });
    }
  }, [trip, editing]);

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
      setError('Could not delete the trip.');
    }
  };

  const handleDuplicate = async () => {
    const payload = {
      ...trip,
      title: `${trip.title} (Copy)`,
    };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/trips/`, payload, {
        withCredentials: true,
        timeout: 8000,
      });
      await refreshTripsCount();
      if (res.data?.data?.id) {
        navigate(`/my-trips/${res.data.data.id}`);
      } else {
        navigate('/my-trips');
      }
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError('Could not duplicate the trip.');
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    const payload = {
      ...trip,
      title: String(form.title || '').trim() || trip.title,
      start_location: form.start_location,
      destination: form.destination,
      stops: form.stops,
      budget: Number(form.budget) || 0,
      travelers: Number(form.travelers) || null,
      status: form.status,
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
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewMap = () => {
    const waypoints = [
      { name: trip.start_location || 'Start', stop_number: 1, lat: null, lng: null },
      ...(trip.stops || []).map((s, idx) => ({ name: s, stop_number: idx + 2, lat: null, lng: null })),
      { name: trip.destination || 'Destination', stop_number: (trip.stops?.length || 0) + 2, lat: null, lng: null },
    ];

    setTripData({
      startLocation: trip.start_location,
      destination: trip.destination,
      stops: trip.stops || [],
      routeStops: [trip.start_location, ...(trip.stops || []), trip.destination].filter(Boolean),
      waypoints,
      selectedPlaces: trip.selected_places || [],
      itinerary: trip.itinerary?.days || null,
      stats: trip.route?.stats || null,
    });
    navigate('/map');
  };

  if (loading) {
    return <LoadingState message="Loading trip details..." />;
  }

  if (error || !trip) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <ErrorState
          title="Trip not found"
          message={error || 'This journey could not be located.'}
          onRetry={() => navigate('/my-trips')}
        />
      </div>
    );
  }

  const places = trip.selected_places || [];
  const days = trip.itinerary?.days || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Back to Trips Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-trips')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-cream/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-safari-400" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-sunset-400" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-safari-500/20 border border-safari-500/40 text-safari-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Trip details updated successfully!</span>
        </div>
      )}

      {/* Hero Banner with Trip Overview */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-ink-900 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-ink-950">
          {trip.cover_image ? (
            <SmartImage src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-safari-950 to-ink-950 flex items-center justify-center text-safari-400">
              <RouteIcon className="w-16 h-16 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-safari-600/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              {trip.status || 'Active'}
            </span>
            <button
              onClick={handleViewMap}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink-950/80 hover:bg-safari-600 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shadow-lg"
            >
              <Navigation className="w-3.5 h-3.5 text-safari-300" />
              <span>Explore Route on Map</span>
            </button>
          </div>

          {/* Title & Route Anchors */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white leading-tight">
              {trip.title}
            </h1>
            <p className="text-sm text-cream/75 flex items-center gap-2 flex-wrap">
              <MapPin className="w-4 h-4 text-safari-400 shrink-0" />
              <span>{trip.start_location}</span>
              {trip.stops && trip.stops.length > 0 && (
                <span>➔ Via {trip.stops.join(', ')}</span>
              )}
              <span>➔ {trip.destination}</span>
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-white/[0.02] border-t border-white/10 p-5">
          <div className="px-4 py-2">
            <p className="text-xs text-cream/40 uppercase tracking-wider">Travel Dates</p>
            <p className="font-display text-lg font-semibold text-white mt-1">
              {trip.dates || trip.start_date || 'Flexible'}
            </p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-cream/40 uppercase tracking-wider">Estimated Budget</p>
            <p className="font-display text-lg font-semibold text-safari-300 mt-1">
              ₹{Number(trip.budget || 0).toLocaleString()}
            </p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-cream/40 uppercase tracking-wider">Travelers</p>
            <p className="font-display text-lg font-semibold text-white mt-1">
              {trip.travelers || 1} Person(s)
            </p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs text-cream/40 uppercase tracking-wider">Destinations</p>
            <p className="font-display text-lg font-semibold text-sunset-300 mt-1">
              {places.length} Places
            </p>
          </div>
        </div>
      </div>

      {/* Itinerary Timeline */}
      {days.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400">Day-by-Day Plan</p>
              <h2 className="font-display text-2xl font-semibold text-white mt-1">Travel Timeline</h2>
            </div>
          </div>
          <TripTimeline itinerary={days} />
        </section>
      )}

      {/* Selected Places Grid */}
      {places.length > 0 && (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400">Included Spots</p>
            <h2 className="font-display text-2xl font-semibold text-white mt-1">All Places in Trip</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {places.map((place, i) => (
              <PlaceCard key={place.id || i} place={place} />
            ))}
          </div>
        </section>
      )}

      {/* Edit Modal in Unified Ink Styling */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-ink-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-white">Edit Trip Details</h3>
              <button onClick={() => setEditing(false)} className="text-cream/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-cream/70 uppercase font-semibold mb-1">Trip Name</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white focus:border-safari-400 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1">Starting Point</label>
                  <input
                    type="text"
                    value={form.start_location}
                    onChange={(e) => setForm({ ...form, start_location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white focus:border-safari-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white focus:border-safari-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white focus:border-safari-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-cream/70 uppercase font-semibold mb-1">Travelers</label>
                  <input
                    type="number"
                    value={form.travelers}
                    onChange={(e) => setForm({ ...form, travelers: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white focus:border-safari-400 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-cream text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-lg shadow-safari-900/40 flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
