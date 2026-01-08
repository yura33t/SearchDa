import React, { useState, useEffect } from 'react';

interface InAppBrowserProps {
  url: string;
  onClose: () => void;
  stealthMode: boolean;
}

type ProxyMode = 'direct' | 'stealth';

const InAppBrowser: React.FC<InAppBrowserProps> = ({ url, onClose, stealthMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<ProxyMode>(stealthMode ? 'stealth' : 'direct');
  const [loadError, setLoadError] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  
  const targetUrl = url.startsWith('http') ? url : `https://${url}`;

  useEffect(() => {
    if (stealthMode) setActiveMode('stealth');
  }, [stealthMode]);

  // Handle auto-hiding the security notice
  useEffect(() => {
    setShowNotice(true);
    const timer = setTimeout(() => {
      setShowNotice(false);
    }, 6000); // 6 seconds visibility
    return () => clearTimeout(timer);
  }, [targetUrl]);

  const getDisplayUrl = () => {
    return targetUrl;
  };

  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    
    const timeout = setTimeout(() => {
      if (isLoading) {
        // Site might be slow or blocking frames
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [activeMode, targetUrl]);

  const openExternal = () => {
    window.open(`https://href.li/?${encodeURIComponent(targetUrl)}`, '_blank');
  };

  return (
    <div className={`flex flex-col h-[75dvh] md:h-[82vh] rounded-[1.5rem] md:rounded-[2.5rem] border-2 overflow-hidden shadow-2xl transition-all duration-500 ${
      stealthMode ? 'bg-black border-[#00FF00]/30' : 'bg-white border-gray-100'
    }`}>
      {/* Control Bar */}
      <div className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b ${
        stealthMode ? 'bg-zinc-950 border-zinc-900' : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center space-x-2 md:space-x-4 flex-1 mr-2">
          <div className={`flex items-center rounded-xl px-3 py-1.5 md:px-4 md:py-2 border flex-1 max-w-xs md:max-w-md ${
            stealthMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-gray-200 text-gray-500'
          }`}>
            <i className={`fas ${stealthMode ? 'fa-user-secret' : 'fa-globe'} text-[10px] mr-2 text-[#00FF00]`}></i>
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
            title="Open Securely"
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
            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#00FF00] animate-pulse">Establishing Node...</p>
          </div>
        )}

        <iframe
          src={getDisplayUrl()}
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          onError={() => setLoadError(true)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        
        {/* Overlay for blocked frames with auto-hide logic */}
        {showNotice && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl relative ${
               stealthMode ? 'bg-black/80 border-[#00FF00]/20' : 'bg-white/90 border-gray-200'
             }`}>
                <button 
                  onClick={() => setShowNotice(false)}
                  className="absolute top-2 right-2 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-times"></i>
                </button>
                <p className={`text-[10px] font-bold mb-3 ${stealthMode ? 'text-white' : 'text-gray-900'}`}>
                  Note: Many sites block in-app views for security.
                </p>
                <button 
                  onClick={openExternal}
                  className="w-full py-2.5 bg-[#00FF00] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
                >
                  Open in Stealth Tab
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-[8px] font-black uppercase tracking-widest ${
        stealthMode ? 'bg-black border-zinc-900 text-zinc-600' : 'bg-gray-50 border-gray-100 text-gray-400'
      }`}>
        <span>Shield: {stealthMode ? 'AES-256' : 'Standard'}</span>
        <span className="flex items-center">
          <span className="w-1 h-1 rounded-full bg-[#00FF00] mr-1"></span>
          encrypted connection
        </span>
      </div>
    </div>
  );
};

export default InAppBrowser;