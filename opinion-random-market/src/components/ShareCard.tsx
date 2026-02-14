import { forwardRef } from 'react';
import type { OpinionEvent } from '../types';
import { OpinionLogo } from './OpinionLogo';

interface Props {
  event: OpinionEvent;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(({ event }, ref) => {
  const getProxyUrl = (url?: string) => {
    if (!url) return '';
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=800&h=800&fit=cover&a=attention`;
  };

  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1920px] bg-[#0a0a0a] relative flex flex-col items-center justify-center p-20 text-white font-['Inter'] overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #050505 0%, #1a1a1a 100%)',
      }}
    >
       {/* Background Glows */}
       <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-opinion-orange/20 blur-[300px] rounded-full" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-opinion-orange/10 blur-[300px] rounded-full" />
       
       {/* Logo Header */}
       <div className="scale-[2.5] mb-32 relative z-10">
         <OpinionLogo />
       </div>

       {/* Main Card */}
       <div className="w-[850px] bg-[#1a1a1a]/80 backdrop-blur-3xl border border-white/10 rounded-[60px] overflow-hidden shadow-[0_0_150px_rgba(255,85,0,0.15)] relative z-10">
          {/* Image */}
          <div className="h-[850px] w-full relative">
            <img 
               src={getProxyUrl(event.image || event.icon)}
               className="w-full h-full object-cover"
               alt="Event"
               crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
            
            {/* Overlay Badge */}
            <div className="absolute top-10 right-10 px-8 py-4 bg-opinion-orange/90 backdrop-blur-md rounded-full text-3xl font-bold uppercase tracking-widest shadow-lg">
                Vol: ${(Number(event.volume) || 0).toLocaleString()}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-16 relative">
            <h1 className="text-6xl font-black leading-tight mb-12 font-['Space_Grotesk'] tracking-tight text-balance">
              {event.title}
            </h1>
            
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
               <div className="flex flex-col bg-green-500/10 p-8 rounded-3xl border border-green-500/20">
                  <span className="text-3xl text-green-400 font-bold mb-2 uppercase tracking-wider">Yes</span>
                  <span className="text-8xl font-mono font-bold text-white">{(Number(event.markets[0]?.outcomePrices[0] || 0) * 100).toFixed(0)}%</span>
               </div>
               <div className="flex flex-col items-end bg-[#ef4444]/10 p-8 rounded-3xl border border-[#ef4444]/20">
                  <span className="text-3xl text-[#ef4444] font-bold mb-2 uppercase tracking-wider">No</span>
                  <span className="text-8xl font-mono font-bold text-white">{(Number(event.markets[0]?.outcomePrices[1] || 0) * 100).toFixed(0)}%</span>
               </div>
            </div>
          </div>
       </div>
       
       {/* Footer */}
       <div className="mt-24 text-center opacity-50 relative z-10">
         <p className="text-4xl font-mono uppercase tracking-[0.2em] text-white">opinion-random-market</p>
         <p className="text-2xl mt-4 text-gray-500">Reveal Your Next Move</p>
       </div>
    </div>
  );
});
