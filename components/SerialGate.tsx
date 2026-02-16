import React, { useState } from 'react';

import codeHashes from '../code-hashes.json';

const STORAGE_KEY = 'serial_verified';
const PENDING_HASH_KEY = 'serial_pending_hash';
const CARD_DONE_KEY = 'serial_card_done';
const JUST_CONSUMED_KEY = 'serial_just_consumed';
export const USED_PREFIX = 'mb_used_';

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

/** 封存成功时调用：把本会话的序列号标为已用，之后该码不可再进 */
export function markCodeUsed(): void {
  const hash = sessionStorage.getItem(PENDING_HASH_KEY);
  if (hash) {
    localStorage.setItem(USED_PREFIX + hash, 'true');
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
      </div>

      <style>{`
        .sanrio-btn { background: linear-gradient(135deg, #ff85a1 0%, #a18cd1 100%); }
      `}</style>
    </div>
  );
};

export default SerialGate;
export { hasHashes };
