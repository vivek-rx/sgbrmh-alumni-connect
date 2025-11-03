import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: NavItem[];
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  initialActiveIndex?: number;
  animationTime?: number;
  timeVariance?: number;
  colors?: number[];
}

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  initialActiveIndex = 0,
  animationTime = 600,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4]
}) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [particles, setParticles] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize particles
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      color: colors[i % colors.length],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    }));
    setParticles(newParticles);

    // Animate particles
    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [particleCount, colors]);

  const getColorClass = (colorIndex: number) => {
    const colorMap = {
      1: 'from-orange-400 to-orange-600',
      2: 'from-red-400 to-red-600',
      3: 'from-yellow-400 to-yellow-600',
      4: 'from-orange-500 to-red-600',
    };
    return colorMap[colorIndex as keyof typeof colorMap] || colorMap[1];
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Particle Background */}
      <div ref={canvasRef} className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute rounded-full bg-gradient-to-br ${getColorClass(particle.color)} opacity-20 blur-sm transition-all duration-1000`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Navigation Items */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex space-x-2">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setActiveIndex(index)}
              className={`
                relative px-6 py-3 rounded-full font-medium transition-all duration-300
                ${activeIndex === index
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-110'
                  : 'bg-white/10 backdrop-blur-md text-gray-700 hover:bg-white/20 hover:scale-105'
                }
              `}
              style={{
                filter: activeIndex === index ? 'url(#gooey)' : 'none',
                transitionDuration: `${animationTime + (Math.random() * timeVariance)}ms`,
              }}
            >
              <span className="relative z-10">{item.label}</span>
              
              {/* Active indicator blob */}
              {activeIndex === index && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-xl opacity-30 animate-pulse"
                  style={{ zIndex: -1 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* SVG Filter for Gooey Effect */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default GooeyNav;
