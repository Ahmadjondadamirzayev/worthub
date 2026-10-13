import React from 'react';

interface GermanFlagBackdropProps {
  theme?: 'dark' | 'light';
}

export const GermanFlagBackdrop: React.FC<GermanFlagBackdropProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Top 3-stripe German flag ribbon */}
      <div className="w-full flex h-1.5 fixed top-0 left-0 right-0 z-50 shadow-xs">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-[#de0000]" />
        <div className="flex-1 bg-[#ffce00]" />
      </div>

      {/* Canvas base */}
      <div className={`absolute inset-0 transition-colors duration-300 ${isDark ? 'bg-[#080b12]' : 'bg-[#f8fafc]'}`} />

      {/* Atmospheric German Flag Ambient Lights */}
      {/* Red ambient glow in the mid-upper section */}
      <div
        className={`absolute top-[12%] left-1/2 -translate-x-1/2 w-[850px] h-[350px] rounded-full blur-[140px] ${
          isDark ? 'bg-red-600/12 mix-blend-screen' : 'bg-red-500/8'
        }`}
      />

      {/* Gold ambient glow in the lower section */}
      <div
        className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[320px] rounded-full blur-[150px] ${
          isDark ? 'bg-amber-500/12 mix-blend-screen' : 'bg-amber-400/12'
        }`}
      />

      {/* Subtle diagonal flag striping watermark in corner */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 blur-2xl flex transform -rotate-45 ${
          isDark ? 'opacity-10' : 'opacity-8'
        }`}
      >
        <div className="w-1/3 h-full bg-black" />
        <div className="w-1/3 h-full bg-[#de0000]" />
        <div className="w-1/3 h-full bg-[#ffce00]" />
      </div>
    </div>
  );
};

export const GermanFlagBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const height = size === 'sm' ? 'h-3.5 w-5' : 'h-4 w-6';
  return (
    <div className={`inline-flex flex-col ${height} rounded overflow-hidden shadow-xs border border-black/20 shrink-0`}>
      <div className="h-1/3 w-full bg-black" />
      <div className="h-1/3 w-full bg-[#de0000]" />
      <div className="h-1/3 w-full bg-[#ffce00]" />
    </div>
  );
};
