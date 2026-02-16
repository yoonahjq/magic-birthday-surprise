
import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  image: string;
  onComplete: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ image, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [pointsTouched, setPointsTouched] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制涂层
    ctx.fillStyle = '#ffdae9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 颗粒感装饰
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 500; i++) {
        ctx.fillStyle = 'white';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
    }
    ctx.globalAlpha = 1.0;

    // 绘制精美文案
    ctx.font = 'bold 18px "ZCOOL KuaiLe"';
    ctx.fillStyle = '#ff85a1';
    ctx.textAlign = 'center';
    ctx.fillText('有些瞬间，', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('值得我们反复擦亮', canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = '14px "ZCOOL KuaiLe"';
    ctx.globalAlpha = 0.6;
    ctx.fillText('—— 擦亮回忆瞬间 ——', canvas.width / 2, canvas.height / 2 + 50);
    ctx.globalAlpha = 1.0;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDone) return;
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();

      setPointsTouched(prev => {
        const next = prev + 1;
        if (next > 150 && next % 10 === 0) {
          checkCompletion(ctx, canvas);
        }
        return next;
      });
    };

    const checkCompletion = (context: CanvasRenderingContext2D, can: HTMLCanvasElement) => {
      const pixels = context.getImageData(0, 0, can.width, can.height).data;
      let revealed = 0;
      for (let i = 0; i < pixels.length; i += 64) {
        if (pixels[i + 3] === 0) revealed++;
      }
      
      if (revealed / (pixels.length / 64) > 0.65) {
        setIsDone(true);
        setTimeout(onComplete, 1200);
      }
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
    };
  }, [isDone, onComplete]);

  return (
    <div className="relative w-64 h-80 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white animate-in zoom-in duration-500 bg-gray-100">
      <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Memory" />
      <canvas 
        ref={canvasRef} 
        width={256} 
        height={320} 
        className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-1000 ${isDone ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default ScratchCard;
