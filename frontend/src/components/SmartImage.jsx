import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function SmartImage({ src, alt = '', className = '', iconClassName = 'w-8 h-8', ...rest }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image unavailable'}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 ${className}`}
      >
        <ImageIcon className={`${iconClassName} text-slate-500`} />
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />;
}
