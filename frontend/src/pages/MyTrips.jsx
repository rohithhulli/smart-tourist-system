import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, MapPin, IndianRupee, Trash2, Route, Users, Eye, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/SmartImage';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MyTrips() {
  const navigate = useNavigate();
  const { refreshTripsCount, handleSessionExpired } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (trip) => {
    if (!window.confirm(`Delete trip "${trip.title}"? This cannot be undone.`)) return;
    setDeletingId(trip.id);
    try {
      await axios.delete(`${API_BASE_URL}/api/trips/${trip.id}`, {
        withCredentials: true,
        timeout: 6000,
      });
      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      await refreshTripsCount();
    } catch (err) {
      if (err.response?.status === 401) {
        handleSessionExpired();
      }
      console.error('Error deleting trip:', err);
      setError('Could not delete the trip. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Bookmark className="w-4 h-4" /> Personal Travel Itineraries
          </div>
          <h1 className="text-2xl font-black text-white mt-1">My Saved Trips</h1>
          <p className="text-xs text-slate-400 mt-0.5">Your saved tour plans, synced with your account.</p>
        </div>
        <button
          onClick={() => navigate('/plan-trip')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Route className="w-4 h-4" /> Plan New Trip
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p>Loading your saved trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Trips Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the Multi-Stop AI Trip Planner to create and bookmark your upcoming vacations!
          </p>
          <button
            onClick={() => navigate('/plan-trip')}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-colors"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const placeCount = (trip.selected_places || []).length;
            return (
              <div
                key={trip.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 hover:border-indigo-500/40 transition-all"
              >
                <div className="relative h-40 bg-slate-800">
                  {trip.cover_image ? (
                    <SmartImage src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 to-slate-900 flex items-center justify-center">
                      <Route className="w-12 h-12 text-indigo-500/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-md">
                    {trip.status || 'Active'}
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 space-y-1">
                    <h3 className="font-bold text-lg text-white line-clamp-1">{trip.title}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{trip.start_location || 'Start'} ➔ {trip.destination}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-400">Dates</p>
                      <p className="font-bold text-slate-200 line-clamp-1">{trip.dates || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Budget</p>
                      <p className="font-bold text-indigo-400">₹{(trip.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> Travelers</p>
                      <p className="font-bold text-slate-200">{trip.travelers || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Places</p>
                      <p className="font-bold text-emerald-400">{placeCount}</p>
                    </div>
                  </div>

                  {trip.stops && trip.stops.length > 0 && (
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-slate-400">Via Stops: </span>
                      <span>{trip.stops.join(' ➔ ')}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500">Created {formatDate(trip.created_at)}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/my-trips/${trip.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                    <button
                      onClick={() => handleDelete(trip)}
                      disabled={deletingId === trip.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {deletingId === trip.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
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
