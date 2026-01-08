
import React from 'react';
import { SearchSource } from '../types';

interface ResultListProps {
  sources: SearchSource[];
  stealthMode?: boolean;
}

const ResultList: React.FC<ResultListProps> = ({ sources, stealthMode = false }) => {
  if (sources.length === 0) return null;

  const getTransitionUrl = (url: string) => {
    if (stealthMode) {
      // Using href.li which is a faster and more reliable referrer stripper
      return `https://href.li/?${encodeURIComponent(url)}`;
    }
    return url;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center space-x-2 text-gray-400">
          <i className="fas fa-stream text-xs"></i>
          <h3 className="text-[10px] font-black uppercase tracking-widest">Verified Sources</h3>
        </div>
        {stealthMode && (
          <div className="flex items-center space-x-1 text-[10px] font-bold text-[#00CC00] uppercase tracking-tighter">
            <i className="fas fa-mask"></i>
            <span>No-Referrer Routing</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={getTransitionUrl(source.uri)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 group ${
              stealthMode 
                ? 'bg-zinc-900 border-zinc-800 hover:border-[#00FF00]/50' 
                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}
          >
            <span className={`text-sm font-bold line-clamp-1 transition-colors ${
              stealthMode ? 'text-white group-hover:text-[#00FF00]' : 'text-gray-900 group-hover:text-[#00CC00]'
            }`}>
              {source.title}
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">
                {new URL(source.uri).hostname}
              </span>
              <i className={`fas fa-arrow-right text-[10px] transform group-hover:translate-x-1 transition-transform ${
                stealthMode ? 'text-[#00CC00]' : 'text-gray-300'
              }`}></i>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Add missing default export
export default ResultList;
