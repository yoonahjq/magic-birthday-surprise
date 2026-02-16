
import React, { useState, useEffect, useRef } from 'react';

interface LightGathererProps {
  onComplete: () => void;
}

const LightGatherer: React.FC<LightGathererProps> = ({ onComplete }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<any[]>([]);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    particles.current = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 60 + 330}, 100%, 70%)`
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(30, 30, 46, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particles.current.forEach(p => {
        if (isPressing) {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.vx += dx / dist * 0.5;
          p.vy += dy / dist * 0.5;
          p.vx *= 0.95;
          p.vy *= 0.95;
        } else {
          p.vx += (Math.random() - 0.5) * 0.2;
          p.vy += (Math.random() - 0.5) * 0.2;
          p.vx *= 0.99;
          p.vy *= 0.99;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
      });

      if (isPressing) {
        setProgress(prev => {
          const next = Math.min(prev + 0.8, 100);
          if (next === 100) onComplete();
          return next;
        });
      } else {
        setProgress(prev => Math.max(0, prev - 2));
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPressing, onComplete]);

  return (
    <div 
      className="relative w-full h-full bg-[#1e1e2e] flex flex-col items-center justify-center select-none"
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onTouchStart={() => setIsPressing(true)}
      onTouchEnd={() => setIsPressing(false)}
    >
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="absolute inset-0" />
      <div className="z-10 text-center pointer-events-none px-6">
        <h2 className="text-white font-chinese text-2xl mb-4 opacity-80">这一年你辛苦了...</h2>
        <p className="text-pink-300 font-chinese text-sm mb-12 animate-pulse">长按屏幕，收集散落的光亮</p>
        
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto mb-4">
          <div className="h-full bg-pink-400 transition-all duration-75" style={{ width: `${progress}%` }} />
        </div>
        
        <div className={`text-4xl transition-transform duration-300 ${isPressing ? 'scale-150' : 'scale-100'}`}>
          {progress > 80 ? '🌟' : progress > 50 ? '✨' : progress > 20 ? '💫' : '🌑'}
        </div>
      </div>
      
      {progress > 0 && (
        <div className="absolute inset-0 pointer-events-none bg-white transition-opacity duration-300" style={{ opacity: progress / 150 }} />
      )}
    </div>
  );
};

export default LightGatherer;
