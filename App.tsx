
import React, { useState, useEffect } from 'react';
import Creator from './components/Creator';
import CardScene from './components/CardScene';
import { AppMode, BirthdayData } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CREATE);
  const [data, setData] = useState<BirthdayData | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/surprise')) {
        // 提取 ? 之后的内容进行解析
        const searchStr = hash.split('?')[1];
        if (searchStr) {
          const params = new URLSearchParams(searchStr);
          const name = params.get('name');
          const date = params.get('date');
          const sender = params.get('sender');
          const message = params.get('message');
          const photosRaw = params.get('photos');
          
          let photos = [];
          try {
            photos = photosRaw ? JSON.parse(photosRaw) : [];
          } catch (e) {
            console.error("Failed to parse photos", e);
          }

          if (name && date) {
            setData({ 
              name: decodeURIComponent(name), 
              date: decodeURIComponent(date), 
              sender: sender ? decodeURIComponent(sender) : undefined, 
              message: message ? decodeURIComponent(message) : undefined,
              photos 
            });
            setMode(AppMode.SURPRISE);
            return;
          }
        }
      }
      setMode(AppMode.CREATE);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#fffafc] relative overflow-hidden">
      {mode === AppMode.CREATE ? (
        <Creator />
      ) : (
        data && <CardScene data={data} />
      )}
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-24 h-24 bg-pink-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-100 rounded-full blur-3xl opacity-30"></div>
      </div>
    </div>
  );
};

export default App;
