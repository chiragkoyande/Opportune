import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const count = 20;

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 10 + 15,
          delay: Math.random() * -20,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/30 dark:bg-primary/20 animate-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* Larger glowing orbs */}
      <div 
        className="absolute w-2 h-2 rounded-full bg-accent/40 animate-particle-glow"
        style={{ left: '10%', top: '20%', animationDelay: '0s' }}
      />
      <div 
        className="absolute w-3 h-3 rounded-full bg-primary/50 animate-particle-glow"
        style={{ left: '85%', top: '30%', animationDelay: '-3s' }}
      />
      <div 
        className="absolute w-2 h-2 rounded-full bg-hackathon/30 animate-particle-glow"
        style={{ left: '70%', top: '70%', animationDelay: '-5s' }}
      />
      <div 
        className="absolute w-3 h-3 rounded-full bg-internship/30 animate-particle-glow"
        style={{ left: '20%', top: '80%', animationDelay: '-7s' }}
      />
      <div 
        className="absolute w-2 h-2 rounded-full bg-contest/40 animate-particle-glow"
        style={{ left: '50%', top: '15%', animationDelay: '-2s' }}
      />
    </div>
  );
};

export default FloatingParticles;
