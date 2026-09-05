import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

const TYPE_BADGE = {
  start: { label: 'Origin', cls: 'bg-safari-600/20 text-safari-300 border-safari-500/40' },
  stop: { label: 'Via Stop', cls: 'bg-sunset-500/20 text-sunset-300 border-sunset-500/40' },
  destination: { label: 'Destination', cls: 'bg-clay-500/20 text-clay-300 border-clay-500/40' },
};

const INITIAL_VISIBLE = 4;

export default function LocationRecommendationGroup({
  group,
  selectedPlaces = [],
  onToggleSelect,
  onViewDetails,
  onViewOnMap,
}) {
  const [showAll, setShowAll] = useState(false);
  const recommendations = group.recommendations || [];
  const visible = showAll ? recommendations : recommendations.slice(0, INITIAL_VISIBLE);
  const badge = TYPE_BADGE[group.location_type] || TYPE_BADGE.stop;
  const locationLabel = group.location;
  const groupSelectedCount = selectedPlaces.filter(
    (p) => (p.tripLocation || p.city || '').toLowerCase() === String(group.location).toLowerCase()
  ).length;

  return (
    <section className="space-y-4" aria-label={`Recommended places for ${group.location}`}>
      <div className="flex items-center gap-3 pt-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="text-center px-2">
          <h3 className="font-display text-xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
            <span>{locationLabel}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
            {groupSelectedCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-safari-500/15 border border-safari-500/40 text-safari-300">
                {groupSelectedCount} selected
              </span>
            )}
          </h3>
          <p className="text-xs text-cream/50 mt-0.5">
            Curated attractions around {group.location}
          </p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/10 to-transparent" />
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center max-w-lg mx-auto">
          <MapPin className="w-8 h-8 mx-auto text-safari-400 mb-2 opacity-60" />
          <p className="text-sm text-cream/90 font-semibold font-display">No specific tourist places found for {group.location}</p>
          <p className="text-xs text-cream/50 mt-1 max-w-md mx-auto">{group.message || 'Continue with other locations along your planned route.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((rec, idx) => {
            const place = rec.place || rec;
            const isSelected = selectedPlaces.some((p) => p.id === place.id);
            return (
              <RecommendationCard
                key={place.id || `${group.location}-${idx}`}
                rec={rec}
                isSelected={isSelected}
                onToggleSelect={() => onToggleSelect(rec, group.location)}
                onViewDetails={() => onViewDetails(rec)}
                onViewOnMap={() => onViewOnMap && onViewOnMap(rec)}
              />
            );
          })}
        </div>
      )}

      {recommendations.length > INITIAL_VISIBLE && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-safari-300 hover:text-safari-200 transition-colors px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> View More ({recommendations.length - INITIAL_VISIBLE} more places)
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
