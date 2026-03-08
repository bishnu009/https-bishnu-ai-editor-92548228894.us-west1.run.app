
import React, { useMemo } from 'react';

const HeroBackground: React.FC = () => {
  // Generate random snow particles once
  const snowParticles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 1}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 20}s`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030308]">
      {/* Dynamic Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-nepalRed/30 rounded-full blur-[140px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-nepalBlue/30 rounded-full blur-[140px] animate-pulse-slow delay-1000" />
      
      {/* Additional Colors for Extra Vibrancy */}
      <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[20%] left-[5%] w-[35vw] h-[35vw] bg-amber-500/10 rounded-full blur-[120px] animate-float delay-700" />

      {/* Central Majestic Light Ray */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[90vw] h-[100vh] bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Snow Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {snowParticles.map((particle) => (
          <div
            key={particle.id}
            className="snow-particle animate-snow"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Abstract Nepali Flag Geometry - Stylized and Blowing */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none animate-float">
         <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_80px_rgba(220,20,60,0.7)] animate-wind-flutter">
            <defs>
              <linearGradient id="flagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC143C" />
                <stop offset="50%" stopColor="#8A2BE2" />
                <stop offset="100%" stopColor="#003893" />
              </linearGradient>
            </defs>
            <path d="M10 10 L 80 50 L 30 50 L 90 110 L 10 110 Z" fill="url(#flagGradient)" filter="blur(35px)" />
         </svg>
      </div>

      {/* Floating Particles Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-150 contrast-150 mix-blend-overlay"></div>
      
      {/* Grid overlay for futuristic feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Subtle Bottom Vignette to keep UI legible */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#020205] to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroBackground;
