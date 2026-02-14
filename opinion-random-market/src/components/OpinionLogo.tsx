import React from 'react';

export const OpinionLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity">
      {/* Brand Icon Image */}
      <img 
        src="/opinion-brand.jpg" 
        alt="Opinion Labs" 
        className="w-10 h-10 rounded-full border-2 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:border-opinion-orange/50 group-hover:shadow-[0_0_20px_rgba(255,85,0,0.4)] transition-all duration-300"
      />
      
      {/* Text Logo */}
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tight leading-none text-white font-sans">
          OPINION
        </span>
        <span className="text-[0.6rem] font-bold tracking-[0.2em] text-opinion-orange uppercase leading-none mt-0.5">
          Random Market
        </span>
      </div>
    </div>
  );
};
