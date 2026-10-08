import React from 'react';

interface ThaiKanokPatternProps {
  className?: string;
  opacity?: number;
}

export const ThaiKanokPattern: React.FC<ThaiKanokPatternProps> = ({
  className = '',
  opacity = 0.28,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 800 240"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Rich Gold Gradient */}
          <linearGradient id="kanokGoldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FFE066" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Soft Amber Gold Gradient */}
          <linearGradient id="kanokGoldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Radial Center Glow */}
          <radialGradient id="kanokCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#D97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
          </radialGradient>

          {/* Thai Kanok Corner Motif Definition */}
          <g id="kanokCorner">
            {/* Outer Flame (กนกตัวใหญ่) */}
            <path
              d="M0 0 
                 C 25 2, 50 12, 70 32
                 C 90 52, 105 80, 115 110
                 C 108 95, 96 82, 82 72
                 C 95 90, 100 115, 95 138
                 C 88 118, 76 102, 60 90
                 C 72 108, 75 130, 68 152
                 C 55 125, 38 105, 18 92
                 C 28 108, 30 128, 24 148
                 C 12 115, 2 80, 0 45 Z"
              fill="url(#kanokGoldGrad1)"
            />
            {/* Inner Spiral Flame Accent (กนกก้านขด) */}
            <path
              d="M 5 5 
                 C 20 8, 38 18, 52 34
                 C 65 48, 72 66, 75 85
                 C 68 72, 58 62, 46 55
                 C 55 68, 58 84, 53 100
                 C 44 82, 32 70, 18 62
                 C 25 74, 27 88, 22 102
                 C 10 75, 4 45, 5 5 Z"
              fill="url(#kanokGoldGrad2)"
              opacity="0.85"
            />
            {/* Delicate Golden Sparkle Beads */}
            <circle cx="28" cy="28" r="2" fill="#FFFBEB" />
            <circle cx="52" cy="48" r="1.8" fill="#FFFBEB" />
            <circle cx="75" cy="78" r="1.5" fill="#FFFBEB" />
          </g>

          {/* Thai Prajumyam Rosette (ลายประจำยาม 4 ทิศ) */}
          <g id="prajumyamFlower">
            {/* Center Core */}
            <circle cx="0" cy="0" r="14" fill="url(#kanokGoldGrad1)" stroke="#FFFBEB" strokeWidth="1" />
            <circle cx="0" cy="0" r="8" fill="url(#kanokGoldGrad2)" />
            <circle cx="0" cy="0" r="3.5" fill="#FFFBEB" />

            {/* 4 Cardinal Petals */}
            {[0, 90, 180, 270].map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                {/* Main Pointed Petal (กลีบกระหนก) */}
                <path
                  d="M 0 -12 
                     C -10 -22, -14 -38, 0 -58 
                     C 14 -38, 10 -22, 0 -12 Z"
                  fill="url(#kanokGoldGrad1)"
                  stroke="#FFFBEB"
                  strokeWidth="0.8"
                />
                {/* Inner Petal Fluting */}
                <path
                  d="M 0 -16 
                     C -5 -24, -7 -36, 0 -48 
                     C 7 -36, 5 -24, 0 -16 Z"
                  fill="url(#kanokGoldGrad2)"
                />
                <circle cx="0" cy="-38" r="1.5" fill="#FFFBEB" />
              </g>
            ))}

            {/* 4 Diagonal Petals */}
            {[45, 135, 225, 315].map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <path
                  d="M 0 -10 
                     C -8 -18, -10 -30, 0 -44 
                     C 10 -30, 8 -18, 0 -10 Z"
                  fill="url(#kanokGoldGrad2)"
                  opacity="0.9"
                />
                <circle cx="0" cy="-30" r="1.2" fill="#FFFBEB" />
              </g>
            ))}
          </g>

          {/* Thai Horizontal Filigree Border Vine (ลายเถากนก) */}
          <g id="kanokVineSegment">
            <path
              d="M 0 10 
                 C 15 2, 25 18, 40 10
                 C 32 6, 28 0, 35 -6
                 C 25 -2, 20 6, 10 2
                 C 14 -4, 18 -8, 12 -12
                 C 5 -6, 2 4, 0 10 Z"
              fill="url(#kanokGoldGrad1)"
            />
          </g>
        </defs>

        {/* Ambient Center Glow */}
        <ellipse cx="400" cy="120" rx="360" ry="110" fill="url(#kanokCenterGlow)" />

        {/* Top-Left Kanok Corner */}
        <use href="#kanokCorner" x="0" y="0" />

        {/* Top-Right Kanok Corner */}
        <use href="#kanokCorner" x="800" y="0" transform="scale(-1, 1)" />

        {/* Bottom-Left Kanok Corner */}
        <use href="#kanokCorner" x="0" y="240" transform="scale(1, -1)" />

        {/* Bottom-Right Kanok Corner */}
        <use href="#kanokCorner" x="800" y="240" transform="scale(-1, -1)" />

        {/* Central Watermark Prajumyam */}
        <g transform="translate(400, 120) scale(1.15)" opacity="0.65">
          <use href="#prajumyamFlower" />
        </g>

        {/* Left Side Prajumyam Accent */}
        <g transform="translate(180, 120) scale(0.65)" opacity="0.45">
          <use href="#prajumyamFlower" />
        </g>

        {/* Right Side Prajumyam Accent */}
        <g transform="translate(620, 120) scale(0.65)" opacity="0.45">
          <use href="#prajumyamFlower" />
        </g>

        {/* Top Ornamental Border Line (ขอบลายกนกบน) */}
        <g transform="translate(240, 12) scale(0.75)" opacity="0.5">
          <use href="#kanokVineSegment" x="0" y="0" />
          <use href="#kanokVineSegment" x="60" y="0" />
          <use href="#kanokVineSegment" x="120" y="0" />
          <use href="#kanokVineSegment" x="180" y="0" />
          <use href="#kanokVineSegment" x="240" y="0" />
          <use href="#kanokVineSegment" x="300" y="0" />
          <use href="#kanokVineSegment" x="360" y="0" />
          <use href="#kanokVineSegment" x="420" y="0" />
        </g>

        {/* Bottom Ornamental Border Line (ขอบลายกนกล่าง) */}
        <g transform="translate(240, 228) scale(0.75, -0.75)" opacity="0.5">
          <use href="#kanokVineSegment" x="0" y="0" />
          <use href="#kanokVineSegment" x="60" y="0" />
          <use href="#kanokVineSegment" x="120" y="0" />
          <use href="#kanokVineSegment" x="180" y="0" />
          <use href="#kanokVineSegment" x="240" y="0" />
          <use href="#kanokVineSegment" x="300" y="0" />
          <use href="#kanokVineSegment" x="360" y="0" />
          <use href="#kanokVineSegment" x="420" y="0" />
        </g>
      </svg>
    </div>
  );
};
