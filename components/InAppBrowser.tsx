
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface InAppBrowserProps {
  url: string;
  onClose: () => void;
  stealthMode: boolean;
}

type ProxyMode = 'direct' | 'stealth' | 'tunnel';

const InAppBrowser: React.FC<InAppBrowserProps> = ({ url, onClose, stealthMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<ProxyMode>(stealthMode ? 'stealth' : 'direct');
  const [loadError, setLoadError] = useState(false);
  
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  useEffect(() => {
    if (stealthMode) setActiveMode('stealth');
  }, [stealthMode]);

  const getDisplayUrl = () => {
    const encoded = encodeURIComponent(targetUrl);
    if (activeMode === 'stealth') {
      // Use a more reliable proxy gateway that handles scripts better
      return `https://www.google.com/search?q=${encoded}&btnI=Im+Feeling+Lucky`; // Lightweight redirector
    }
    if (activeMode === 'tunnel') {
      // Ultimate proxy for blocked frames
      return `https://oaks.one/proxy.php?u=${encoded}`; 
    }
    return targetUrl;
  };

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    
    const timeout = setTimeout(() => {
      if (isLoading) setLoadError(true);
    }, 6000);

    return () => clearTimeout(timeout);
  }, [activeMode, targetUrl]);

  const openExternal = () => {
    window.open(`https://href.li/?${encodeURIComponent(targetUrl)}`, '_blank');
  };

  return (
    <div className={`flex flex-col h-[75dvh] md:h-[82vh] rounded-[1.5rem] md:rounded-[2.5rem] border-2 overflow-hidden shadow-2xl transition-all duration-500 ${
      stealthMode ? 'bg-black border-[#00FF00]/30' : 'bg-white border-gray-100'
    }`}>
      {/* Mobile-Friendly Control Bar */}
      <div className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b ${
        stealthMode ? 'bg-zinc-950 border-zinc-900' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 mr-2">
          <div className={`flex items-center rounded-xl px-3 py-1.5 md:px-4 md:py-2 border flex-1 max-w-xs md:max-w-md ${
            stealthMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
          }`}>
            <i className="fas fa-shield-alt text-[10px] mr-2 text-[#00FF00]"></i>
            <span className="text-[10px] md:text-[11px] font-mono truncate lowercase">
              {new URL(targetUrl).hostname}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={openExternal}
            className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all ${
              stealthMode ? 'bg-zinc-900 text-[#00FF00] hover:bg-[#00FF00] hover:text-black' : 'bg-gray-100 text-gray-500 hover:bg-black hover:text-white'
            }`}
            title="Open Anonymously"
          >
            <i className="fas fa-external-link-alt text-xs"></i>
          </button>
          <button 
            onClick={onClose}
            className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Browser Viewport */}
      <div className="relative flex-grow bg-zinc-900 overflow-hidden">
        {isLoading && (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center ${stealthMode ? 'bg-black' : 'bg-white'}`}>
            <div className={`w-10 h-10 border-2 rounded-full animate-spin border-t-[#00FF00] ${stealthMode ? 'border-zinc-800' : 'border-gray-100'}`}></div>
            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#00FF00] animate-pulse">Syncing Node...</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
            <div className={`w-full max-w-xs p-6 rounded-3xl text-center border ${stealthMode ? 'bg-zinc-950 border-[#00FF00]/20' : 'bg-white border-gray-200'}`}>
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-ghost text-xl"></i>
              </div>
              <h4 className={`text-sm font-black mb-2 ${stealthMode ? 'text-white' : 'text-gray-900'}`}>Frame Blocked</h4>
              <p className="text-[10px] text-gray-500 mb-6">This site refuses to be displayed in-app for security. Use the Ghost Bridge.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveMode('tunnel')}
                  className="w-full py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700"
                >
                  Try Deep Tunnel
                </button>
                <button 
                  onClick={openExternal}
                  className="w-full py-3 bg-[#00FF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00FF00]/20"
                >
                  Go Ghost Mode
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={getDisplayUrl()}
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>

      {/* Mobile Footer Status */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-[8px] font-black uppercase tracking-widest ${
        stealthMode ? 'bg-black border-zinc-900 text-zinc-600' : 'bg-gray-50 border-gray-100 text-gray-400'
      }`}>
        <span>Protocol: {activeMode}</span>
        <span className="flex items-center">
          <span className="w-1 h-1 rounded-full bg-[#00FF00] mr-1 animate-ping"></span>
          v1.0 beta secure
        </span>
      </div>
    </div>
  );
};

export default InAppBrowser;
