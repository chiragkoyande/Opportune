import { useEffect, useState, useCallback } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const colors = [
  'hsl(42, 95%, 55%)',   // primary gold
  'hsl(28, 95%, 55%)',   // accent orange
  'hsl(320, 75%, 60%)',  // hackathon pink
  'hsl(160, 65%, 50%)',  // internship green
];

const CursorSparkles = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const createSparkle = useCallback((x: number, y: number) => {
    const sparkle: Sparkle = {
      id: Date.now() + Math.random(),
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 30,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    return sparkle;
  }, []);

  useEffect(() => {
    const heroSection = document.querySelector('section');
    if (!heroSection) return;

    let animationId: number;
    let lastTime = 0;
    const throttleMs = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      lastTime = now;

      // Create 2-3 sparkles per movement
      const newSparkles = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () =>
        createSparkle(x, y)
      );

      setSparkles(prev => [...prev.slice(-15), ...newSparkles]);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setSparkles([]);
    };

    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('mouseenter', handleMouseEnter);
    heroSection.addEventListener('mouseleave', handleMouseLeave);

    // Clean up old sparkles
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(-12));
    }, 100);

    return () => {
      heroSection.removeEventListener('mousemove', handleMouseMove);
      heroSection.removeEventListener('mouseenter', handleMouseEnter);
      heroSection.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(cleanup);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [createSparkle]);

  if (!isHovering) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
        >
          {/* Star shape using CSS */}
          <svg
            viewBox="0 0 24 24"
            fill={sparkle.color}
            className="w-full h-full drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 ${sparkle.size / 2}px ${sparkle.color})`,
            }}
          >
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CursorSparkles;
