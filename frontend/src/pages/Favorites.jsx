import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Navigation, Eye, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import PlaceCard from '../components/PlaceCard';
import PlaceDetailsModal from '../components/PlaceDetailsModal';

export default function Favorites() {
  const navigate = useNavigate();
  const { handleSessionExpired } = useAuth();
  const { setTripData } = useTrip();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [detailsPlace, setDetailsPlace] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/favorites/`, { withCredentials: true, timeout: 6000 });
      setFavorites(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError('Could not load your favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFavorite = async (placeId) => {
    setRemovingId(placeId);
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/api/favorites/${encodeURIComponent(placeId)}`, {
        withCredentials: true,
        timeout: 6000,
      });
      setFavorites((prev) => prev.filter((f) => f.place_id !== placeId));
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      setError('Could not remove this favorite. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

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
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Bookmark className="w-4 h-4" /> Saved Places
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Your Favorites</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Places you have bookmarked while exploring, with one-click maps and details.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-start gap-2 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-300">Loading your favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-indigo-400" />
          <p className="font-semibold text-white text-base">No favorites saved yet</p>
          <p className="text-xs text-slate-500">
            Bookmark places from recommendations or the map, and they will appear here.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav) => {
            const place = fav.place;
            return (
              <div
                key={fav.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col"
              >
                <PlaceCard place={place} />
                <div className="p-3 pt-2 flex gap-2">
                  <button
                    onClick={() => handleViewOnMap(place)}
                    disabled={place.latitude == null || place.longitude == null}
                    className="flex-1 py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Map
                  </button>
                  <button
                    onClick={() => setDetailsPlace(place)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <button
                    onClick={() => removeFavorite(place.id)}
                    disabled={removingId === place.id}
                    className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    title="Remove from favorites"
                    aria-label={`Remove ${place.name} from favorites`}
                  >
                    {removingId === place.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {favorites.length > 0 && (
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-indigo-400" /> {favorites.length} saved place(s) · synced to your account
        </p>
      )}

      {detailsPlace && <PlaceDetailsModal place={detailsPlace} onClose={() => setDetailsPlace(null)} />}
    </div>
  );
}
