import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load destinations right now. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`py-12 px-6 rounded-3xl border border-sunset-500/20 bg-sunset-500/[0.04] text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-sunset-500/10 border border-sunset-500/30 flex items-center justify-center text-sunset-300 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-cream/60 max-w-sm mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full border border-white/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
