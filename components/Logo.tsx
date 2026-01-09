import React from 'react';

interface LogoProps {
  size?: 'sm' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'sm' }) => {
  const containerSize = size === 'lg' ? 'w-24 h-24' : 'w-10 h-10';
  const svgPadding = size === 'lg' ? 'p-4' : 'p-2';

  return (
    <div className={`${containerSize} bg-[#00FF00] rounded-full flex items-center justify-center shadow-lg overflow-hidden`}>
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full ${svgPadding}`}
        fill="none" 
        stroke="black" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M70 25 C 40 10, 20 40, 50 50 C 80 60, 60 90, 30 75" />
      </svg>
    </div>
  );
};

export default Logo;