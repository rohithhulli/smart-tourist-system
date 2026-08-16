import React from 'react';
import { Star, MapPin, CheckCircle, Eye, Clock, IndianRupee, Navigation, Sparkles } from 'lucide-react';
import SmartImage from './SmartImage';

const formatDistance = (km) => {
  if (km == null) return null;
  return km >= 10 ? `${Math.round(km)} km away` : `${km.toFixed(1)} km away`;
};

export default function RecommendationCard({ rec, isSelected = false, onToggleSelect, onViewDetails, onViewOnMap }) {
  const place = rec.place || rec;
  const score = Math.round((rec.recommendation_score || 0) * 100);
  const distance = rec.distance_km != null ? rec.distance_km : place.distance_km;
  const reviews = place.reviews_count;
  const description = place.description || place.history || '';

  return (
    <div
      className={`group bg-[#121827] border rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
        isSelected
          ? 'border-emerald-500/60 shadow-emerald-500/10'
          : 'border-slate-800 hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:shadow-xl'
      }`}
    >
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-slate-800">
          {place.image && (
            <SmartImage
              src={place.image}
              alt={place.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            <span className="bg-slate-950/80 backdrop-blur text-xs px-2.5 py-1 rounded-md text-slate-200 border border-slate-700">
              {place.category}
            </span>
            {distance != null && (
              <span className="bg-indigo-600/90 backdrop-blur text-white text-[11px] px-2 py-1 rounded-md">
                {formatDistance(distance)}
              </span>
            )}
          </div>

          <span
            className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold shadow ${
              score >= 45 ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            Match {score}%
          </span>

          <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={isSelected}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition backdrop-blur ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-indigo-600/90 hover:bg-indigo-600 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isSelected ? 'Selected' : 'Select'}
          </button>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{place.rating}</span>
            {reviews != null && reviews > 0 && (
              <span className="text-slate-500 font-normal">({reviews.toLocaleString()} reviews)</span>
            )}
            {place.popularity != null && reviews == null && (
              <span className="text-slate-500 font-normal">Popularity {place.popularity}</span>
            )}
          </div>

          <h4 className="font-bold text-base text-white leading-snug group-hover:text-indigo-400 transition-colors line-clamp-1">
            {place.name}
          </h4>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {place.city}{place.state ? `, ${place.state}` : ''}
          </p>

          {description && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>
          )}

          {rec.match_reason && (
            <p className="text-[11px] text-emerald-400/90 leading-relaxed line-clamp-2">
              {rec.match_reason}
            </p>
          )}

          {rec.score_breakdown && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI match breakdown
              </p>
              {[
                { key: 'content', label: 'Interest match' },
                { key: 'quality', label: 'Quality' },
                { key: 'budget', label: 'Budget fit' },
                { key: 'distance', label: 'Proximity' },
              ].map(({ key, label }) => {
                const val = rec.score_breakdown[key] ?? 0;
                const pct = Math.round(Math.min(1, Math.max(0, val)) * 100);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-20 text-[10px] text-slate-400 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500/80" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold text-slate-300 shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {place.opening_time && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" /> {place.opening_time} – {place.closing_time}
              </span>
            )}
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {place.estimated_cost ? `₹${place.estimated_cost.toLocaleString()}` : 'Free'}
            </span>
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {place.tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="text-[10px] bg-slate-800/70 text-slate-300 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-2 flex gap-2">
        <button
          type="button"
          onClick={onViewOnMap}
          disabled={!place.latitude && !place.lat}
          className="py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Show this place on the map"
        >
          <Navigation className="w-3.5 h-3.5" /> Map
        </button>
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" /> View Details &amp; History
        </button>
        <button
          type="button"
          onClick={onToggleSelect}
          className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            isSelected
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}
