import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

import codeHashes from '../code-hashes.json';

const STORAGE_KEY = 'serial_verified';
const PENDING_HASH_KEY = 'serial_pending_hash';
const CARD_DONE_KEY = 'serial_card_done';
const JUST_CONSUMED_KEY = 'serial_just_consumed';
export const USED_PREFIX = 'mb_used_';
const CARD_PREFIX = 'mb_card_';

export function isSerialVerified(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

export function setSerialVerified(): void {
  sessionStorage.setItem(STORAGE_KEY, 'true');
}

/** 本会话是否已用当前码生成过一张贺卡（一码一张） */
export function isCodeConsumedThisSession(): boolean {
  return sessionStorage.getItem(CARD_DONE_KEY) === 'true';
}

export type SavedCardPayload = { link: string; qrLink?: string };

/** 封存成功时调用：把本会话的序列号标为已用，并保存贺卡链接供之后用同一序列号找回 */
export function markCodeUsed(payload?: SavedCardPayload): void {
  const hash = sessionStorage.getItem(PENDING_HASH_KEY);
  if (hash) {
    localStorage.setItem(USED_PREFIX + hash, 'true');
    if (payload) localStorage.setItem(CARD_PREFIX + hash, JSON.stringify(payload));
    sessionStorage.removeItem(PENDING_HASH_KEY);
    sessionStorage.setItem(CARD_DONE_KEY, 'true');
  }
}

export function setJustConsumedMessage(): void {
  sessionStorage.setItem(JUST_CONSUMED_KEY, 'true');
}

export function consumeJustConsumedMessage(): boolean {
  const v = sessionStorage.getItem(JUST_CONSUMED_KEY) === 'true';
  if (v) sessionStorage.removeItem(JUST_CONSUMED_KEY);
  return v;
}

function hashCode(str: string): Promise<string> {
  const enc = new TextEncoder();
  return crypto.subtle.digest('SHA-256', enc.encode(str)).then((buf) => {
    const arr = Array.from(new Uint8Array(buf));
    return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
  });
}

const hashSet = new Set<string>(codeHashes as string[]);
const hasHashes = hashSet.size > 0;

type Props = { onVerified: () => void };

const SerialGate: React.FC<Props> = ({ onVerified }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'invalid' | 'used' | 'empty' | null>(null);
  const [showConsumedMsg] = useState(() => consumeJustConsumedMessage());
  const [savedCard, setSavedCard] = useState<SavedCardPayload | null>(null);

  if (!hasHashes) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fffafc]">
        <p className="text-pink-500 font-chinese">当前未启用序列号，可直接使用。</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = code.trim().toUpperCase();
    if (!raw) {
      setError('empty');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const hash = await hashCode(raw);
      if (!hashSet.has(hash)) {
        setError('invalid');
        setLoading(false);
        return;
      }
      const usedKey = USED_PREFIX + hash;
      if (localStorage.getItem(usedKey) === 'true') {
        const cardRaw = localStorage.getItem(CARD_PREFIX + hash);
        if (cardRaw) {
          try {
            const card = JSON.parse(cardRaw) as SavedCardPayload;
            if (card?.link) {
              setSavedCard(card);
              setError(null);
              setLoading(false);
              return;
            }
          } catch (_) {}
        }
        setError('used');
        setLoading(false);
        return;
      }
      sessionStorage.setItem(PENDING_HASH_KEY, hash);
      setSerialVerified();
      onVerified();
    } catch {
      setError('invalid');
    } finally {
      setLoading(false);
    }
  };

  const errorText =
    error === 'empty'
      ? '请输入序列号'
      : error === 'used'
        ? '该序列号已在本设备使用过，每个码仅可使用一次'
        : error === 'invalid'
          ? '序列号无效，请核对后重试'
          : null;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#fffafc] overflow-hidden z-10">
      <div className="cloud w-64 h-24 top-10 left-[-50px]"></div>
      <div className="cloud w-48 h-16 bottom-20 right-[-30px]" style={{ animationDelay: '2s' }}></div>

      <div className="glass-card max-w-md w-full p-8 md:p-12 rounded-[50px] relative">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 ribbon font-chinese text-sm tracking-widest shadow-md">
          兑换入口
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎟️</div>
          <h1 className="text-3xl font-chinese sanrio-gradient-text tracking-tight">魔法生日惊喜</h1>
          <p className="text-pink-300 mt-2 text-sm font-chinese">请输入您的序列号，每码仅可生成一张贺卡，请勿分享</p>
        </div>

        {showConsumedMsg && (
          <p className="text-center text-pink-500 font-chinese text-sm mb-4 rounded-2xl bg-pink-50 py-3 px-4">
            您本码已成功生成一张贺卡，如需再制请使用新序列号
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="XXXX-XXXX-XXXX"
            disabled={loading}
            className="w-full px-6 py-4 rounded-full bg-white border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-all text-pink-600 font-chinese placeholder:text-pink-200 text-center tracking-widest"
          />
          {errorText && (
            <p className="text-red-400 text-sm font-chinese text-center -mt-2">{errorText}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 sanrio-btn text-white font-bold rounded-full shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? '验证中...' : '验证并进入定制 🎀'}
          </button>
        </form>

        {savedCard ? (
          <div className="mt-8 pt-8 border-t border-pink-100 space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-chinese text-pink-500 text-center">您的贺卡</h2>
            <p className="text-pink-300 text-sm font-chinese text-center">用本序列号可随时找回链接与二维码，无需再麻烦客服</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(savedCard.link);
                  alert('链接已复制，可粘贴分享给 TA');
                }}
                className="w-full py-3 rounded-full bg-pink-50 text-pink-600 font-chinese text-sm font-bold hover:bg-pink-100 transition-all"
              >
                复制分享链接
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = savedCard.link; }}
                className="w-full py-3 rounded-full sanrio-btn text-white font-chinese text-sm font-bold hover:opacity-90 transition-all"
              >
                打开贺卡页面
              </button>
            </div>
            {(savedCard.qrLink || savedCard.link) && (
              <div id="recovery-qr" className="flex flex-col items-center gap-2 p-4 bg-white/50 rounded-2xl border border-pink-100">
                <p className="text-pink-500 font-chinese text-xs font-bold">扫码或点上方链接打开</p>
                <QRCodeCanvas value={savedCard.qrLink || savedCard.link} size={160} level="M" />
                <button
                  type="button"
                  onClick={() => {
                    const canvas = document.querySelector('#recovery-qr canvas') as HTMLCanvasElement | null;
                    if (canvas) {
                      const a = document.createElement('a');
                      a.href = canvas.toDataURL('image/png');
                      a.download = '生日惊喜二维码.png';
                      a.click();
                    }
                  }}
                  className="py-2 px-4 rounded-full bg-pink-100 text-pink-600 font-chinese text-xs font-bold"
                >
                  保存二维码图片
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSavedCard(null)}
              className="text-pink-300 text-xs font-chinese underline"
            >
              返回输入序列号
            </button>
          </div>
        ) : null}
      </div>

      <style>{`
        .sanrio-btn { background: linear-gradient(135deg, #ff85a1 0%, #a18cd1 100%); }
      `}</style>
    </div>
  );
};

export default SerialGate;
export { hasHashes };
