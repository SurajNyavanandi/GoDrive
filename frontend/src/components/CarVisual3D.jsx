import React from 'react';

/**
 * 3D Isometric Car Visual Component
 * Renders stylized 3D automobile graphics with metallic paint gradients and lighting.
 */
export default function CarVisual3D({
  category = 'Sedan',
  vehicle = 'Car',
  className = '',
}) {
  const getCarPalette = () => {
    switch (category) {
      case 'Luxury':
        return {
          bodyGrad: ['#0f172a', '#1e293b', '#334155'],
          roofColor: '#020617',
          windowColor: '#38bdf8',
          accent: '#eab308',
        };
      case 'SUV':
        return {
          bodyGrad: ['#1e3a8a', '#2563eb', '#60a5fa'],
          roofColor: '#172554',
          windowColor: '#7dd3fc',
          accent: '#ffffff',
        };
      case 'Small Car':
        return {
          bodyGrad: ['#047857', '#059669', '#34d399'],
          roofColor: '#064e3b',
          windowColor: '#a7f3d0',
          accent: '#ffffff',
        };
      case 'Sedan':
      default:
        return {
          bodyGrad: ['#4338ca', '#6366f1', '#818cf8'],
          roofColor: '#312e81',
          windowColor: '#c7d2fe',
          accent: '#ffffff',
        };
    }
  };

  const palette = getCarPalette();

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 140 70"
        className="w-full h-auto drop-shadow-sm pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`carBody-${category}`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor={palette.bodyGrad[2]} />
            <stop offset="45%" stopColor={palette.bodyGrad[1]} />
            <stop offset="100%" stopColor={palette.bodyGrad[0]} />
          </linearGradient>

          <linearGradient id={`carGlass-${category}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="40%" stopColor={palette.windowColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="wheelRubber" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        {/* 3D Ground Shadow */}
        <ellipse cx="70" cy="58" rx="60" ry="7" fill="#94a3b8" fillOpacity="0.25" />

        {/* Main 3D Car Body Chassis */}
        <path
          d="M10 44 C10 42, 14 36, 24 35 L40 33 L55 18 C58 15, 64 14, 76 14 L95 14 C105 14, 110 18, 116 28 L126 33 C132 35, 134 38, 134 44 C134 49, 132 52, 126 52 L14 52 C10 52, 10 48, 10 44 Z"
          fill={`url(#carBody-${category})`}
        />

        {/* 3D Glass Cabin / Windshield & Windows */}
        <path
          d="M56 20 L73 17 L73 31 L44 31 Z"
          fill={`url(#carGlass-${category})`}
        />
        <path
          d="M77 17 L94 17 C102 17, 106 20, 110 28 L112 31 L77 31 Z"
          fill={`url(#carGlass-${category})`}
        />

        {/* Metallic Specular Highlight along Shoulder Line */}
        <path
          d="M18 36 L130 35"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />

        {/* Headlight (LED Glow) */}
        <path d="M128 36 L134 37 L132 41 L126 40 Z" fill="#fef08a" />
        {/* Taillight (Red LED) */}
        <path d="M10 38 L14 37 L14 42 L10 41 Z" fill="#ef4444" />

        {/* Front Wheel */}
        <g>
          <circle cx="104" cy="50" r="11" fill="url(#wheelRubber)" />
          <circle cx="104" cy="50" r="6" fill="#cbd5e1" />
          <circle cx="104" cy="50" r="2.5" fill="#1e293b" />
        </g>

        {/* Rear Wheel */}
        <g>
          <circle cx="36" cy="50" r="11" fill="url(#wheelRubber)" />
          <circle cx="36" cy="50" r="6" fill="#cbd5e1" />
          <circle cx="36" cy="50" r="2.5" fill="#1e293b" />
        </g>
      </svg>
    </div>
  );
}
