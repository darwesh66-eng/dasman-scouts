import React from 'react';

interface Props {
  colors?: [string, string, string, string];
}

const defaultColors: [string, string, string, string] = [
  'rgba(27,58,107,0.28)',
  'rgba(91,164,207,0.22)',
  'rgba(27,58,107,0.18)',
  'rgba(91,164,207,0.14)',
];

export default function GradientMesh({ colors = defaultColors }: Props) {
  const orbs = [
    { size: 420, x: '10%', y: '15%', delay: '0s', dur: '12s', color: colors[0] },
    { size: 360, x: '65%', y: '10%', delay: '3s', dur: '15s', color: colors[1] },
    { size: 500, x: '40%', y: '55%', delay: '6s', dur: '18s', color: colors[2] },
    { size: 300, x: '80%', y: '60%', delay: '1.5s', dur: '10s', color: colors[3] },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: `meshFloat ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
