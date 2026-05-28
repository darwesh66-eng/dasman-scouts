import React from 'react';

interface Props {
  /** Color of the wave fill (CSS color / var). Default: 'var(--surface)' */
  color?: string;
  /** Flip vertically (wave faces up). Default false = wave faces down */
  flip?: boolean;
  /** Height in px. Default 60 */
  height?: number;
}

export default function WaveDivider({ color = 'var(--surface)', flip = false, height = 60 }: Props) {
  return (
    <div style={{ overflow: 'hidden', lineHeight: 0, transform: flip ? 'scaleY(-1)' : 'none', pointerEvents: 'none', marginTop: -1 }}>
      <svg
        viewBox={`0 0 1440 ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height }}
        preserveAspectRatio="none"
      >
        <path
          d={`M0,${height * 0.5} C360,${height * 1.05} 720,${height * -0.05} 1080,${height * 0.5} C1260,${height * 0.75} 1380,${height * 0.38} 1440,${height * 0.45} L1440,${height} L0,${height} Z`}
          fill={color}
        />
      </svg>
    </div>
  );
}
