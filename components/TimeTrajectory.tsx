
import React, { useState, useRef, useEffect } from 'react';

interface TimeTrajectoryProps {
  onComplete: () => void;
  days: number;
}

const TimeTrajectory: React.FC<TimeTrajectoryProps> = ({ onComplete, days }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connected, setConnected] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const points = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const start = { x: 60, y: canvas.height / 2 };
      const end = { x: canvas.width - 60, y: canvas.height / 2 };

      ctx.beginPath();
      ctx.arc(start.x, start.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ff85a1';
      ctx.fill();
      ctx.shadowBlur = 15; ctx.shadowColor = '#ff85a1';

      ctx.beginPath();
      ctx.arc(end.x, end.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#a18cd1';
      ctx.fill();
      ctx.shadowColor = '#a18cd1';

      if (points.current.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points.current[0].x, points.current[0].y);
        points.current.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = 'rgba(255, 133, 161, 0.5)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      if (!connected) requestAnimationFrame(draw);
    };
    draw();
  }, [connected]);

  const handleMove = (e: any) => {
    if (connected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

    if (drawing) {
      points.current.push({x, y});
      const dist = Math.sqrt((x - (canvas.width - 60))**2 + (y - (canvas.height/2))**2);
      if (dist < 40 && points.current.length > 20) {
        setConnected(true);
        setTimeout(onComplete, 4000);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#fffafc] p-6 text-center">
      <h2 className="text-2xl font-chinese text-pink-400 mb-4">连接属于我们的光芒 ✨</h2>
      <p className="text-pink-300 text-sm mb-12">从我这里，画一条轨迹到达你</p>
      
      <div className="relative w-full h-80 glass-card rounded-[40px] overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={window.innerWidth - 60} 
          height={320}
          onMouseDown={() => setDrawing(true)}
          onMouseUp={() => setDrawing(false)}
          onTouchStart={() => setDrawing(true)}
          onTouchEnd={() => setDrawing(false)}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        {connected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-1000 bg-white/60">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-pink-500 font-chinese text-xl font-bold">我们相遇，即是魔法</p>
            <p className="text-pink-300 font-chinese text-sm mt-4">在亿万人中，感谢我们画出了这条交点。</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-between w-full px-12 opacity-50">
         <div className="flex flex-col items-center"><span className="text-2xl">🙋‍♂️</span><span className="text-xs font-chinese">我</span></div>
         <div className="flex flex-col items-center"><span className="text-2xl">👸</span><span className="text-xs font-chinese">你</span></div>
      </div>
    </div>
  );
};

export default TimeTrajectory;
