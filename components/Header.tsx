
import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  onHome: () => void;
  compact?: boolean;
  stealthMode?: boolean;
  onToggleStealth?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, compact = false, stealthMode = false, onToggleStealth }) => {
  return (
    <header className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50 transition-all duration-500 border-b ${
      stealthMode 
        ? 'bg-black border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
        : 'bg-white/80 backdrop-blur-md border-gray-100'
    } ${compact ? 'h-14 md:h-16 shadow-sm' : 'h-16 md:h-20'}`}>
      <div 
        className="flex items-center space-x-2 md:space-x-3 cursor-pointer group" 
        onClick={onHome}
      >
        <div className={`transition-transform duration-500 group-hover:rotate-12 ${stealthMode ? 'brightness-90' : ''} scale-90 md:scale-100`}>
          <Logo size="sm" />
        </div>
        <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors ${stealthMode ? 'text-white' : 'text-gray-900'}`}>
          Search<span className="text-[#00CC00]">Da</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          onClick={onToggleStealth}
          className={`group relative flex items-center justify-center md:space-x-2 w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full transition-all duration-300 border ${
            stealthMode 
              ? 'bg-[#00FF00] border-[#00FF00] text-black shadow-[0_0_20px_rgba(0,255,0,0.4)]' 
              : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
          }`}
          aria-label="Toggle Stealth Mode"
        >
          <i className={`fas ${stealthMode ? 'fa-mask' : 'fa-user-secret'} ${stealthMode ? 'animate-pulse' : ''}`}></i>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
            {stealthMode ? 'STEALTH ACTIVE' : 'STEALTH OFF'}
          </span>
          {stealthMode && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping"></span>
          )}
        </button>
        
        <div className={`px-2 md:px-3 py-1 rounded-full border text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
          stealthMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-gray-50 border-gray-100 text-gray-300'
        }`}>
          v1.0 beta
        </div>
      </div>
    </header>
  );
};

export default Header;
