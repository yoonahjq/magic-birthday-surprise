
import React from 'react';

interface AnimalFriendProps {
  type: 'rabbit' | 'cat' | 'bear';
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
  nickname?: string;
}

const AnimalFriend: React.FC<AnimalFriendProps> = ({ type, size = 'md', showBubble, nickname }) => {
  const getIcon = () => {
    switch (type) {
      case 'rabbit': return '🐰🎀';
      case 'cat': return '🐱💖';
      case 'bear': return '🐻🍯';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'rabbit': return `嘿！${nickname || '你'}生日快乐呀！快来尝尝我亲手采摘的草莓蛋糕！🍓`;
      case 'cat': return `喵~ 今天的你闪闪发光！所有小猫都想和你做朋友，派对开始咯！🎈`;
      case 'bear': return `大大的拥抱送给你！愿新的一岁像蜂蜜一样甜，无忧无虑 ✨`;
    }
  };

  const sizeClass = size === 'lg' ? 'text-8xl' : size === 'md' ? 'text-7xl' : 'text-5xl';

  return (
    <div className="relative flex flex-col items-center transition-all duration-500 group">
      <div className={`absolute -top-32 left-1/2 -translate-x-1/2 bg-white px-6 py-5 rounded-[30px] shadow-[0_15px_30px_rgba(255,133,161,0.25)] border-2 border-pink-100 text-base w-52 z-50 text-pink-500 font-chinese leading-relaxed text-center pointer-events-none transition-all duration-500 ${showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
        {getMessage()}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r-2 border-b-2 border-pink-100 rotate-45"></div>
      </div>
      <div className={`${sizeClass} drop-shadow-2xl hover:scale-110 active:scale-90 cursor-pointer transition-transform duration-300 animate-float-slow`}>
        {getIcon()}
      </div>
    </div>
  );
};

export default AnimalFriend;
