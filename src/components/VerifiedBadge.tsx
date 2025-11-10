import React from 'react';

interface VerifiedBadgeProps {
  size?: number; // px
  className?: string;
  title?: string;
  src?: string; // optional override
}

// Default uses a locally hosted badge in `public/verified-badge.svg`.
// Place the approved badge at `/public/verified-badge.svg` (committed to the repo)
// or override via the `src` prop.
const DEFAULT_SRC = '/verified-badge.svg';

export default function VerifiedBadge({ size = 18, className = '', title = 'Verified', src = DEFAULT_SRC }: VerifiedBadgeProps) {
  const s = size;
  return (
    <img
      src={src}
      alt={title}
      title={title}
      aria-label={title}
      width={s}
      height={s}
      className={`block ${className}`}
      style={{ width: s, height: s, display: 'inline-block' }}
    />
  );
}
