'use client';

import React from 'react';

interface PostalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function PostalLogo({ size = 'md', showText = true, className = '' }: PostalLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Vector Postal Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-blue-500/20 group hover:scale-105 transition-transform duration-300`}>
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-emerald-500/10 to-amber-500/20 opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 text-white relative z-10 drop-shadow-md"
          >
            {/* Postal Envelope Base */}
            <path
              d="M6 14C6 11.7909 7.79086 10 10 10H38C40.2091 10 42 11.7909 42 14V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
            {/* Envelope Flap Lines */}
            <path
              d="M6 14L24 27L42 14"
              stroke="url(#postal-grad-1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Speed Arrow / Wings Accent */}
            <path
              d="M16 28L24 21L32 28"
              stroke="url(#postal-grad-2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="postal-grad-1" x1="6" y1="14" x2="42" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="0.5" stopColor="#818CF8" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="postal-grad-2" x1="16" y1="28" x2="32" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-white ${textSizes[size]} font-sans`}>
              POSTAL
            </span>
            <span className={`font-black tracking-wider bg-linear-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent ${textSizes[size]}`}>
              MANAGER
            </span>
          </div>
          <span className={`font-medium tracking-widest uppercase text-blue-400/90 ${subtitleSizes[size]}`}>
            Official Business Portal
          </span>
        </div>
      )}
    </div>
  );
}
