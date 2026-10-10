import React from 'react';

/**
 * 3D Stylized Chauffeur Avatar Component
 * Rendered with volumetric gradient lighting, specular highlights, and 3D depth.
 */
export default function DriverAvatar3D({
  type = 'suit',
  name = 'Driver',
  isPro = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-13 h-13',
    lg: 'w-16 h-16',
  };

  // Palette schemes for different 3D avatar characters
  const getTheme = () => {
    switch (type) {
      case 'cap': // Chauffeur with classic cap
        return {
          bgGrad: 'from-amber-500/20 via-blue-500/15 to-indigo-500/30',
          border: 'border-blue-200',
          hatColor: '#1e293b',
          hatBand: '#3b82f6',
          suitColor: '#334155',
          tieColor: '#2563eb',
          skinTone: '#f4b28c',
          hairColor: '#1e293b',
        };
      case 'female': // Female executive chauffeur
        return {
          bgGrad: 'from-purple-500/20 via-pink-500/15 to-blue-500/25',
          border: 'border-purple-200',
          suitColor: '#1e1b4b',
          tieColor: '#ec4899',
          skinTone: '#f7c5a0',
          hairColor: '#451a03',
        };
      case 'vip': // VIP Luxury Chauffeur
        return {
          bgGrad: 'from-amber-400/30 via-yellow-500/20 to-blue-600/30',
          border: 'border-amber-300',
          suitColor: '#0f172a',
          tieColor: '#eab308',
          skinTone: '#e5a176',
          hairColor: '#0f172a',
        };
      case 'casual': // Friendly city driver
        return {
          bgGrad: 'from-emerald-500/20 via-teal-500/15 to-blue-500/20',
          border: 'border-emerald-200',
          suitColor: '#0f766e',
          tieColor: '#0d9488',
          skinTone: '#f4b28c',
          hairColor: '#292524',
        };
      case 'suit':
      default: // Dark executive suit
        return {
          bgGrad: 'from-blue-600/20 via-indigo-600/15 to-slate-800/25',
          border: 'border-blue-200',
          suitColor: '#0f172a',
          tieColor: '#0071e3',
          skinTone: '#e29a6b',
          hairColor: '#1e293b',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`relative ${sizeMap[size] || sizeMap.md} rounded-2xl bg-gradient-to-br ${theme.bgGrad} border ${theme.border} p-1 shadow-xs flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-200`}
      title={name}
    >
      {/* 3D Specular Rim Light */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl pointer-events-none" />

      {/* 3D Character SVG Render */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md select-none pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Head 3D Sphere Gradient */}
          <radialGradient id={`head3d-${type}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="25%" stopColor={theme.skinTone} />
            <stop offset="100%" stopColor="#96522c" />
          </radialGradient>

          {/* Torso / Suit 3D Cylinder Gradient */}
          <linearGradient id={`suit3d-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="40%" stopColor={theme.suitColor} />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Tie 3D Gradient */}
          <linearGradient id={`tie3d-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.tieColor} />
            <stop offset="100%" stopColor="#003580" />
          </linearGradient>

          {/* Gold Accent for VIP */}
          {isPro && (
            <linearGradient id={`gold3d-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
          )}
        </defs>

        {/* 3D Shoulders & Suit Coat */}
        <path
          d="M15 95 C15 72, 32 68, 50 68 C68 68, 85 72, 85 95 Z"
          fill={`url(#suit3d-${type})`}
        />

        {/* Crisp Shirt Collar */}
        <polygon points="40,68 50,82 46,68" fill="#ffffff" />
        <polygon points="60,68 50,82 54,68" fill="#ffffff" />

        {/* 3D Tie */}
        <polygon points="47,72 53,72 55,92 50,96 45,92" fill={`url(#tie3d-${type})`} />

        {/* 3D Neck with Shadow */}
        <rect x="44" y="56" width="12" height="15" rx="3" fill="#a15833" />
        <rect x="44" y="56" width="12" height="15" rx="3" fill={`url(#head3d-${type})`} opacity="0.85" />

        {/* 3D Head Sphere */}
        <circle cx="50" cy="40" r="21" fill={`url(#head3d-${type})`} />

        {/* Hair / Head Styling */}
        {type === 'female' ? (
          /* Female Chauffeur Hair */
          <path
            d="M28 40 C28 20, 72 20, 72 40 C72 50, 68 54, 68 46 C68 30, 32 30, 32 46 C32 54, 28 50, 28 40 Z"
            fill={theme.hairColor}
          />
        ) : type === 'cap' ? (
          /* Chauffeur Cap / Peaked Uniform Hat */
          <g>
            {/* Cap Crown */}
            <path
              d="M26 33 C26 21, 74 21, 74 33 C74 37, 26 37, 26 33 Z"
              fill={theme.hatColor}
            />
            {/* Cap Band with Accent */}
            <path d="M26 33 L74 33 L72 36 L28 36 Z" fill={theme.hatBand} />
            {/* Cap Visor with 3D Specular Curve */}
            <path
              d="M23 35 C28 42, 72 42, 77 35 C70 38, 30 38, 23 35 Z"
              fill="#0f172a"
            />
            {/* Chauffeur Gold Badge */}
            <circle cx="50" cy="29" r="3" fill="#eab308" />
          </g>
        ) : (
          /* Neatly Groomed Hair */
          <path
            d="M31 33 C31 22, 69 22, 69 33 C69 26, 61 24, 50 24 C39 24, 31 26, 31 33 Z"
            fill={theme.hairColor}
          />
        )}

        {/* Eyes & Eyebrows */}
        <circle cx="43" cy="39" r="2.2" fill="#1e293b" />
        <circle cx="57" cy="39" r="2.2" fill="#1e293b" />
        <circle cx="44" cy="38" r="0.8" fill="#ffffff" />
        <circle cx="58" cy="38" r="0.8" fill="#ffffff" />

        {/* Friendly Courteous Smile */}
        <path
          d="M44 49 C46 52, 54 52, 56 49"
          stroke="#88421d"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* 3D Lighting Ear Spheres */}
        <circle cx="29" cy="41" r="3.5" fill={`url(#head3d-${type})`} />
        <circle cx="71" cy="41" r="3.5" fill={`url(#head3d-${type})`} />
      </svg>

      {/* Pro Crown Badge */}
      {isPro && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-amber-950 rounded-full font-bold text-[9px] flex items-center justify-center border border-white shadow-xs"
          title="VIP Verified Driver"
        >
          ★
        </span>
      )}
    </div>
  );
}
