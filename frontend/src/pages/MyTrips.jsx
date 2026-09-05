import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, Calendar, MapPin, IndianRupee, Trash2, Route,
  Users, Eye, Loader2, AlertTriangle, Copy, Pencil, Navigation,
  Plus, Check, ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import SmartImage from '../components/SmartImage';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MyTrips() {
  const navigate = useNavigate();
  const { refreshTripsCount, handleSessionExpired } = useAuth();
  const { setDraftTrip, setTripData } = useTrip();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/trips/`, {
        withCredentials: true,
        timeout: 6000,
      });
      setTrips(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Could not load your trips. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (trip) => {
    if (!window.confirm(`Delete trip "${trip.title}"? This action cannot be undone.`)) return;
    setActionId(trip.id);
    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        withCredentials: true,
        timeout: 6000,
      });
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      await refreshTripsCount();
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError('Could not delete the trip. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  const handleDuplicate = async (trip) => {
    setActionId(trip.id);
    try {
      const copyPayload = {
        ...trip,
        title: `${trip.title} (Copy)`,
      };
      delete copyPayload.id;
      delete copyPayload.created_at;
      delete copyPayload.updated_at;

      const res = await axios.post(`${API_BASE_URL}/api/trips/`, copyPayload, {
        withCredentials: true,
        timeout: 6000,
      });
      await refreshTripsCount();
      await fetchTrips();
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError('Could not duplicate this trip.');
    } finally {
      setActionId(null);
    }
  };

  const handleEdit = (trip) => {
    setDraftTrip(trip);
    navigate('/plan-trip');
  };

  const handleViewMap = (trip) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header (Phase 2F Requirement) */}
      <PageHeader
        eyebrow="Saved Itineraries"
        title="My Trips"
        subtitle="Your journeys, saved in one place."
      >
        <button
          onClick={() => navigate('/plan-trip')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40"
        >
          <Route className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </PageHeader>

      {error && (
        <ErrorState message={error} onRetry={fetchTrips} />
      )}

      {loading ? (
        <LoadingState
          message="Loading your trips..."
          subtitle="Gathering your saved routes, dates and itinerary details"
        />
      ) : trips.length === 0 ? (
        /* Empty State (Phase 2F Requirement) */
        <EmptyState
          icon={Bookmark}
          title="No trips yet."
          description="Your next adventure starts with a plan. Create and customize a multi-day itinerary across Karnataka."
          actionLabel="Plan Your First Trip"
          onAction={() => navigate('/plan-trip')}
        />
      ) : (
        /* Trip Cards Grid (Phase 2F Requirement: Name, Start, Dest, Dates, Places, Budget, Actions) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const placeCount = (trip.selected_places || []).length;
            const isProcessing = actionId === trip.id;

            return (
              <div
                key={trip.id}
                className="group rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
              >
                <div>
                  {/* Trip Cover Image & Status Badge */}
                  <div className="relative h-44 bg-ink-900 overflow-hidden">
                    {trip.cover_image ? (
                      <SmartImage
                        src={trip.cover_image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-safari-950 to-ink-950 flex items-center justify-center text-safari-400">
                        <Route className="w-12 h-12 opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent pointer-events-none" />

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-safari-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md">
                      {trip.status || 'Active'}
                    </span>

                    {/* Trip Title & Route */}
                    <div className="absolute bottom-3 left-4 right-4 space-y-1">
                      <h3 className="font-display font-semibold text-lg text-white line-clamp-1 leading-snug">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-cream/70 flex items-center gap-1 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" />
                        <span className="truncate">{trip.start_location || 'Start'} ➔ {trip.destination}</span>
                      </p>
                    </div>
                  </div>

                  {/* Trip Card Meta Info */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-cream/40">Dates</p>
                        <p className="font-semibold text-xs text-cream/80 mt-0.5 truncate">
                          {trip.dates || trip.start_date || 'Flexible'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-cream/40">Places</p>
                        <p className="font-semibold text-xs text-safari-300 mt-0.5">
                          {placeCount} Stops
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-cream/40">Budget</p>
                        <p className="font-semibold text-xs text-sunset-300 mt-0.5">
                          ₹{Number(trip.budget || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {trip.stops && trip.stops.length > 0 && (
                      <p className="text-xs text-cream/50 line-clamp-1">
                        <span className="font-semibold text-cream/70">Via: </span>
                        {trip.stops.join(' ➔ ')}
                      </p>
                    )}

                    <p className="text-[10px] text-cream/40">Created {formatDate(trip.created_at)}</p>
                  </div>
                </div>

                {/* Card Actions (Phase 2F: View Trip, Edit, Duplicate, Delete, View Map) */}
                <div className="p-5 pt-0 space-y-2 border-t border-white/5 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/my-trips/${trip.id}`)}
                      className="py-2.5 px-3 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Trip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewMap(trip)}
                      className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-safari-400" />
                      <span>View Map</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleEdit(trip)}
                      className="p-2 rounded-lg hover:bg-white/5 text-cream/60 hover:text-white transition-colors flex items-center gap-1"
                      title="Edit in Planner"
                    >
                      <Pencil className="w-3.5 h-3.5 text-safari-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(trip)}
                      disabled={isProcessing}
                      className="p-2 rounded-lg hover:bg-white/5 text-cream/60 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-40"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-3.5 h-3.5 text-sunset-400" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(trip)}
                      disabled={isProcessing}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-cream/60 hover:text-rose-400 transition-colors flex items-center gap-1 disabled:opacity-40"
                      title="Delete Trip"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
