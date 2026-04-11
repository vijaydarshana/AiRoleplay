import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function AppLogo({ size = 64, className = '', onClick }: AppLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-indigo-600 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Microphone body */}
        <rect x="9" y="2" width="6" height="11" rx="3" fill="white" fillOpacity="0.95" />
        {/* Mic stand arc */}
        <path
          d="M5 10a7 7 0 0 0 14 0"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          fillOpacity="0.7"
        />
        {/* Mic stand line */}
        <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Base */}
        <line x1="9" y1="21" x2="15" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Chat bubble dot accent */}
        <circle cx="19" cy="5" r="3" fill="#f59e0b" />
        <circle cx="19" cy="5" r="1.5" fill="white" fillOpacity="0.8" />
      </svg>
    </div>
  );
}