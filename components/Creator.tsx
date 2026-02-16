import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const Creator: React.FC = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [qrLink, setQrLink] = useState(''); // 短链接专供二维码，避免过长导致白屏
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    const newPhotos: string[] = [];
    const fileList = Array.from(files).slice(0, 3) as File[];
    let processed = 0;
    
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 512; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          newPhotos.push(canvas.toDataURL('image/jpeg', 0.8));
          processed++;
          if (processed === fileList.length) {
            setPhotos(newPhotos);
            setIsUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = () => {
    if (!name || !date) return;
    setIsGenerating(true);
    setTimeout(() => {
      const baseUrl = window.location.origin + (window.location.pathname.replace(/\/$/, '') || '') || window.location.origin;
      const params = new URLSearchParams({
        name,
        date,
        sender: sender || '你的贴心好友',
        message: message || '',
        photos: JSON.stringify(photos)
      });
      const link = `${baseUrl}#/surprise?${params.toString()}`;
      const qrOnlyParams = new URLSearchParams({
        name,
        date,
        sender: sender || '你的贴心好友',
        message: message || '',
        photos: '[]'
      });
      const linkForQr = `${baseUrl}#/surprise?${qrOnlyParams.toString()}`;
      setGeneratedLink(link);
      setQrLink(linkForQr);
      setIsGenerating(false);
    }, 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink).then(() => {
      alert('🎀 秘密惊喜链接已复制！分享给 TA，开启这份魔法吧 ~');
    });
  };

  const saveQRCode = () => {
    const canvas = document.getElementById('birthday-qr-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = '生日惊喜二维码.png';
    a.click();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#fffafc] overflow-hidden z-10">
      <div className="cloud w-64 h-24 top-10 left-[-50px]"></div>
      <div className="cloud w-48 h-16 bottom-20 right-[-30px]" style={{animationDelay: '2s'}}></div>
      
      <div className="glass-card max-w-lg w-full p-8 md:p-12 rounded-[50px] relative animate-in fade-in zoom-in duration-700">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 ribbon font-chinese text-sm tracking-widest shadow-md">
          BIRTHDAY MAGIC MAKER
        </div>

        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-bounce">🎁</div>
          <h1 className="text-4xl font-chinese sanrio-gradient-text tracking-tight">定制生日魔法</h1>
          <p className="text-pink-300 mt-2 text-sm font-chinese tracking-widest opacity-80">你的用心，是 TA 最棒的礼物</p>
        </div>

        {isGenerating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-8 animate-pulse">
            <div className="text-7xl">🎀</div>
            <div className="text-xl font-chinese text-pink-400">正在编织魔法与惊喜...</div>
            <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
              <div className="h-full bg-pink-300 animate-progress"></div>
            </div>
          </div>
        ) : !generatedLink ? (
          <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-pink-400 font-bold text-xs ml-3 uppercase">1. 怎么称呼 TA</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="你的昵称" 
                  className="w-full px-6 py-4 rounded-full bg-white border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-all text-pink-600 font-chinese placeholder:text-pink-200" />
              </div>
              <div className="space-y-2">
                <label className="text-pink-400 font-bold text-xs ml-3 uppercase">2. TA 的生日</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} 
                  className="w-full px-6 py-4 rounded-full bg-white border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-all text-pink-600 font-chinese" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-pink-400 font-bold text-xs ml-3 uppercase">3. 你们的回忆 (上传一张照片)</label>
              <div onClick={() => fileInputRef.current?.click()} 
                className="w-full h-32 border-2 border-dashed border-pink-100 rounded-[30px] flex items-center justify-center gap-3 cursor-pointer hover:bg-pink-50/50 transition-all overflow-hidden bg-white/30">
                {photos.length > 0 ? (
                  <div className="flex gap-3">
                    {photos.map((p, i) => <img key={i} src={p} className="h-20 w-16 rounded-lg object-cover border-2 border-white shadow-md transform rotate-3" />)}
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-pink-200 text-3xl">🖼️</span>
                    <p className="text-pink-300 text-xs font-chinese mt-2">TA 将体验“刮刮乐”惊喜</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </div>

            <div className="space-y-2">
              <label className="text-pink-400 font-bold text-xs ml-3 uppercase">4. 走心寄语 & 署名</label>
              <div className="flex gap-4">
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="写下最想对 TA 说的话..." 
                  className="flex-grow px-6 py-4 rounded-[30px] bg-white border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-all h-24 resize-none text-pink-600 font-chinese placeholder:text-pink-200 text-sm" 
                />
                <input 
                  type="text" 
                  value={sender} 
                  onChange={(e) => setSender(e.target.value)} 
                  placeholder="署名" 
                  className="w-24 px-2 py-4 rounded-[30px] bg-white border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-all text-pink-600 font-chinese placeholder:text-pink-200 text-sm text-center h-24" 
                />
              </div>
            </div>

            <button type="button" disabled={isUploading} onClick={handleGenerate}
              className="w-full py-5 sanrio-btn text-white font-bold rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 sparkle-btn">
              {isUploading ? '处理中...' : '亲手封存这份惊喜 🪄'}
            </button>
          </form>
        ) : (
          <div className="space-y-10 text-center animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex flex-col items-center">
              <div className="text-8xl animate-bounce mb-4">✨🎀✨</div>
              <h2 className="text-3xl font-chinese text-pink-500">记忆封箱成功！</h2>
              <p className="text-pink-300 text-sm mt-2">快把链接或二维码发给 TA，微信扫一扫可直接在微信里打开看贺卡</p>
            </div>

            <div className="space-y-4 px-6">
              <button onClick={() => { const h = generatedLink.split('#')[1]; if (h) window.location.hash = h; }} 
                className="w-full py-5 bg-white border-2 border-[#ff85a1] text-[#ff85a1] font-bold rounded-full hover:bg-pink-50 transition-all flex items-center justify-center gap-2">
                立即预览魔法 👁️
              </button>
              <button onClick={copyLink} type="button"
                className="w-full py-5 sanrio-btn text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2">
                复制链接并分享 🔗
              </button>
            </div>

            {qrLink ? (
              <div className="flex flex-col items-center gap-3 p-6 bg-white/50 rounded-[30px] border-2 border-pink-100">
                <p className="text-pink-500 font-chinese text-sm font-bold">扫码看贺卡（支持微信内打开）</p>
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <QRCodeCanvas id="birthday-qr-canvas" value={qrLink} size={200} level="M" />
                </div>
                <button onClick={saveQRCode} type="button"
                  className="py-3 px-6 rounded-full bg-pink-100 text-pink-600 font-chinese text-sm font-bold hover:bg-pink-200 transition-all">
                  保存二维码图片 📥
                </button>
              </div>
            ) : null}
            
            <button onClick={() => { setGeneratedLink(''); setQrLink(''); }} type="button" className="text-pink-200 text-xs underline decoration-dotted">
              返回重新定制
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        .sanrio-btn {
          background: linear-gradient(135deg, #ff85a1 0%, #a18cd1 100%);
        }
      `}</style>
    </div>
  );
};

export default Creator;
