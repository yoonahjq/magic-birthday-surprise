
import React from 'react';

interface CakeProps {
  manualLayers: number;
  isCandleOut?: boolean;
  isBlowing?: boolean;
}

const Cake: React.FC<CakeProps> = ({ manualLayers, isCandleOut, isBlowing }) => {
  const outlineColor = "#5a2e2e";

  // 厚实的波浪奶油层
  const ScallopedCream = () => (
    <div className="absolute top-0 left-0 w-full h-[55%] bg-white z-10 rounded-t-[35px] border-b-[6px]" style={{ borderColor: outlineColor }}>
      <div className="absolute -bottom-5 left-0 w-full flex justify-between px-[1px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            className="w-[15%] aspect-square bg-white rounded-full border-b-[8px] border-x-[6px]" 
            style={{ borderColor: outlineColor, marginTop: '-6px' }} 
          />
        ))}
      </div>
    </div>
  );

  // 单根长蜡烛组件 - 优化位置与层级，确保可见，且吹灭时不消失
  const SingleTallCandle = () => (
    // 使用 top: 0 和 translateY 负值，确保从蛋糕顶部向上延伸
    <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-500" style={{ top: '10px', zIndex: 35 }}>
      {/* 始终渲染蜡烛主体，不因 isCandleOut 而移除 */}
      <div className="relative -translate-y-[100%]">
        {/* 蜡烛主体：h-48 (12rem/192px) 使其挺拔且高出蛋糕 */}
        <div className="w-5 h-52 bg-white border-[5px] rounded-full shadow-lg overflow-hidden relative" style={{ borderColor: outlineColor }}>
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,#ff85a1_6px,#ff85a1_12px)]" />
        </div>
        
        {/* Wick */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-black/40 rounded-full" />

        {/* Flame Container - Handles appearance/disappearance separate from flicker */}
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-14 h-24 origin-bottom transition-all duration-300 ease-in-out
          ${(isBlowing || isCandleOut) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} 
          style={{ zIndex: 60 }}>
            {/* Inner Flame - Handles flickering */}
            <div className="w-full h-full bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-100 rounded-full blur-[1px] animate-flame"></div>
        </div>
        
        {/* Smoke Effect - Enhanced with multiple particles */}
        {isCandleOut && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 overflow-visible pointer-events-none" style={{ zIndex: 59 }}>
             <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full animate-smoke-1 opacity-0 blur-sm"></div>
             <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full animate-smoke-2 opacity-0 blur-md" style={{ animationDelay: '0.1s' }}></div>
             <div className="absolute left-1/2 -translate-x-1/2 w-3 h-8 bg-gray-400/50 rounded-full animate-smoke-3 opacity-0 blur-sm" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* 根部阴影 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/10 rounded-full blur-sm" />
      </div>
    </div>
  );

  // 爱心弧形环绕
  const HeartRainbow = () => {
    const hearts = Array.from({ length: 9 });
    return (
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible">
        {hearts.map((_, i) => {
          const angle = (i / (hearts.length - 1)) * Math.PI - Math.PI;
          const radiusX = 380;
          const radiusY = 300;
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY - 180;
          return (
            <div 
              key={i} 
              className="absolute text-5xl animate-float-heart"
              style={{ 
                left: `calc(50% + ${x}px)`, 
                top: `calc(50% + ${y}px)`,
                animationDelay: `${i * 0.15}s`,
                filter: 'drop-shadow(0 6px 0 #5a2e2e)'
              }}
            >
              💗
            </div>
          );
        })}
      </div>
    );
  };

  const CakeLayer = ({ width, height, color, children, zIndex, clip = true }: any) => (
    <div className="relative" style={{ width: `${width}px`, zIndex }}>
      <div 
        className={`relative rounded-[45px] border-[6px] shadow-[inset_-12px_-12px_0_rgba(0,0,0,0.06)] ${clip ? 'overflow-hidden' : ''}`} 
        style={{ 
          height: `${height}px`, 
          backgroundColor: color,
          borderColor: outlineColor,
          borderBottomWidth: '16px'
        }}
      >
        <ScallopedCream />
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-end pb-12 h-[800px] scale-[0.6] sm:scale-75 select-none overflow-visible">
      <HeartRainbow />
      
      {/* 整个两层蛋糕作为一个整体下落 */}
      <div className={`flex flex-col-reverse items-center -space-y-12 ${manualLayers >= 2 ? 'animate-cake-drop-2' : 'opacity-0'} transition-opacity duration-300 overflow-visible`}>
        
        {/* 第一层: 底层 */}
        <CakeLayer width={500} height={220} zIndex={10} color="#fbc2cc" />

        {/* 第二层: 顶层 (核心装饰层) */}
        <div className="relative z-30 overflow-visible">
          {/* clip=false 允许蜡烛向上伸展 */}
          <CakeLayer width={340} height={180} zIndex={30} color="#ff9eaa" clip={false}>
            
            {/* 核心单根蜡烛：放置在顶层中心，允许超出边界 */}
            <SingleTallCandle />

            {/* 草莓装饰：环绕并遮挡蜡烛根部，放在最上层 */}
            <div className="absolute top-[20%] left-[10%] text-7xl transform -rotate-15 z-40 drop-shadow-lg">🍓</div>
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 text-9xl z-50 drop-shadow-xl translate-y-6">🍓</div>
            <div className="absolute top-[20%] right-[10%] text-7xl transform rotate-15 z-40 drop-shadow-lg">🍓</div>
            
          </CakeLayer>
        </div>
      </div>

      {/* 底部投影 */}
      <div className={`absolute bottom-[-30px] w-[560px] h-[65px] bg-black/10 rounded-full blur-3xl -z-20 transition-transform duration-1000 ${manualLayers >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>

      <style>{`
        @keyframes cake-drop-2 { 
          0% { transform: translateY(-1600px) scaleY(3.0) scaleX(0.3); opacity: 0; } 
          50% { opacity: 1; }
          70% { transform: translateY(100px) scaleY(0.2) scaleX(2.0); }
          85% { transform: translateY(-80px) scaleY(1.6) scaleX(0.6); }
          92% { transform: translateY(40px) scaleY(0.65) scaleX(1.5); }
          100% { transform: translateY(0) scaleY(1) scaleX(1); opacity: 1; } 
        }
        @keyframes flame { 
          0%, 100% { transform: scale(1) rotate(-2deg); opacity: 0.9; } 
          50% { transform: scale(1.1, 1.2) rotate(2deg); opacity: 1; } 
        }
        @keyframes smoke-1 {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
          20% { opacity: 0.6; }
          100% { opacity: 0; transform: translate(-60%, -80px) scale(2); }
        }
        @keyframes smoke-2 {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
          30% { opacity: 0.5; }
          100% { opacity: 0; transform: translate(-40%, -100px) scale(2.5); }
        }
        @keyframes smoke-3 {
          0% { opacity: 0; height: 10px; transform: translate(-50%, 0); }
          20% { opacity: 0.4; }
          100% { opacity: 0; height: 120px; transform: translate(-50%, -60px); }
        }
        @keyframes float-heart {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          50% { transform: translateY(-50px) scale(1.35) rotate(15deg); }
        }
        .animate-cake-drop-2 { 
          animation: cake-drop-2 1.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
        .animate-flame { 
          animation: flame 0.3s ease-in-out infinite alternate; 
        }
        .animate-smoke-1 { animation: smoke-1 2.5s ease-out forwards; }
        .animate-smoke-2 { animation: smoke-2 3s ease-out forwards; }
        .animate-smoke-3 { animation: smoke-3 2s ease-out forwards; }
        .animate-float-heart {
          animation: float-heart 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Cake;
