import React from 'react';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
import SmartImage from './SmartImage';

export default function TripTimeline({ itinerary }) {
  const days = itinerary?.days || (Array.isArray(itinerary) ? itinerary : null);
  if (!days || days.length === 0) return null;

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <div key={day.day} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Day {day.day} • <span className="text-indigo-400 font-semibold">{day.theme}</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {day.places.length} places • {Math.round(day.day_distance_km || 0)} km • ₹
              {Math.round(day.day_budget || 0)}
            </span>
          </div>
          {day.date && <p className="mt-0.5 text-[10px] text-slate-500">{day.date}</p>}
          {day.notes && <p className="mt-1 text-sm text-slate-400">{day.notes}</p>}
          <div className="mt-3 space-y-2">
            {day.places.map((item, i) => {
              const p = item.place || item;
              return (
                <div key={p.id || i} className="rounded-lg p-2 bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <span className="h-6 w-6 shrink-0 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {p.image ? (
                    <SmartImage src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-md" iconClassName="w-5 h-5" />
                  ) : (
                    <div className="w-12 h-12 shrink-0 rounded-md bg-indigo-500/15 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{p.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400 shrink-0" /> {item.time_slot || p.category}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    {item.distance_from_prev_km != null && <div>+{Math.round(item.distance_from_prev_km)} km</div>}
                    <div className="flex items-center justify-end gap-0.5">
                      <IndianRupee className="w-3 h-3" /> {Math.round(item.estimated_cost || p.estimated_cost || 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
