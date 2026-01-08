
import React, { useState, FormEvent, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
  variant?: 'large' | 'small';
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, initialValue = '', variant = 'large' }) => {
  const [query, setQuery] = useState(initialValue);
  const [isStealth, setIsStealth] = useState(false);

  useEffect(() => {
    setQuery(initialValue);
    setIsStealth(localStorage.getItem('searchda_stealth') === 'true');
  }, [initialValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsStealth(localStorage.getItem('searchda_stealth') === 'true');
    };
    const interval = setInterval(handleStorageChange, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const isLarge = variant === 'large';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto px-1">
      <div className={`relative flex items-center group transition-all duration-300 ${isLarge ? 'h-14 md:h-20' : 'h-12 md:h-14'}`}>
        <div className={`absolute left-5 md:left-7 transition-colors pointer-events-none z-10 ${
          isStealth ? 'text-[#00FF00]' : 'text-gray-400 group-focus-within:text-black'
        }`}>
          <i className={`fas ${isLoading ? 'fa-spin fa-circle-notch' : (isStealth ? 'fa-user-secret' : 'fa-search')} ${isLarge ? 'text-lg' : 'text-sm'}`}></i>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isStealth ? "ANONYMOUS REQ..." : "Search or URL..."}
          className={`w-full h-full pl-12 md:pl-16 pr-28 md:pr-36 rounded-2xl md:rounded-[2rem] border-2 transition-all font-medium text-sm md:text-lg ${
            isStealth 
              ? 'bg-black border-zinc-800 text-[#00FF00] placeholder-[#00FF00]/30 focus:border-[#00FF00]/50 shadow-[0_0_30px_rgba(0,255,0,0.05)] font-mono' 
              : 'bg-white border-gray-100 text-gray-900 focus:border-black'
          } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          disabled={isLoading}
        />
        <div className="absolute right-2 md:right-4 flex items-center space-x-1">
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`p-2 hidden md:block transition-colors ${isStealth ? 'text-zinc-700 hover:text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`flex items-center justify-center rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all ${
              isLarge ? 'px-4 h-10 md:px-8 md:h-14 text-[9px] md:text-xs' : 'px-3 h-8 md:px-5 md:h-10 text-[8px] md:text-[10px]'
            } ${
              isLoading 
                ? 'bg-gray-100 text-gray-400' 
                : isStealth 
                  ? 'bg-[#00FF00] text-black shadow-[0_0_15px_#00FF00]' 
                  : 'bg-black text-white'
            }`}
          >
            {isLoading ? 'Wait' : 'Enter'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
