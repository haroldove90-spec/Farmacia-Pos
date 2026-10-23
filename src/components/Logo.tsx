import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-extrabold',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black'
  };

  const subSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Unencapsulated modern medical pharmacy logo glyph */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="logoSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          
          {/* Pharmacy cross with rounded clinical aesthetic */}
          <path
            d="M 38 10 H 62 Q 68 10 68 16 V 38 H 90 Q 96 38 96 44 V 56 Q 96 62 90 62 H 68 V 84 Q 68 90 62 90 H 38 Q 32 90 32 84 V 62 H 10 Q 4 62 4 56 V 44 Q 4 38 10 38 H 32 V 16 Q 32 10 38 10 Z"
            fill="url(#logoPrimary)"
          />

          {/* Central inner pulse/lifeline icon in pure white and emerald */}
          <circle cx="50" cy="50" r="18" fill="#ffffff" />
          <path
            d="M 37 50 H 43 L 47 41 L 52 59 L 56 46 L 60 50 H 63"
            stroke="#0d9488"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col leading-tight select-none">
        <div className={`tracking-tight text-slate-900 flex items-center gap-1.5 ${textSizes[size]}`}>
          <span>Farmacia</span>
          <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-sm tracking-wider uppercase font-black border border-teal-200/60">
            POS
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-medium text-slate-500 tracking-wide ${subSizes[size]}`}>
            Consultorios & Farmacia
          </span>
        )}
      </div>
    </div>
  );
};
