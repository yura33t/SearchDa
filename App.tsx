
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultList from './components/ResultList';
import AIAnswer from './components/AIAnswer';
import Logo from './components/Logo';
import InAppBrowser from './components/InAppBrowser';
import { SearchSource, HistoryItem } from './types';
import { performSearchStreaming } from './services/gemini';

const App: React.FC = () => {
  const [isLanding, setIsLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [streamingSources, setStreamingSources] = useState<SearchSource[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [browsingUrl, setBrowsingUrl] = useState<string | null>(null);
  const [stealthMode, setStealthMode] = useState(() => {
    return localStorage.getItem('searchda_stealth') === 'true';
  });

  useEffect(() => {
    const saved = localStorage.getItem('searchda_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('searchda_stealth', stealthMode.toString());
    document.body.style.backgroundColor = stealthMode ? '#000000' : '#f8fafc';
    
    // Fix mobile viewport height issues
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    window.addEventListener('resize', setVh);
    setVh();
    return () => window.removeEventListener('resize', setVh);
  }, [stealthMode]);

  const isUrl = (text: string) => {
    const trimmed = text.trim();
    const hasProtocol = /^(https?:\/\/)/i.test(trimmed);
    const hasWww = /^www\./i.test(trimmed);
    const hasTld = /\.(com|net|org|ru|io|me|info|biz|ua|kz|by|gov|us|uk|tv|xyz)$/i.test(trimmed);
    return (hasProtocol || hasWww || (trimmed.includes('.') && hasTld)) && !trimmed.includes(' ');
  };

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setCurrentQuery(trimmedQuery);

    if (isUrl(trimmedQuery)) {
      setBrowsingUrl(trimmedQuery);
      setIsLanding(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsLanding(false);
    setBrowsingUrl(null);
    setStreamingText("");
    setStreamingSources([]);

    try {
      await performSearchStreaming(trimmedQuery, {
        onText: (text) => {
          setStreamingText(text);
          setIsLoading(false);
        },
        onSources: (sources) => {
          setStreamingSources(sources);
        }
      });

      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        query: trimmedQuery,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history.slice(0, 5)].filter(
        (item, index, self) => index === self.findIndex((t) => t.query === item.query)
      );
      setHistory(updatedHistory);
      localStorage.setItem('searchda_history', JSON.stringify(updatedHistory));
      
    } catch (err: any) {
      setError(err.message || 'Connection lost');
      setIsLoading(false);
    }
  }, [history]);

  const resetToHome = () => {
    setIsLanding(true);
    setStreamingText("");
    setStreamingSources([]);
    setBrowsingUrl(null);
    setCurrentQuery("");
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${stealthMode ? 'bg-[#000000] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header 
        onHome={resetToHome} 
        compact={!isLanding} 
        stealthMode={stealthMode}
        onToggleStealth={() => setStealthMode(!stealthMode)}
      />

      <main className={`flex-grow flex flex-col ${isLanding ? 'justify-center py-6 md:py-10' : 'pt-4 md:pt-10'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          {isLanding ? (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <div className="flex justify-center mb-6 md:mb-10" onClick={resetToHome}>
                <div className={`transition-all duration-700 ${stealthMode ? 'scale-90 md:scale-110 drop-shadow-[0_0_30px_rgba(0,255,0,0.4)]' : 'hover:scale-105'}`}>
                  <Logo size={window.innerWidth < 768 ? 'sm' : 'lg'} />
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6">
                Search<span className={`${stealthMode ? 'text-[#00FF00] drop-shadow-[0_0_10px_#00FF00]' : 'text-[#00CC00]'}`}>Da</span>
              </h1>
              <p className={`text-xs md:text-xl mb-8 md:mb-12 max-w-sm md:max-w-md mx-auto leading-relaxed transition-colors duration-500 ${stealthMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                {stealthMode ? 'Secure Dark Node Active. V1.0 Beta.' : 'The next generation of intelligent discovery.'}
              </p>
              
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />

              {history.length > 0 && (
                <div className="mt-12 md:mt-20 text-left max-w-xl mx-auto px-2">
                  <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-5 flex items-center ${stealthMode ? 'text-zinc-800' : 'text-gray-300'}`}>
                    <i className="fas fa-history mr-2"></i> Last Sessions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearch(item.query)}
                        className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all duration-300 ${
                          stealthMode 
                            ? 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-[#00FF00] hover:border-[#00FF00]/30 hover:bg-zinc-900' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-black hover:bg-gray-50'
                        }`}
                      >
                        {item.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 md:space-y-8 pb-20">
              {browsingUrl ? (
                <div className="flex flex-col space-y-4 animate-in slide-in-from-bottom-8 duration-500">
                  <InAppBrowser 
                    url={browsingUrl} 
                    onClose={() => setBrowsingUrl(null)} 
                    stealthMode={stealthMode}
                  />
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-8 duration-500">
                  <div className="mb-8">
                    <SearchBar 
                      onSearch={handleSearch} 
                      isLoading={isLoading} 
                      initialValue={currentQuery} 
                      variant="small" 
                    />
                  </div>

                  {isLoading && streamingText === "" ? (
                    <div className="space-y-4">
                      <div className={`h-48 md:h-80 rounded-[2rem] animate-pulse ${stealthMode ? 'bg-zinc-900/50' : 'bg-white border border-gray-100'}`}></div>
                    </div>
                  ) : error ? (
                    <div className={`p-10 border-2 rounded-[2rem] text-center ${
                      stealthMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'
                    }`}>
                      <i className="fas fa-exclamation-triangle text-red-500 mb-4 text-2xl"></i>
                      <p className="text-red-500 text-sm font-black uppercase tracking-widest mb-6">{error}</p>
                      <button 
                        onClick={() => handleSearch(currentQuery)} 
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          stealthMode ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-black text-white hover:scale-105'
                        }`}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 md:space-y-10">
                      {streamingText && <AIAnswer answer={streamingText} stealthMode={stealthMode} />}
                      {streamingSources.length > 0 && <ResultList sources={streamingSources} stealthMode={stealthMode} />}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={`py-10 md:py-16 border-t text-center transition-colors duration-500 ${
        stealthMode ? 'bg-black border-zinc-900 text-zinc-800' : 'bg-white border-gray-100 text-gray-300'
      }`}>
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">SearchDa Engine © 2025</p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <span className="text-[8px] font-mono opacity-50">VER: 1.0.0-BETA</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
          <span className="text-[8px] font-mono opacity-50">NODE: CLOUD_SECURE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
