import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

const TYPE_BADGE = {
  start: { label: 'Start', cls: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' },
  stop: { label: 'Stop', cls: 'bg-sky-600/20 text-sky-300 border-sky-500/40' },
  destination: { label: 'Destination', cls: 'bg-rose-600/20 text-rose-300 border-rose-500/40' },
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
  const locationLabel = group.location.toUpperCase();
  const groupSelectedCount = selectedPlaces.filter(
    (p) => (p.tripLocation || p.city || '').toLowerCase() === String(group.location).toLowerCase()
  ).length;

  return (
    <section className="space-y-4" aria-label={`Recommended places for ${group.location}`}>
      <div className="flex items-center gap-3 pt-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <span className="text-slate-600 text-lg">📍</span>
        <div className="text-center">
          <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            {locationLabel}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${badge.cls}`}>
              {badge.label}
            </span>
            {groupSelectedCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
                {groupSelectedCount} selected
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tourist places recommended for {group.location}
          </p>
        </div>
        <span className="text-slate-600 text-lg">📍</span>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-700 via-slate-700 to-transparent" />
      </div>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center">
          <Inbox className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-300 font-semibold">No tourist places found for {group.location}</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{group.message}</p>
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
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-500/10"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> View More ({recommendations.length - INITIAL_VISIBLE} more)
            </>
          )}
        </button>
      )}
    </section>
  );
}
