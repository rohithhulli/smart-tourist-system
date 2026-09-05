import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Eye, Navigation, Sparkles, IndianRupee } from 'lucide-react';
import SmartImage from './SmartImage';

const formatDistance = (km) => {
  if (km == null) return null;
  return km >= 10 ? `${Math.round(km)} km away` : `${km.toFixed(1)} km away`;
};

export default function RecommendationCard({
  rec,
  isSelected = false,
  onToggleSelect,
  onViewDetails,
  onViewOnMap,
}) {
  const navigate = useNavigate();
  const place = rec.place || rec;
  const placeSlug = place.slug || place.id;
  const distance = rec.distance_km != null ? rec.distance_km : place.distance_km;
  const reviews = place.reviews_count;
  const description = place.description || place.history || '';

  // Human-friendly "Why this place?" explanation
  const whyThisPlace =
    rec.match_reason ||
    (rec.reasons && rec.reasons.length > 0 ? rec.reasons[0] : null) ||
    `Recommended because it matches your travel preferences, fits your planned budget and connects nicely along your journey.`;

  return (
    <div
      className={`group rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white/[0.02] hover:-translate-y-1 ${
        isSelected
          ? 'border-safari-500 shadow-xl shadow-safari-900/30 bg-safari-950/20'
          : 'border-white/10 hover:border-safari-400/40 hover:shadow-xl hover:shadow-black/40'
      }`}
    >
      <div>
        {/* Card Image Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-ink-900 shrink-0">
          {place.image && (
            <SmartImage
              src={place.image}
              alt={place.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            <span className="bg-ink-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md text-cream/90 border border-white/15">
              {place.category}
            </span>
            {distance != null && (
              <span className="bg-safari-600/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {/* Select Button in Top-Right */}
          <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={isSelected}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-md ${
              isSelected
                ? 'bg-safari-500 text-ink-950 shadow-safari-500/20'
                : 'bg-ink-950/80 hover:bg-safari-600 text-white border border-white/20'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'fill-ink-950 text-safari-500' : ''}`} />
            <span>{isSelected ? 'In Plan' : 'Add to Plan'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{place.rating || '4.5'}</span>
              {reviews != null && reviews > 0 && (
                <span className="text-cream/40 font-normal text-[11px]">
                  ({reviews.toLocaleString()})
                </span>
              )}
            </div>
            {place.estimated_cost != null && (
              <span className="text-[11px] text-safari-300 font-medium flex items-center">
                <IndianRupee className="w-3 h-3 text-safari-400" />
                {Number(place.estimated_cost) > 0
                  ? `₹${Number(place.estimated_cost).toLocaleString()}`
                  : 'Free'}
              </span>
            )}
          </div>

          <h4
            onClick={() => navigate(`/places/${placeSlug}`)}
            className="font-display font-semibold text-base text-white leading-snug group-hover:text-safari-300 transition-colors line-clamp-1 cursor-pointer"
          >
            {place.name}
          </h4>

          <p className="text-xs text-cream/55 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-safari-400 shrink-0" />
            <span className="truncate">{place.city}{place.state ? `, ${place.state}` : ''}</span>
          </p>

          {description && (
            <p className="text-xs text-cream/65 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          {/* Why this place? Natural explanation (no raw ML scores) */}
          <div className="p-2.5 rounded-xl bg-safari-500/10 border border-safari-500/20 text-[11px] text-cream/80 space-y-1">
            <div className="flex items-center gap-1 text-safari-300 font-semibold text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-safari-400 shrink-0" />
              Why this place?
            </div>
            <p className="leading-snug text-cream/85 line-clamp-2">
              {whyThisPlace}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footers */}
      <div className="p-4 pt-1 flex items-center gap-2 border-t border-white/5 mt-2">
        <button
          type="button"
          onClick={onViewOnMap}
          disabled={!place.latitude && !place.lat}
          className="p-2 rounded-xl bg-white/5 hover:bg-safari-600/20 text-safari-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-safari-500/30"
          title="Show on map"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map</span>
        </button>

        <button
          type="button"
          onClick={onViewDetails || (() => navigate(`/places/${placeSlug}`))}
          className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cream/80 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <button
          type="button"
          onClick={onToggleSelect}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isSelected
              ? 'bg-safari-500 text-ink-950 shadow-md shadow-safari-900/30'
              : 'bg-safari-600 hover:bg-safari-500 text-white shadow-md shadow-safari-900/40'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}
