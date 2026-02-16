
import React, { useState, useEffect, useRef } from 'react';
import { BirthdayData, CardStep } from '../types';
import { generateBirthdayWish } from '../services/geminiService';
import Confetti from './Confetti';
import Cake from './Cake';
import AnimalFriend from './AnimalFriend';
import ScratchCard from './ScratchCard';
import LightGatherer from './LightGatherer';
import WishWell from './WishWell';
import DecibelBox from './DecibelBox';
import TimeTrajectory from './TimeTrajectory';
import ARPhoto from './ARPhoto';

const CardScene: React.FC<{ data: BirthdayData }> = ({ data }) => {
  const [step, setStep] = useState<CardStep>(CardStep.COUNTDOWN);
  const [daysPast, setDaysPast] = useState(0);
  const [wish, setWish] = useState('');
  const [revealedAnimals, setRevealedAnimals] = useState<number[]>([]);
  const [stackCount, setStackCount] = useState(0);
  const [isBlowing, setIsBlowing] = useState(false);
  const [isCandleOut, setIsCandleOut] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<'rabbit' | 'cat' | 'bear'>('rabbit');

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    const birth = new Date(data.date);
    const now = new Date();
    setDaysPast(Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));
    generateBirthdayWish(data.name).then(setWish);

    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    
    // 背景音乐源：优先本地文件（放 public/birthday.mp3 即可），其次外部链接
    const audioSources = [
      '/birthday.mp3',
      'https://upload.wikimedia.org/wikipedia/commons/d/d6/Happy_Birthday_to_You_on_Piano.ogg',
      'https://archive.org/download/happy-birthday-to-you-piano-version/Happy%20Birthday%20To%20You%20%28Piano%20Version%29.mp3',
      'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3',
      'https://cdn.pixabay.com/audio/2023/10/03/audio_f766699d55.mp3'
    ];
    
    let srcIndex = 0;
    const loadNext = () => {
      if (srcIndex >= audioSources.length) {
        console.warn("All audio sources failed to load. Add birthday.mp3 to public/ folder for reliable playback.");
        return;
      }
      const source = audioSources[srcIndex];
      srcIndex++;
      audio.src = source;
      audio.load();
    };

    const tryPlay = () => {
      if (audio.readyState >= 2) {
        audio.play().then(() => setMusicPlaying(true)).catch(() => {});
      } else {
        pendingPlayRef.current = true;
      }
    };

    const playWhenReady = () => {
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        audio.play().then(() => setMusicPlaying(true)).catch(() => {});
      }
    };
    audio.onerror = () => loadNext();
    audio.oncanplaythrough = playWhenReady;
    audio.onloadeddata = playWhenReady;

    loadNext();
    bgMusicRef.current = audio;

    return () => {
      pendingPlayRef.current = false;
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.removeAttribute('src');
        bgMusicRef.current = null;
      }
    };
  }, [data.date, data.name]);

  useEffect(() => {
    const shouldMonitor = step === CardStep.DECIBEL_BOX || step === CardStep.BLOW_CANDLE;
    let localCtx: AudioContext | null = null;
    let localStream: MediaStream | null = null;
    let animationFrameId: number;

    if (shouldMonitor) {
      const initMic = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStream = stream;
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          localCtx = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudio = () => {
            if (ctx.state === 'closed') return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setVolume(avg);
            animationFrameId = requestAnimationFrame(checkAudio);
          };
          checkAudio();
        } catch (e) {
          console.error("Mic access denied", e);
        }
      };
      initMic();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (localCtx && localCtx.state !== 'closed') {
        localCtx.close().catch(console.error);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  // 吹气检测：提高阈值并需持续约 300ms 才触发，避免环境音误触
  const blowThreshold = 45;
  const blowSustainMs = 250;
  const highVolumeSinceRef = useRef<number | null>(null);
  useEffect(() => {
    if (step !== CardStep.BLOW_CANDLE || isBlowing || isCandleOut) {
      highVolumeSinceRef.current = null;
      return;
    }
    if (volume > blowThreshold) {
      const now = Date.now();
      if (highVolumeSinceRef.current === null) highVolumeSinceRef.current = now;
      else if (now - highVolumeSinceRef.current >= blowSustainMs) {
        highVolumeSinceRef.current = null;
        handleBlow();
      }
    } else {
      highVolumeSinceRef.current = null;
    }
  }, [volume, step, isBlowing, isCandleOut]);

  const tryPlayMusic = () => {
    const audio = bgMusicRef.current;
    if (!audio) return;
    if (audio.readyState >= 2) {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    } else {
      pendingPlayRef.current = true;
    }
  };

  const handleStart = () => {
    setStep(CardStep.GATHER_LIGHT);
    tryPlayMusic();
  };

  const handleAnimalClick = (index: number) => {
    if (!musicPlaying) tryPlayMusic();
    if (!revealedAnimals.includes(index)) {
      setRevealedAnimals(prev => [...prev, index]);
      const types: ('rabbit' | 'cat' | 'bear')[] = ['rabbit', 'cat', 'bear'];
      setSelectedAnimal(types[index]);
      if (revealedAnimals.length + 1 >= 3) {
        setTimeout(() => setStep(CardStep.TIME_TRAJECTORY), 3000);
      }
    }
  };

  const handleBlow = () => {
    if (isBlowing || isCandleOut) return;
    setIsBlowing(true);
    setTimeout(() => {
      setIsCandleOut(true);
      setTimeout(() => setStep(CardStep.AR_PHOTO), 2500);
    }, 1000);
  };

  const getBgClass = () => {
    if (step < 2) return 'bg-[#1e1e2e]';
    if (step === CardStep.CAKE_STACK || step === CardStep.BLOW_CANDLE) return 'bg-[#e0f5ff]';
    return 'bg-[#fffafc]';
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-all duration-1000 ${getBgClass()} ${isShaking ? 'animate-shake' : ''}`}>
      {step > CardStep.COUNTDOWN && (
        <button onClick={() => { 
            if (bgMusicRef.current) {
              if (musicPlaying) {
                bgMusicRef.current.pause();
                setMusicPlaying(false);
              } else {
                bgMusicRef.current.play().then(() => setMusicPlaying(true));
              }
            }
          }}
          className={`fixed top-6 right-6 z-[100] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${musicPlaying ? 'bg-pink-100 text-pink-500 animate-spin-slow' : 'bg-gray-200 text-gray-500'}`}>
          {musicPlaying ? '🎵' : '🔇'}
        </button>
      )}

      {step === CardStep.COUNTDOWN && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 text-white animate-in fade-in duration-1000">
          <div className="text-8xl mb-8 animate-bounce">🎁</div>
          <h2 className="text-xl font-chinese mb-2 opacity-80 tracking-widest">嘘... 准备好了吗，{data.name}？</h2>
          <div className="text-8xl font-birthday sanrio-gradient-text mb-6">{daysPast.toLocaleString()}</div>
          <button onClick={handleStart} className="px-14 py-6 sanrio-btn text-white rounded-full font-chinese text-2xl tracking-widest shadow-xl">开启魔法胶囊 🪄</button>
        </div>
      )}

      {step === CardStep.GATHER_LIGHT && <LightGatherer onComplete={() => setStep(CardStep.DECIBEL_BOX)} />}
      {step === CardStep.DECIBEL_BOX && <DecibelBox volume={volume} name={data.name} onComplete={() => setStep(CardStep.ANIMALS)} />}

      {step === CardStep.ANIMALS && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 animate-in slide-in-from-bottom duration-1000">
          <h1 className="text-4xl font-chinese sanrio-gradient-text mb-16">惊喜派对，开始啦！🎉</h1>
          <div className="flex justify-center gap-4 sm:gap-12 items-end mb-24">
            {['rabbit', 'cat', 'bear'].map((t, i) => (
              <div key={i} onClick={() => handleAnimalClick(i)}>
                <AnimalFriend type={t as any} size={revealedAnimals.includes(i) ? "lg" : "md"} showBubble={revealedAnimals.includes(i)} nickname={data.name} />
              </div>
            ))}
          </div>
          <p className="text-pink-300 text-sm font-chinese tracking-widest animate-pulse">大家都有悄悄话要对你说 ({revealedAnimals.length}/3)</p>
        </div>
      )}

      {step === CardStep.TIME_TRAJECTORY && <TimeTrajectory days={daysPast} onComplete={() => setStep(data.photos?.length ? CardStep.SCRATCH_PHOTO : CardStep.WISH_WELL)} />}

      {step === CardStep.SCRATCH_PHOTO && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in duration-1000">
           <ScratchCard image={data.photos?.[0] || ''} onComplete={() => setStep(CardStep.WISH_WELL)} />
        </div>
      )}

      {step === CardStep.WISH_WELL && <WishWell onComplete={() => setStep(CardStep.CAKE_STACK)} />}

      {step === CardStep.CAKE_STACK && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 cursor-pointer" onClick={() => { 
          if (stackCount < 2) {
            setStackCount(2);
            setTimeout(() => setStep(CardStep.BLOW_CANDLE), 4000); 
          }
        }}>
          <h2 className="text-4xl font-chinese text-[#5a2e2e] mb-2 animate-bounce">天降甜蜜惊喜！🍰</h2>
          {/* 蛋糕整体下移，确保顶部蜡烛可见 */}
          <div className="flex justify-center items-end w-full h-[65vh] overflow-visible translate-y-32 transform">
            <Cake manualLayers={stackCount} />
          </div>
          <p className="text-[#8fbcdb] font-chinese mt-20 opacity-80 animate-pulse text-xl">
            {stackCount < 2 ? '点击屏幕，召唤你的巨型蛋糕！' : '哇！它是属于你的专属甜蜜 ✨'}
          </p>
        </div>
      )}

      {step === CardStep.BLOW_CANDLE && (
        <div className="relative w-full h-full overflow-hidden bg-[#e0f5ff]">
          {/* Top Prompt - Fixed Position */}
          <div className="absolute top-[12%] left-0 w-full text-center z-20 pointer-events-none px-4">
            <h2 className="text-3xl md:text-5xl font-chinese text-[#5a2e2e] drop-shadow-md animate-bounce mb-2">
              闭上眼，许个愿... 🕯️
            </h2>
            <p className="text-pink-400 font-chinese text-lg md:text-xl opacity-90 text-shadow-sm">
                ( 许完愿望后，用力吹灭蜡烛 )
            </p>
          </div>

          {/* Cake Layer - Absolute Center/Bottom，整体下移 */}
          <div className="absolute inset-0 flex items-end justify-center z-10 pb-20 md:pb-12 overflow-visible pointer-events-none">
             <div className="transform scale-90 md:scale-100 origin-bottom mb-4">
                <Cake manualLayers={2} isCandleOut={isCandleOut} isBlowing={isBlowing} />
             </div>
          </div>
          
          {/* Bottom Controls - Fixed Position */}
          <div className="absolute bottom-6 left-0 w-full flex justify-center z-50 px-6">
             <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl rounded-3xl p-5 border-2 border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-700">
                <div className="flex flex-col gap-3">
                   {/* Meter */}
                   <div className="flex flex-col gap-1">
                       <div className="flex justify-between text-xs font-chinese text-[#5a2e2e] font-bold px-1">
                          <span className="flex items-center gap-1">🎤 吹气能量值</span>
                          <span>{Math.min(100, Math.round((volume / blowThreshold) * 100))}%</span>
                       </div>
                       <div className="w-full h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative shadow-inner">
                          {/* Background stripes */}
                          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                          
                          {/* Bar */}
                          <div 
                            className="h-full bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-500 transition-all duration-100 ease-out flex items-center justify-end pr-2" 
                            style={{ width: `${Math.min(100, (volume / blowThreshold) * 100)}%` }} 
                          >
                             {volume > blowThreshold * 0.5 && <span className="text-[10px] text-white animate-pulse">💨</span>}
                          </div>
                       </div>
                   </div>

                   <div className="text-center">
                        <p className="text-[#5a2e2e] font-chinese text-sm font-bold animate-pulse">
                        对着麦克风 “呼~” 吹气
                        </p>
                        <p className="text-xs text-gray-500 font-chinese mt-1 scale-90">
                            ( 请允许使用麦克风权限 )
                        </p>
                   </div>

                   {/* Manual Button */}
                   <button 
                    onClick={handleBlow} 
                    className="w-full py-3 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-chinese text-sm shadow-lg shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                      <span>👆</span> 实在吹不灭？点击手动吹灭
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {step === CardStep.AR_PHOTO && <ARPhoto animalType={selectedAnimal} name={data.name} onComplete={() => setStep(CardStep.FINAL_LETTER)} />}

      {step === CardStep.FINAL_LETTER && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 animate-in zoom-in duration-1000 overflow-y-auto">
          <Confetti />
          <div className="glass-card p-8 md:p-12 max-w-lg w-full relative my-10">
            <h2 className="text-3xl font-chinese text-[#ff85a1] mb-6 border-b-2 border-pink-50 pb-4 inline-block">To {data.name}:</h2>
            <p className="italic text-lg font-chinese text-gray-700 leading-relaxed text-center mb-8 bg-pink-50/30 p-4 rounded-2xl">“ {wish} ”</p>
            
            {data.message && (
              <div className="mt-8 pt-8 border-t border-dashed border-pink-100">
                <p className="text-pink-500 font-bold text-xl font-chinese leading-relaxed text-center drop-shadow-sm">
                  「 {data.message} 」
                </p>
              </div>
            )}
            
            <div className="mt-12 text-right">
              <p className="text-[#ff85a1] font-bold text-2xl font-birthday">—— {data.sender || '你的贴心好友'}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sanrio-btn { background: linear-gradient(135deg, #ff85a1 0%, #a18cd1 100%); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
        .sanrio-btn:hover { transform: scale(1.05); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CardScene;
