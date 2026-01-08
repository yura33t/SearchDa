import React, { useState } from 'react';
import Logo from './Logo';

interface HeaderProps {
  onHome: () => void;
  compact?: boolean;
  stealthMode?: boolean;
  onToggleStealth?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, compact = false, stealthMode = false, onToggleStealth }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(localStorage.getItem('searchda_custom_key') || '');

  const saveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('searchda_custom_key', tempKey.trim());
    } else {
      localStorage.removeItem('searchda_custom_key');
    }
    setIsSettingsOpen(false);
    window.location.reload(); // Refresh to apply new key
  };

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
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            stealthMode ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title="Settings"
        >
          <i className="fas fa-cog"></i>
        </button>

        <button
          onClick={onToggleStealth}
          className={`group relative flex items-center justify-center md:space-x-2 w-10 h-10 md:w-auto md:px-4 md:py-2 rounded-full transition-all duration-300 border ${
            stealthMode 
              ? 'bg-[#00FF00] border-[#00FF00] text-black shadow-[0_0_20px_rgba(0,255,0,0.4)]' 
              : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
          }`}
        >
          <i className={`fas ${stealthMode ? 'fa-mask' : 'fa-user-secret'} ${stealthMode ? 'animate-pulse' : ''}`}></i>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
            {stealthMode ? 'STEALTH ACTIVE' : 'STEALTH'}
          </span>
        </button>

        {isSettingsOpen && (
          <div className="absolute top-20 right-4 w-72 p-5 rounded-2xl border shadow-2xl animate-in fade-in zoom-in duration-200 z-[60] bg-white border-gray-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-gray-400">Personal AI Config</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Custom Gemini API Key</label>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:border-black outline-none"
                />
                <p className="text-[8px] text-gray-400 mt-2 leading-relaxed">
                  Use this if the public key is exhausted. Get one at <a href="https://aistudio.google.com/" target="_blank" className="text-[#00CC00] underline">Google AI Studio</a>.
                </p>
              </div>
              <button 
                onClick={saveKey}
                className="w-full py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;