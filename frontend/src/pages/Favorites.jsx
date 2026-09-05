import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, Trash2, Navigation, Eye, MapPin, Loader2,
  AlertTriangle, Heart, ArrowRight,
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
      const res = await axios.get(`${API_BASE_URL}/api/favorites/`, {
        withCredentials: true,
        timeout: 6000,
      });
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
          lat: place.latitude ?? place.lat,
          lng: place.longitude ?? place.lng,
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
      {/* Page Header (Phase 2G Requirement) */}
      <PageHeader
        eyebrow="Saved Places"
        title="Your Favorites"
        subtitle="Places you've bookmarked while discovering India, with instant details and map routing."
      >
        <button
          onClick={() => navigate('/destinations')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cream transition-all"
        >
          <span>Explore More</span>
          <ArrowRight className="w-3.5 h-3.5 text-safari-400" />
        </button>
      </PageHeader>

      {error && (
        <ErrorState message={error} onRetry={fetchFavorites} />
      )}

      {loading ? (
        <LoadingState
          message="Loading your saved favorites..."
          subtitle="Fetching your bookmarked attractions"
        />
      ) : favorites.length === 0 ? (
        /* Empty State (Phase 2G Requirement: "Your favorite places will appear here." CTA: "Explore Destinations") */
        <EmptyState
          icon={Heart}
          title="Your favorite places will appear here."
          description="Save places you love as you explore itineraries and recommendations, then find them all right here."
          actionLabel="Explore Destinations"
          onAction={() => navigate('/destinations')}
        />
      ) : (
        /* Professional Tourism Cards Grid (Image, Place name, Location, Category, View Details, Remove Favorite) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            const place = fav.place || fav;
            const placeId = fav.place_id || place.id;
            const isRemoving = removingId === placeId;

            return (
              <div
                key={fav.id || placeId}
                className="group rounded-3xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/20"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 bg-ink-900 overflow-hidden">
                    {place.image ? (
                      <SmartImage
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-safari-500/10 flex items-center justify-center text-safari-400">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

                    {/* Category */}
                    {place.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-ink-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-cream/90">
                        {place.category}
                      </span>
                    )}

                    {/* Remove Favorite icon button */}
                    <button
                      type="button"
                      onClick={() => removeFavorite(placeId)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 p-2 rounded-full bg-ink-950/80 hover:bg-rose-500/20 text-cream/70 hover:text-rose-400 border border-white/15 transition-all shadow-md"
                      title="Remove from favorites"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>
                  </div>

                  {/* Content: Place name, Location, Category */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-display font-semibold text-lg text-white group-hover:text-safari-300 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-cream/60 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" />
                      <span className="truncate">{place.city}{place.state ? `, ${place.state}` : ''}</span>
                    </p>
                    {place.description && (
                      <p className="text-xs text-cream/65 line-clamp-2 leading-relaxed mt-1">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: View Details, Remove Favorite, View on Map */}
                <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailsPlace(place)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors text-center border border-white/10"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewOnMap(place)}
                    className="py-2.5 px-3 rounded-xl bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold transition-all shadow-md shadow-safari-900/30 flex items-center justify-center gap-1"
                    title="View on Map"
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

      {/* Place Details Modal */}
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
