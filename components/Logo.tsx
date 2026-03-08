import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DC143C" />
          <stop offset="100%" stopColor="#003893" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Abstract Background Shape - Stylized Nepal Flag / 'B' hybrid */}
      <path 
        d="M20 15 L 80 50 L 45 50 L 85 85 L 20 85 Z" 
        fill="url(#logoGradient)" 
        stroke="rgba(255,255,255,0.2)" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Tech Circuit / AI Eye Accents */}
      <circle cx="35" cy="50" r="8" fill="white" fillOpacity="0.9" filter="url(#logoGlow)" />
      <path d="M35 50 L 55 50 L 65 65" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      <circle cx="65" cy="65" r="2.5" fill="white" />
      
      {/* Glossy Overlay */}
      <path d="M20 15 L 50 32 L 30 32 Z" fill="white" fillOpacity="0.1" />
    </svg>
  );
};

export default Logo;