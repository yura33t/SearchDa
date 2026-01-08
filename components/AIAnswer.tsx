
import React from 'react';

interface AIAnswerProps {
  answer: string;
  stealthMode?: boolean;
}

const AIAnswer: React.FC<AIAnswerProps> = ({ answer, stealthMode = false }) => {
  // Enhanced formatting logic to handle incomplete markdown during streaming
  const formattedText = answer.split('\n').map((line, i) => {
    if (!line.trim() && i > 0) return <div key={i} className="h-2"></div>;
    
    // Basic bold conversion for **text**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className={`mb-3 leading-relaxed last:mb-0 ${stealthMode ? 'text-zinc-300' : 'text-gray-700'}`}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className={`font-bold ${stealthMode ? 'text-[#00FF00]' : 'text-gray-900'}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });

  return (
    <div className={`rounded-2xl border transition-all duration-500 p-6 md:p-8 shadow-sm ${
      stealthMode 
        ? 'bg-[#0d0d0d] border-zinc-800 shadow-[0_0_40px_rgba(0,255,0,0.03)]' 
        : 'bg-white border-gray-100'
    }`}>
      <div className={`flex items-center space-x-2 mb-6 ${stealthMode ? 'text-[#00FF00]' : 'text-[#00CC00]'}`}>
        <i className={`fas fa-sparkles ${stealthMode ? 'animate-pulse' : ''}`}></i>
        <h2 className="text-lg font-black uppercase tracking-tight">SearchDa Insights</h2>
      </div>
      <div className="prose max-w-none">
        {formattedText}
        <span className={`inline-block w-2 h-4 ml-1 rounded-sm align-middle animate-pulse ${
          stealthMode ? 'bg-[#00FF00]' : 'bg-[#00CC00]/40'
        }`}></span>
      </div>
      
      {stealthMode && (
        <div className="mt-6 pt-6 border-t border-zinc-900 flex items-center justify-between">
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 h-1 bg-zinc-800 rounded-full"></div>
            ))}
          </div>
          <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">encrypted output stream</span>
        </div>
      )}
    </div>
  );
};

export default AIAnswer;
