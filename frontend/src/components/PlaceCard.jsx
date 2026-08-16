import React from 'react';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import SmartImage from './SmartImage';

export default function PlaceCard({ place }) {
  if (!place) return null;

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 group">
      <div className="relative h-32 bg-slate-800">
        <SmartImage
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {place.category && (
          <span className="absolute top-2 left-2 bg-slate-950/80 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
            {place.category}
          </span>
        )}
        {place.rating ? (
          <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-slate-950" /> {place.rating}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm text-white line-clamp-1">{place.name}</p>
        {(place.city || place.state) && (
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" /> {place.city}
            {place.state ? `, ${place.state}` : ''}
          </p>
        )}
        {place.tripLocation && (
          <p className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" /> {place.tripLocation}
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <IndianRupee className="w-3 h-3 text-emerald-400 shrink-0" />
          {place.estimated_cost != null ? `Est. ₹${Number(place.estimated_cost).toLocaleString()}` : 'Free'}
        </p>
      </div>
    </div>
  );
}
