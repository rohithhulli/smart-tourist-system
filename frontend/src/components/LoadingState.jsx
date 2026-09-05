import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export default function LoadingState({
  message = 'Discovering places...',
  subtitle = 'Curating authentic experiences across India',
  className = '',
}) {
  return (
    <div className={`py-20 flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-2xl bg-safari-500/20 border border-safari-500/30 animate-pulse" />
        <div className="relative w-full h-full rounded-2xl flex items-center justify-center text-safari-300">
          <Compass className="w-7 h-7 animate-spin [animation-duration:3s]" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sunset-500 flex items-center justify-center text-ink-950">
          <Sparkles className="w-2.5 h-2.5" />
        </div>
      </div>
      <p className="font-display text-lg font-semibold text-white mb-1">
        {message}
      </p>
      {subtitle && (
        <p className="text-xs text-cream/50 max-w-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
