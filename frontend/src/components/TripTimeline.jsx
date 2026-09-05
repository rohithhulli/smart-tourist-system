import React from 'react';
import {
  MapPin, Clock, IndianRupee, Navigation, BedDouble,
  Utensils, Sun, Sunset, Moon, Sparkles, ChevronRight,
} from 'lucide-react';
import SmartImage from './SmartImage';

const SLOT_ICONS = {
  Morning: Sun,
  Afternoon: Sunset,
  Evening: Moon,
};

const SLOT_COLORS = {
  Morning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Afternoon: 'text-sunset-400 bg-sunset-500/10 border-sunset-500/20',
  Evening: 'text-safari-300 bg-safari-500/10 border-safari-500/20',
};

export default function TripTimeline({ itinerary, onOpenMapPlace }) {
  const days = itinerary?.days || (Array.isArray(itinerary) ? itinerary : null);
  if (!days || days.length === 0) return null;

  return (
    <div className="space-y-8">
      {days.map((day) => {
        // Suggested stay & food hints based on day theme or destination
        const staySuggestion =
          day.stay ||
          (day.theme?.toLowerCase().includes('heritage')
            ? 'Heritage boutique haveli or city hotel nearby'
            : day.theme?.toLowerCase().includes('nature') || day.theme?.toLowerCase().includes('waterfall')
            ? 'Eco-resort or scenic homestay in the hills'
            : day.theme?.toLowerCase().includes('beach')
            ? 'Coastal seaside cottage or resort'
            : 'Comfortable central city hotel');

        const foodSuggestion =
          day.food ||
          (day.theme?.toLowerCase().includes('heritage')
            ? 'Traditional regional thali & local filter coffee'
            : day.theme?.toLowerCase().includes('beach')
            ? 'Fresh coastal seafood & tender coconut'
            : 'Authentic local breakfast & garden restaurant dinner');

        return (
          <div
            key={day.day}
            className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all hover:border-safari-500/30"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-safari-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-safari-600 text-white font-display font-semibold text-sm tracking-wider uppercase shadow-md shadow-safari-900/40">
                  DAY {day.day}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white flex items-center gap-2">
                    {day.theme || 'Exploration & Sightseeing'}
                  </h3>
                  {day.date && (
                    <p className="text-xs text-cream/50 mt-0.5">{day.date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cream/80 font-medium">
                  {day.places.length} destination{day.places.length > 1 ? 's' : ''}
                </span>
                {day.day_distance_km != null && (
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-safari-300 font-medium">
                    ~{Math.round(day.day_distance_km)} km route
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-safari-500/10 border border-safari-500/30 text-safari-300 font-bold flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Est. ₹{Math.round(day.day_budget || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {day.notes && (
              <p className="text-sm text-cream/65 leading-relaxed italic bg-white/[0.01] p-3 rounded-xl border border-white/5">
                "{day.notes}"
              </p>
            )}

            {/* Time Slot Timeline (Morning, Afternoon, Evening) */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-safari-500 before:via-sunset-500/60 before:to-safari-500/20">
              {day.places.map((item, i) => {
                const p = item.place || item;
                const slot = item.time_slot || (i === 0 ? 'Morning' : i === 1 ? 'Afternoon' : 'Evening');
                const SlotIcon = SLOT_ICONS[slot] || Sun;
                const slotClass = SLOT_COLORS[slot] || SLOT_COLORS.Morning;
                const durationText = item.travel_time_minutes ? `~${item.travel_time_minutes} mins travel` : '1–2 hrs visit';
                const distanceText = item.distance_from_prev_km != null && item.distance_from_prev_km > 0
                  ? `+${Math.round(item.distance_from_prev_km)} km from prev`
                  : null;

                return (
                  <div key={p.id || i} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-6 sm:-left-8 top-4 w-5 h-5 rounded-full bg-ink-950 border-2 border-safari-400 flex items-center justify-center group-hover:scale-125 transition-transform">
                      <div className="w-2 h-2 rounded-full bg-safari-400" />
                    </div>

                    <div className="rounded-2xl bg-ink-900/90 border border-white/10 hover:border-safari-400/40 p-4 sm:p-5 transition-all space-y-3">
                      {/* Top slot badge & location distance */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${slotClass}`}>
                            <SlotIcon className="w-3.5 h-3.5" />
                            {slot}
                          </span>
                          <span className="text-xs text-cream/40 font-medium">
                            Stop {i + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-cream/50">
                          {distanceText && (
                            <span className="text-safari-300 font-medium">{distanceText}</span>
                          )}
                          <span className="flex items-center gap-1 text-cream/60 font-medium">
                            <Clock className="w-3.5 h-3.5 text-safari-400" />
                            {durationText}
                          </span>
                        </div>
                      </div>

                      {/* Main Place Content */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {p.image ? (
                          <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-ink-950 border border-white/10">
                            <SmartImage
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-300">
                            <MapPin className="w-8 h-8" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-semibold text-lg text-white leading-snug group-hover:text-safari-300 transition-colors">
                                {p.name}
                              </h4>
                              {(p.city || p.state) && (
                                <p className="text-xs text-cream/60 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
                                  <span>{p.city}{p.state ? `, ${p.state}` : ''}</span>
                                  {p.category && <span className="text-cream/40">· {p.category}</span>}
                                </p>
                              )}
                            </div>

                            {/* Estimated Cost */}
                            <div className="text-right shrink-0 text-xs">
                              <span className="text-safari-300 font-bold flex items-center gap-0.5 justify-end">
                                <IndianRupee className="w-3.5 h-3.5" />
                                {Math.round(item.estimated_cost || p.estimated_cost || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-cream/40">est. entry/activity</span>
                            </div>
                          </div>

                          {p.description && (
                            <p className="text-xs text-cream/65 leading-relaxed line-clamp-2">
                              {p.description}
                            </p>
                          )}

                          {/* Map Action */}
                          {onOpenMapPlace && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => onOpenMapPlace(p)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-safari-300 hover:text-safari-200 transition-colors"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Locate on Map</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stay & Food Recommendations Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-300 shrink-0">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Stay Suggestion</p>
                  <p className="text-xs text-cream/70 mt-0.5 leading-relaxed">{staySuggestion}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sunset-500/10 border border-sunset-500/20 flex items-center justify-center text-sunset-300 shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Food & Dining</p>
                  <p className="text-xs text-cream/70 mt-0.5 leading-relaxed">{foodSuggestion}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
