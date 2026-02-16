import React, { useState, useEffect } from 'react';
import Creator from './components/Creator';
import CardScene from './components/CardScene';
import SerialGate, { isSerialVerified, hasHashes } from './components/SerialGate';
import { AppMode, BirthdayData } from './types';

const PREVIEW_STORAGE_KEY = 'birthday_surprise_preview';

function parseSurpriseFromLocation(): { mode: AppMode; data: BirthdayData | null } {
  const pathname = window.location.pathname;
  const search = window.location.search;
  if (pathname === '/surprise' && search) {
    const params = new URLSearchParams(search);
    const isPreview = params.get('preview') === '1';
    if (isPreview) {
      try {
        const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as BirthdayData;
          sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
          if (data.name && data.date) return { mode: AppMode.SURPRISE, data };
        }
      } catch (e) {
        console.error("Preview data parse failed", e);
      }
    }
    const name = params.get('name');
    const date = params.get('date');
    const sender = params.get('sender');
    const message = params.get('message');
    const photosRaw = params.get('photos');
    let photos: string[] = [];
    try {
      photos = photosRaw ? JSON.parse(photosRaw) : [];
    } catch (e) {
      console.error("Failed to parse photos", e);
    }
    if (name && date) {
      return {
        mode: AppMode.SURPRISE,
        data: {
          name: decodeURIComponent(name),
          date: decodeURIComponent(date),
          sender: sender ? decodeURIComponent(sender) : undefined,
          message: message ? decodeURIComponent(message) : undefined,
          photos,
        },
      };
    }
  }
  return { mode: AppMode.CREATE, data: null };
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CREATE);
  const [data, setData] = useState<BirthdayData | null>(null);
  const [showCreator, setShowCreator] = useState(() => !hasHashes || isSerialVerified());

  useEffect(() => {
    const syncFromLocation = () => {
      const { mode: nextMode, data: nextData } = parseSurpriseFromLocation();
      setMode(nextMode);
      setData(nextData);
    };
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    const onConsumed = () => setShowCreator(false);
    window.addEventListener('serial-consumed', onConsumed);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('serial-consumed', onConsumed);
    };
  }, []);

  const needGate = mode === AppMode.CREATE && hasHashes && !showCreator;

  return (
    <div className="min-h-screen bg-[#fffafc] relative overflow-hidden">
      {needGate ? (
        <SerialGate onVerified={() => setShowCreator(true)} />
      ) : mode === AppMode.CREATE ? (
        <Creator />
      ) : (
        data ? <CardScene data={data} /> : null
      )}
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-24 h-24 bg-pink-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
};

export default App;
