import React, { useState } from 'react';

interface Props {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function SkeletonImage({ src, alt = '', style, className }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }} className={className}>
      {/* Shimmer skeleton */}
      {!loaded && !error && (
        <div
          className="skeleton-shimmer"
          style={{ position: 'absolute', inset: 0 }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, color: 'var(--text-muted)',
        }}>
          🖼️
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          display: 'block',
        }}
        loading="lazy"
      />
    </div>
  );
}
