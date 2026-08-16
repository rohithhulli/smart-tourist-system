import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Navigation, Sparkles, Image as ImageIcon, Heart, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import SmartImage from './SmartImage';

export default function PlaceDetailsModal({ place, rec = null, onClose }) {
  const [favLoading, setFavLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(null);
  const [favError, setFavError] = useState('');

  if (!place) return null;
  const distance = rec?.distance_km != null ? rec.distance_km : place.distance_km;
  const score = rec?.recommendation_score != null ? Math.round(rec.recommendation_score * 100) : null;
  const reviews = place.reviews_count;
  const snapshots = place.snapshots || (place.image ? [place.image] : []);
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={place.name}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-64 bg-slate-800">
          {place.image && (
            <SmartImage src={place.image} alt={place.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-800 text-white p-2 rounded-full border border-white/10 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                {place.category}
              </span>
              <div className="flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-slate-950" /> {place.rating}
                {reviews != null && reviews > 0 && (
                  <span className="text-[10px] opacity-80 font-normal">({reviews.toLocaleString()} reviews)</span>
                )}
              </div>
              {distance != null && (
                <span className="bg-slate-800/90 border border-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  {Math.round(distance)} km away
                </span>
              )}
              {score != null && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  Match {score}%
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white">{place.name}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {place.city}, {place.state}
            </p>
          </div>
        </div>

        <div className="p-6 pt-2 space-y-5 text-slate-300">
          {rec?.match_reason && (
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Why this was recommended
              </p>
              <p className="text-slate-300 mt-1">{rec.match_reason}</p>
            </div>
          )}

          <div className="flex items-center gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
            <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Opening & Closing Timings</p>
              <p className="text-slate-400">
                {place.opening_time || place.open_time} to {place.closing_time || place.close_time}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Place History & Details
            </h4>
            <p className="text-xs leading-relaxed text-slate-300 bg-slate-950/30 p-4 rounded-xl border border-slate-800">
              {place.history || place.description}
            </p>
          </div>

          {snapshots.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Photo Snapshots Gallery
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {snapshots.map((img, idx) => (
                  <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                    <SmartImage src={img} alt={`${place.name} view ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" iconClassName="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={!placeId || favLoading}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isFavorite
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-rose-600/20 text-slate-200 hover:text-rose-300 border border-slate-700'
              }`}
            >
              {favLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />}
              {isFavorite ? 'Saved' : 'Favorite'}
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.city || ''))}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Navigation className="w-4 h-4" /> Open in Google Maps
            </a>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>

          {favError && (
            <p className="flex items-center gap-1.5 text-[11px] text-rose-400">
              <Info className="w-3.5 h-3.5 shrink-0" /> {favError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
