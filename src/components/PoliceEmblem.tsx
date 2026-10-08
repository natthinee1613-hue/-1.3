import React from 'react';

interface PoliceEmblemProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'monochrome' | 'badge';
}

export const PoliceEmblem: React.FC<PoliceEmblemProps> = ({
  className = '',
  size = 64,
  variant = 'gold',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="ตราสัญลักษณ์สำนักงานตำรวจแห่งชาติ"
    >
      <defs>
        {/* Gold Gradients */}
        <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF1B8" />
          <stop offset="35%" stopColor="#F5D061" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6D1F" />
        </linearGradient>

        <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF0BE" />
          <stop offset="40%" stopColor="#ECC440" />
          <stop offset="80%" stopColor="#B38F26" />
          <stop offset="100%" stopColor="#634B0B" />
        </linearGradient>

        <radialGradient id="sunburst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8D6" />
          <stop offset="60%" stopColor="#F5D061" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>

        <radialGradient id="shieldCenter" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="70%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#050B14" />
        </radialGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Sunburst Rays / Star points */}
      <g filter="url(#goldGlow)">
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <path
              key={`ray-${i}`}
              d="M100 20 L104 65 L100 70 L96 65 Z"
              fill="url(#goldGrad1)"
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16 + 11.25;
          return (
            <path
              key={`ray-sub-${i}`}
              d="M100 32 L103 62 L100 66 L97 62 Z"
              fill="url(#goldGrad2)"
              transform={`rotate(${angle} 100 100)`}
              opacity="0.85"
            />
          );
        })}
      </g>

      {/* Outer Golden Wreath / Chakra Ring */}
      <circle cx="100" cy="100" r="70" stroke="url(#goldGrad1)" strokeWidth="3" fill="none" opacity="0.9" />
      <circle cx="100" cy="100" r="66" stroke="url(#goldGrad2)" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.7" />

      {/* Main Police Shield (โล่เขน) */}
      <path
        d="M100 38 
           C135 38 152 48 152 75
           C152 118 126 150 100 168
           C74 150 48 118 48 75
           C48 48 65 38 100 38 Z"
        fill="url(#shieldCenter)"
        stroke="url(#goldGrad1)"
        strokeWidth="3.5"
      />

      {/* Inner Shield Rim */}
      <path
        d="M100 44 
           C130 44 145 52 145 76
           C145 113 122 142 100 159
           C78 142 55 113 55 76
           C55 52 70 44 100 44 Z"
        fill="none"
        stroke="url(#goldGrad2)"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Royal Crown / Top Thai Crest Peak */}
      <g transform="translate(100, 36)">
        {/* Crown base & spire */}
        <path d="M-14 8 L-10 -4 L0 -14 L10 -4 L14 8 Z" fill="url(#goldGrad1)" stroke="#8C6D1F" strokeWidth="0.8" />
        <path d="M0 -14 L0 -24 L-2 -18 L0 -28 L2 -18 L0 -24 Z" fill="url(#goldGrad1)" />
        <circle cx="0" cy="-28" r="2.5" fill="#FFF1B8" />
        {/* Crown jewels */}
        <circle cx="-6" cy="4" r="1.5" fill="#EF4444" />
        <circle cx="0" cy="2" r="1.8" fill="#3B82F6" />
        <circle cx="6" cy="4" r="1.5" fill="#EF4444" />
      </g>

      {/* Central Sword of Justice (พระแสงดาบ) */}
      {/* Blade */}
      <path
        d="M100 52 L102.5 125 L100 132 L97.5 125 Z"
        fill="url(#goldGrad1)"
        stroke="#8C6D1F"
        strokeWidth="0.75"
      />
      {/* Blade center fuller line */}
      <line x1="100" y1="56" x2="100" y2="126" stroke="#FAF0BE" strokeWidth="1" />

      {/* Sword Guard (กะบังดาบ) */}
      <path
        d="M84 126 C90 123 96 128 100 128 C104 128 110 123 116 126 C112 130 106 131 100 131 C94 131 88 130 84 126 Z"
        fill="url(#goldGrad2)"
        stroke="#634B0B"
        strokeWidth="0.8"
      />

      {/* Sword Grip and Pommel (ด้ามดาบ) */}
      <path d="M98 131 L98 143 L102 143 L102 131 Z" fill="url(#goldGrad1)" stroke="#8C6D1F" strokeWidth="0.5" />
      <circle cx="100" cy="146" r="3.5" fill="url(#goldGrad2)" stroke="#634B0B" strokeWidth="0.7" />

      {/* Thai Ornamental Filigree on left and right of shield */}
      <path
        d="M68 76 C72 90 78 102 90 110 C82 104 76 94 72 82 Z"
        fill="url(#goldGrad1)"
        opacity="0.85"
      />
      <path
        d="M132 76 C128 90 122 102 110 110 C118 104 124 94 128 82 Z"
        fill="url(#goldGrad1)"
        opacity="0.85"
      />

      {/* Lower Ribbon / Banner */}
      <g transform="translate(100, 168)">
        <path
          d="M-45 0 C-25 10 25 10 45 0 C38 12 18 16 0 16 C-18 16 -38 12 -45 0 Z"
          fill="url(#goldGrad1)"
          stroke="#634B0B"
          strokeWidth="0.8"
        />
        <text
          x="0"
          y="11"
          textAnchor="middle"
          fill="#1E293B"
          fontSize="6.5"
          fontFamily="'Sarabun', sans-serif"
          fontWeight="bold"
          letterSpacing="0.5"
        >
          ROYAL THAI POLICE
        </text>
      </g>
    </svg>
  );
};
