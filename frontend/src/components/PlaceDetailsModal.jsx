import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, MapPin, Clock, Navigation, Sparkles, Heart, Loader2, IndianRupee, Tag } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SmartImage from './SmartImage';

export default function PlaceDetailsModal({ place, rec = null, onClose, onAddToTrip }) {
  const navigate = useNavigate();
  const [favLoading, setFavLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(null);
  const [favError, setFavError] = useState('');

  if (!place) return null;
  const distance = rec?.distance_km != null ? rec.distance_km : place.distance_km;
  const reviews = place.reviews_count;
  const placeId = place.id || place.place_id;

  const toggleFavorite = async () => {
    if (!placeId) return;
    setFavLoading(true);
    setFavError('');
    const next = !isFavorite;
    try {
      if (next) {
        await axios.post(`${API_BASE_URL}/api/favorites/`, { place_id: placeId }, { withCredentials: true, timeout: 6000 });
      } else {
        await axios.delete(`${API_BASE_URL}/api/favorites/${encodeURIComponent(placeId)}`, { withCredentials: true, timeout: 6000 });
      }
      setIsFavorite(next);
    } catch (err) {
      setFavError(err.response?.data?.detail || 'Could not update favorite. Please try again.');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={place.name}
        className="bg-ink-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-64 sm:h-72 bg-ink-950">
          {place.image && (
            <SmartImage src={place.image} alt={place.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-ink-950/80 hover:bg-ink-950 text-white p-2.5 rounded-full border border-white/15 transition-all shadow-md"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-safari-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {place.category}
              </span>
              <div className="flex items-center gap-1 bg-amber-400 text-ink-950 text-xs font-bold px-2.5 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-ink-950" /> {place.rating}
                {reviews != null && reviews > 0 && (
                  <span className="text-[10px] font-normal opacity-85">({reviews.toLocaleString()})</span>
                )}
              </div>
              {distance != null && (
                <span className="bg-ink-950/80 border border-white/10 text-safari-300 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {Math.round(distance)} km away
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white leading-tight">
              {place.name}
            </h2>
            <p className="text-xs text-cream/70 flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" /> {place.city}{place.state ? `, ${place.state}` : ''}
            </p>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-5 text-cream/75">
          {/* Why this place was recommended */}
          {rec?.match_reason && (
            <div className="p-4 bg-safari-500/10 border border-safari-500/20 rounded-2xl text-xs space-y-1.5">
              <p className="font-bold text-safari-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-safari-300" /> Why this place?
              </p>
              <p className="text-cream/90 leading-relaxed font-sans">
                {rec.match_reason}
              </p>
            </div>
          )}

          {/* Place description */}
          {place.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cream/50 font-sans">About</h3>
              <p className="text-sm leading-relaxed text-cream/80 font-sans">
                {place.description}
              </p>
            </div>
          )}

          {/* Timings & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-safari-300 text-xs font-semibold">
                <Clock className="w-4 h-4" /> Timings
              </div>
              <p className="text-xs text-cream/80 font-medium">
                {place.opening_time && place.closing_time
                  ? `${place.opening_time} – ${place.closing_time}`
                  : 'Open all day'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-safari-300 text-xs font-semibold">
                <IndianRupee className="w-4 h-4" /> Estimated Cost
              </div>
              <p className="text-xs text-cream/80 font-medium">
                {place.estimated_cost ? `₹${Number(place.estimated_cost).toLocaleString()} per person` : 'Free entry'}
              </p>
            </div>
          </div>

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-cream/50 font-semibold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" /> Highlights
              </div>
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-cream/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {favError && (
            <p className="text-xs text-sunset-400">{favError}</p>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-cream text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {favLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-safari-400" />
              ) : (
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-cream/60'}`} />
              )}
              <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/places/${place.slug || place.id || place.place_id}`);
                }}
                className="px-4 py-2.5 bg-safari-500/20 hover:bg-safari-500/30 text-safari-300 border border-safari-500/30 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Full Page &rarr;
              </button>
              {onAddToTrip && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToTrip(place);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-colors shadow-lg shadow-safari-900/30"
                >
                  Add to Trip
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-cream text-xs font-semibold rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
