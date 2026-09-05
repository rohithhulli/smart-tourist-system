import React from 'react';

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-white/10 ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-safari-400 mb-2 font-sans">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-white tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-cream/65 mt-2 font-sans text-pretty leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
