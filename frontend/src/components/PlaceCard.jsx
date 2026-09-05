import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import SmartImage from './SmartImage';

export default function PlaceCard({ place, onClick }) {
  const navigate = useNavigate();
  if (!place) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/places/${place.slug || place.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full text-left rounded-2xl overflow-hidden border border-white/10 hover:border-safari-400/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 flex flex-col cursor-pointer"
    >
      <div className="relative h-36 sm:h-40 bg-ink-900 overflow-hidden shrink-0">
        <SmartImage
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none" />
        
        {place.category && (
          <span className="absolute top-2.5 left-2.5 bg-ink-950/75 backdrop-blur-md text-cream/90 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/15 uppercase tracking-wider">
            {place.category}
          </span>
        )}
        
        {place.rating ? (
          <span className="absolute top-2.5 right-2.5 bg-amber-400 text-ink-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-ink-950" /> {place.rating}
          </span>
        ) : null}
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-semibold text-sm text-white line-clamp-1 group-hover:text-safari-300 transition-colors">
            {place.name}
          </h4>
          {(place.city || place.state) && (
            <p className="text-xs text-cream/55 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
              <span className="truncate">{place.city}{place.state ? `, ${place.state}` : ''}</span>
            </p>
          )}
          {place.tripLocation && (
            <p className="text-[10px] text-safari-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-safari-400 shrink-0" />
              <span>{place.tripLocation}</span>
            </p>
          )}
        </div>

        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-xs text-cream/50">
          <span className="text-[11px] flex items-center gap-1 text-safari-300 font-medium">
            <IndianRupee className="w-3 h-3 text-safari-400 shrink-0" />
            {place.estimated_cost != null && Number(place.estimated_cost) > 0
              ? `Est. ₹${Number(place.estimated_cost).toLocaleString()}`
              : 'Free entry'}
          </span>
        </div>
      </div>
    </button>
  );
}
