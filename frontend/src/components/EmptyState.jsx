import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'Your next adventure starts with a plan.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`py-16 px-6 text-center rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-safari-500/10 border border-safari-500/20 flex items-center justify-center text-safari-300 mb-4 shadow-lg shadow-safari-900/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-cream/60 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-safari-600 hover:bg-safari-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-safari-900/40 hover:-translate-y-0.5"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
