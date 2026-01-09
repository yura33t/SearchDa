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
    
    // Warn developers if they haven't set up the API key correctly
    const hasKey = localStorage.getItem('searchda_custom_key') || process.env.API_KEY;
    if (!hasKey || hasKey === "undefined") {
      console.warn("No API key detected. Application will rely on user-provided keys in settings.");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchda_stealth', stealthMode.toString());
    document.body.style.backgroundColor = stealthMode ? '#000000' : '#f8fafc';
  }, [stealthMode]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setCurrentQuery(trimmedQuery);
    setIsLanding(false);
    setIsLoading(true);
    setError(null);
    setStreamingText("");
    setStreamingSources([]);
    setBrowsingUrl(null);

    // URL detection
    if (/^(https?:\/\/|www\.)[^\s]+/.test(trimmedQuery)) {
      setBrowsingUrl(trimmedQuery.startsWith('http') ? trimmedQuery : `https://${trimmedQuery}`);
      setIsLoading(false);
      return;
    }

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
      
      setHistory(prev => {
        const next = [newItem, ...prev.filter(i => i.query !== trimmedQuery)].slice(0, 6);
        localStorage.setItem('searchda_history', JSON.stringify(next));
        return next;
      });
      
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения к ИИ');
      setIsLoading(false);
    }
  }, []);

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
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${stealthMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header 
        onHome={resetToHome} 
        compact={!isLanding} 
        stealthMode={stealthMode}
        onToggleStealth={() => setStealthMode(!stealthMode)}
      />

      <main className={`flex-grow flex flex-col ${isLanding ? 'justify-center py-10' : 'pt-6'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          {isLanding ? (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <div className="flex justify-center mb-10">
                <Logo size="lg" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                Search<span className={stealthMode ? 'text-[#00FF00]' : 'text-[#00CC00]'}>Da</span>
              </h1>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {history.length > 0 && (
                <div className="mt-16 text-left max-w-xl mx-auto">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 opacity-50`}>Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearch(item.query)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                          stealthMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-black'
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
            <div className="space-y-6 pb-20">
              {browsingUrl ? (
                <InAppBrowser url={browsingUrl} onClose={() => setBrowsingUrl(null)} stealthMode={stealthMode} />
              ) : (
                <>
                  <SearchBar onSearch={handleSearch} isLoading={isLoading} initialValue={currentQuery} variant="small" />
                  
                  {isLoading && !streamingText && (
                    <div className="space-y-4 pt-10">
                      <div className={`h-64 rounded-3xl animate-pulse ${stealthMode ? 'bg-zinc-900' : 'bg-white'}`}></div>
                    </div>
                  )}

                  {streamingText && <AIAnswer answer={streamingText} stealthMode={stealthMode} />}
                  
                  {error && (
                    <div className={`p-8 border-2 rounded-3xl text-center ${
                      stealthMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'
                    }`}>
                      <p className="text-red-500 font-bold mb-4">{error}</p>
                      {error.includes("ключ") && (
                        <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest leading-relaxed">
                          Нажмите на иконку шестеренки в правом верхнем углу,<br/>чтобы добавить свой персональный Gemini API ключ.
                        </p>
                      )}
                      <button onClick={() => handleSearch(currentQuery)} className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase transition-transform active:scale-95 hover:bg-red-600">Retry</button>
                    </div>
                  )}

                  <ResultList sources={streamingSources} stealthMode={stealthMode} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;