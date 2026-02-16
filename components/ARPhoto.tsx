
import React, { useRef, useState, useEffect } from 'react';

interface ARPhotoProps {
  onComplete: () => void;
  animalType: 'rabbit' | 'cat' | 'bear';
  name: string;
}

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

const ARPhoto: React.FC<ARPhotoProps> = ({ onComplete, animalType, name }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [needUserTapToStart, setNeedUserTapToStart] = useState(isIOS);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraReady(false);
    setNeedUserTapToStart(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // 苹果机用简单约束，避免不兼容导致黑屏
      const constraints: MediaStreamConstraints = isIOS
        ? { video: { facingMode: 'user' } }
        : { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;

      let playAttempts = 0;
      const tryPlay = () => {
        playAttempts++;
        video.play().then(() => setIsCameraReady(true)).catch(() => {
          if (playAttempts < 5) setTimeout(tryPlay, 400);
        });
      };

      const fallbackTimer = setTimeout(tryPlay, 800);
      video.onloadedmetadata = () => {
        clearTimeout(fallbackTimer);
        tryPlay();
      };
      video.onloadeddata = () => tryPlay();
      video.onerror = () => clearTimeout(fallbackTimer);
    } catch (err) {
      console.error("Camera access failed", err);
      setNeedUserTapToStart(isIOS);
      alert("无法访问相机，请确保已授权并使用 Safari 或微信内浏览器。");
    }
  };

  useEffect(() => {
    if (!isIOS) startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 把 emoji 画到主 canvas 上（先画到小 canvas 再贴图，保证各端都显示）
  const drawEmojiSticker = (
    ctx: CanvasRenderingContext2D,
    emoji: string,
    x: number,
    y: number,
    sizePx: number,
    shadow = true
  ) => {
    const d = sizePx * 1.2;
    const c = document.createElement('canvas');
    c.width = d;
    c.height = d;
    const cctx = c.getContext('2d');
    if (!cctx) return;
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    if (shadow) {
      cctx.shadowBlur = 15;
      cctx.shadowColor = 'rgba(0,0,0,0.25)';
    }
    cctx.font = `${sizePx}px Arial`;
    cctx.fillText(emoji, d / 2, d / 2);
    ctx.drawImage(c, x - d / 2, y - d / 2, d, d);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isCameraReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const w = canvas.width;
    const h = canvas.height;

    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // 三个贴纸都画到成片上并保留
    drawEmojiSticker(ctx, '👑', w / 2, 100, 72);
    const animal = animalType === 'rabbit' ? '🐰' : animalType === 'cat' ? '🐱' : '🐻';
    drawEmojiSticker(ctx, animal, 100, h - 70, 90);
    drawEmojiSticker(ctx, '🎂', w - 120, h - 120, 80);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff85a1';
    ctx.font = 'bold 26px "ZCOOL KuaiLe"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${name}的专属惊喜`, w - 120, h - 50);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(dataUrl);
  };

  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

  const downloadPhoto = () => {
    if (!captured) return;
    if (isWeChat) {
      // 微信内无法直接下载：先合成带贴纸的图再打开，方便长按保存
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const w = c.width, h = c.height;
          drawEmojiSticker(ctx, '👑', w / 2, Math.round(h * 0.14), 72);
          const animal = animalType === 'rabbit' ? '🐰' : animalType === 'cat' ? '🐱' : '🐻';
          drawEmojiSticker(ctx, animal, Math.round(w * 0.1), h - Math.round(h * 0.12), 90);
          drawEmojiSticker(ctx, '🎂', w - Math.round(w * 0.15), h - Math.round(h * 0.18), 80);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ff85a1';
          ctx.font = 'bold 26px "ZCOOL KuaiLe"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${name}的专属惊喜`, w - Math.round(w * 0.15), h - Math.round(h * 0.07));
          window.open(c.toDataURL('image/jpeg', 0.9), '_blank');
        } else {
          window.open(captured, '_blank');
        }
      };
      img.onerror = () => window.open(captured, '_blank');
      img.src = captured;
    } else {
      const link = document.createElement('a');
      link.href = captured;
      link.download = `Magic_Birthday_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRetake = () => {
    setCaptured(null);
    setIsCameraReady(false);
    setTimeout(startCamera, 50);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 h-full text-center animate-in fade-in duration-700">
      <h2 className="text-3xl font-chinese sanrio-gradient-text mb-6">合个影吧！定格魔法瞬间 📸</h2>
      
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-[40px] overflow-hidden border-[12px] border-white shadow-2xl bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover scale-x-[-1] ${captured ? 'hidden' : 'block'}`}
          style={{ objectFit: 'cover', minHeight: '100%' }}
        />
        
        {!captured && needUserTapToStart && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a2e] text-white gap-4 p-6"
            onClick={() => startCamera()}
          >
            <span className="text-5xl">📷</span>
            <p className="font-chinese text-center text-lg">苹果设备需点击此处开启相机</p>
            <button type="button" className="px-8 py-4 rounded-full bg-pink-500 text-white font-chinese shadow-lg">
              点击开启相机
            </button>
          </div>
        )}
        {!captured && !isCameraReady && !needUserTapToStart && (
          <div className="absolute inset-0 flex items-center justify-center bg-pink-50">
            <div className="animate-spin text-4xl">🎀</div>
          </div>
        )}
        
        {!captured && isCameraReady && (
          <>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-5xl animate-bounce pointer-events-none">👑</div>
            <div className="absolute bottom-4 left-4 text-6xl pointer-events-none">{animalType === 'rabbit' ? '🐰' : animalType === 'cat' ? '🐱' : '🐻'}</div>
            <div className="absolute bottom-16 right-4 flex flex-col items-center pointer-events-none">
              <span className="text-5xl">🎂</span>
              <span className="text-white bg-pink-400 px-2 py-0.5 rounded-full text-xs font-chinese shadow-sm mt-[-6px]">{name}的生日蛋糕</span>
            </div>
          </>
        )}

        {captured && (
          <div className="relative w-full h-full">
            <img src={captured} className="w-full h-full object-cover object-center animate-in zoom-in duration-500" alt="Birthday Memory" />
            {/* 贴纸叠加层：成片始终显示三枚贴纸（兼容微信等 canvas emoji 不绘制的情况） */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute left-1/2 top-[14%] -translate-x-1/2 -translate-y-1/2 text-4xl drop-shadow-lg">👑</span>
              <span className="absolute left-[10%] bottom-[12%] text-5xl drop-shadow-lg">{animalType === 'rabbit' ? '🐰' : animalType === 'cat' ? '🐱' : '🐻'}</span>
              <span className="absolute right-[15%] bottom-[18%] text-4xl drop-shadow-lg">🎂</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {!captured ? (
          <button 
            onClick={takePhoto} 
            disabled={!isCameraReady}
            className="px-12 py-5 sanrio-btn text-white rounded-full font-chinese shadow-xl text-xl animate-pulse disabled:opacity-50"
          >
            咔嚓！拍照 🪄
          </button>
        ) : (
          <>
            <button onClick={handleRetake} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-full font-chinese hover:bg-gray-200 transition-all">
              重新拍摄
            </button>
            <button onClick={downloadPhoto} className="px-8 py-4 bg-blue-100 text-blue-500 rounded-full font-chinese hover:bg-blue-200 transition-all flex items-center gap-2">
              <span>💾</span> {isWeChat ? '打开图片后可长按保存' : '保存到本地'}
            </button>
            <button onClick={onComplete} className="px-10 py-5 sanrio-btn text-white rounded-full font-chinese shadow-xl text-lg">
              查看祝福 💌
            </button>
          </>
        )}
      </div>
      
      <p className="mt-6 text-pink-300 text-xs font-chinese max-w-xs opacity-70">
        {isWeChat ? '微信内：点击“打开图片”后长按图片即可保存到相册。' : '合影可点击“保存”按钮下载，快分享到朋友圈吧！'}
      </p>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ARPhoto;
