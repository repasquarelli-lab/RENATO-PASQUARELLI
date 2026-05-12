import React from 'react';

export function Logo({ className = "w-auto h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 160 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DY Logo"
    >
      <defs>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="darkBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      
      {/* Letter D */}
      <path 
        d="M 20,20 L 60,20 C 85,20 100,35 100,55 C 100,70 90,85 70,90 L 20,90 Z M 45,40 L 45,70 L 60,70 C 70,70 75,65 75,55 C 75,45 70,40 60,40 Z" 
        fill="url(#blueGrad)" 
      />
      
      {/* Letter Y */}
      <path 
        d="M 85,20 L 115,20 L 125,45 L 145,20 L 175,20 L 140,65 L 140,100 L 115,100 L 115,65 Z" 
        fill="url(#orangeGrad)" 
      />
      
      {/* Swoosh */}
      <path 
        d="M 10,80 C 40,110 80,110 120,70 C 90,100 50,100 10,80 Z" 
        fill="url(#darkBlueGrad)" 
      />
    </svg>
  );
}


