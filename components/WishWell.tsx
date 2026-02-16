
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface WishWellProps {
  onComplete: (keyword: string) => void;
}

const KEYWORDS = ['暴富', '被爱', '自由', '平安', '万事顺遂', '永葆童心', '好运连连', '光芒万丈'];

const WishWell: React.FC<WishWellProps> = ({ onComplete }) => {
  const [shaking, setShaking] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isJittering, setIsJittering] = useState(false);
  const starsRef = useRef<any[]>(Array.from({ length: 15 }).map(() => ({
    x: Math.random() * 80 + 10,
    y: Math.random() * 70 + 20,
    r: Math.random() * 360,
    emoji: ['⭐', '💖', '🎈', '✨', '🍭'][Math.floor(Math.random() * 5)]
  })));

  useEffect(() => {
    // 检测是否支持重力感应或是否为移动端
    const hasMotion = 'DeviceMotionEvent' in window;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!hasMotion || !isMobile) {
      setIsDesktop(true);
      setPermissionGranted(true); // 桌面端无需请求权限
    }
  }, []);

  const triggerResult = useCallback(() => {
    if (result) return;
    const finalWord = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    setResult(finalWord);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setTimeout(() => onComplete(finalWord), 3000);
  }, [result, onComplete]);

  const handleManualShake = () => {
    if (result) return;
    setIsJittering(true);
    setShaking(prev => {
      const next = prev + 4;
      if (next >= 40) triggerResult();
      return next;
    });
    setTimeout(() => setIsJittering(false), 100);
  };

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (result || isDesktop) return;
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    
    const threshold = 15;
    const delta = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
    
    if (delta > threshold) {
      setShaking(prev => {
        const next = prev + 1;
        if (next >= 40) triggerResult();
        return next;
      });
    }
  }, [result, isDesktop, triggerResult]);

  useEffect(() => {
    if (permissionGranted && !isDesktop) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [permissionGranted, isDesktop, handleMotion]);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') setPermissionGranted(true);
      } catch (e) {
        console.error("Permission denied", e);
        setIsDesktop(true); // 权限拒绝则切回手动模式
        setPermissionGranted(true);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 h-full text-center">
      {!permissionGranted && !isDesktop ? (
        <div className="animate-in fade-in zoom-in duration-500">
           <div className="text-8xl mb-8">🔮</div>
           <h2 className="text-2xl font-chinese text-pink-500 mb-4">进入幸运许愿池</h2>
           <p className="text-pink-300 font-chinese mb-10 text-sm px-10">我们需要感应你的动作来摇出年度好运</p>
           <button onClick={requestPermission} className="px-12 py-5 sanrio-btn text-white rounded-full font-chinese shadow-lg text-lg tracking-widest">
             开启魔法感应 🪄
           </button>
           <button onClick={() => {setIsDesktop(true); setPermissionGranted(true);}} className="block mx-auto mt-6 text-pink-200 text-xs underline">
             设备不支持？点击手动开启
           </button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
          <div 
            onClick={handleManualShake}
            className={`relative w-64 h-80 bg-white/40 rounded-b-[100px] rounded-t-[40px] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden mb-12 cursor-pointer transition-transform duration-75 ${isJittering ? 'scale-110 -rotate-3' : 'hover:scale-[1.02] active:scale-95'}`}
            style={{
                animation: isJittering ? 'jitter 0.1s infinite' : 'none'
            }}
          >
             {/* 瓶内的装饰星星 */}
             {starsRef.current.map((star, i) => (
               <div 
                 key={i} 
                 className="absolute text-2xl transition-all duration-300 pointer-events-none"
                 style={{
                   left: `${star.x}%`,
                   top: `${star.y}%`,
                   transform: `rotate(${star.r + (shaking * 10)}deg) translate(${(shaking % 10) * (i % 2 === 0 ? 1 : -1)}px, ${(-shaking % 5)}px)`,
                   opacity: result ? 0 : 0.8,
                   filter: `blur(${result ? '10px' : '0'})`
                 }}
               >
                 {star.emoji}
               </div>
             ))}

             {result && (
               <div className="animate-in zoom-in duration-1000 flex flex-col items-center z-10">
                  <div className="w-36 h-36 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.7)] border-4 border-white transform rotate-6">
                    <span className="text-4xl font-chinese text-white drop-shadow-md font-bold">{result}</span>
                  </div>
                  <div className="mt-6 text-pink-500 font-chinese font-bold text-xl">✨ 你的年度关键词 ✨</div>
               </div>
             )}
             
             {/* 液体效果层 */}
             <div className="absolute bottom-0 left-0 w-full h-1/3 bg-pink-100/20 pointer-events-none"></div>
          </div>

          {!result ? (
            <div className="space-y-4 px-6">
              <h2 className="text-3xl font-chinese sanrio-gradient-text animate-bounce">
                {isDesktop ? '点击瓶子摇晃！' : '用力摇晃手机！'}
              </h2>
              <p className="text-pink-300 font-chinese text-lg">摇出属于你的年度好运关键词...</p>
              
              <div className="relative w-56 h-4 bg-pink-50 rounded-full overflow-hidden mx-auto mt-8 border border-pink-100">
                <div 
                    className="h-full bg-gradient-to-r from-pink-300 to-rose-400 transition-all duration-300" 
                    style={{ width: `${(shaking / 40) * 100}%` }} 
                />
                {shaking > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] text-rose-500 font-bold tracking-tighter uppercase">
                        Magic Loading... {Math.floor((shaking/40)*100)}%
                    </div>
                )}
              </div>
              
              {isDesktop && (
                <p className="text-pink-200 text-xs font-chinese mt-4 opacity-70">
                  ( 连续点击瓶子，模拟真实摇晃感 )
                </p>
              )}
            </div>
          ) : (
            <div className="animate-pulse text-pink-400 font-chinese text-lg tracking-widest mt-4">
               好运魔法生效中，正在为您开启后续惊喜... ✨
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes jitter {
          0% { transform: translate(0,0) rotate(0); }
          25% { transform: translate(-5px, 5px) rotate(-5deg); }
          50% { transform: translate(5px, -5px) rotate(5deg); }
          75% { transform: translate(-5px, -5px) rotate(-5deg); }
          100% { transform: translate(5px, 5px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default WishWell;
