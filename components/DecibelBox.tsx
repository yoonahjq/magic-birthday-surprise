
import React, { useState, useEffect } from 'react';

interface DecibelBoxProps {
  volume: number;
  onComplete: () => void;
  name: string;
}

const DecibelBox: React.FC<DecibelBoxProps> = ({ volume, onComplete, name }) => {
  const [isBroken, setIsBroken] = useState(false);
  const [shaking, setShaking] = useState(0);

  useEffect(() => {
    if (isBroken) return;
    // 大喊更灵敏：门槛降至 18，积累更快
    if (volume > 18) {
      setShaking(prev => {
        const next = prev + (volume / 10);
        if (next >= 100) {
          setIsBroken(true);
          setTimeout(onComplete, 3000);
        }
        return next;
      });
    } else {
      setShaking(prev => Math.max(0, prev - 0.4));
    }
  }, [volume, isBroken, onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 h-full text-center overflow-hidden">
      {!isBroken ? (
        <div className="animate-in zoom-in duration-500">
          <div 
            className="relative w-64 h-64 flex items-center justify-center cursor-pointer transition-transform"
            style={{ 
              transform: `scale(${1 + volume/150}) rotate(${Math.sin(Date.now()/50) * (volume/8)}deg)`,
              animation: volume > 15 ? 'jitter 0.1s infinite' : 'none'
            }}
          >
            <div className="absolute inset-0 bg-pink-400 rounded-3xl shadow-2xl flex items-center justify-center text-8xl">🎁</div>
            <div className="absolute top-0 w-full h-8 bg-pink-500 rounded-t-3xl shadow-md"></div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 text-6xl">🎀</div>
            {/* 进度提示线 */}
            <div className="absolute -bottom-12 w-full h-3 bg-pink-50 rounded-full overflow-hidden border border-pink-100">
              <div className="h-full bg-pink-500 transition-all duration-75" style={{ width: `${shaking}%` }} />
            </div>
          </div>
          <h2 className="text-3xl font-chinese sanrio-gradient-text mt-20 mb-4 animate-bounce">
            大声喊出你的爱！💖
          </h2>
          <p className="text-pink-300 font-chinese text-lg opacity-80">
            声音越大，礼物拆得越快哦...
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-1000 flex flex-col items-center">
          <div className="text-9xl mb-12 animate-ping">✨</div>
          <div className="flex flex-wrap justify-center gap-4 max-w-md">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className="animate-float-up text-pink-400 font-chinese font-bold bg-white/80 px-4 py-2 rounded-full shadow-sm" style={{animationDelay: `${i*0.1}s`}}>
                {name} 生日快乐！🎂
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes jitter { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-3px, 3px); } 75% { transform: translate(3px, -3px); } }
        @keyframes float-up { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-100vh) scale(1.5); opacity: 0; } }
        .animate-float-up { animation: float-up 3s ease-in forwards; }
      `}</style>
    </div>
  );
};

export default DecibelBox;
