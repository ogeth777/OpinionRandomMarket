import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { toPng } from 'html-to-image';
import { ShareCard } from './ShareCard';
import { Loader2 } from 'lucide-react';
import type { OpinionEvent } from '../types';

interface Props {
  winner: OpinionEvent;
  onShare: () => void;
}

export const DetailView: React.FC<Props> = ({ winner, onShare }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!shareCardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
        const dataUrl = await toPng(shareCardRef.current, { 
            cacheBust: true, 
            pixelRatio: 1,
            backgroundColor: '#0a0a0a'
        });
        const link = document.createElement('a');
        link.download = `opinion-random-${winner.slug}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to generate image', err);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <>
    <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <ShareCard ref={shareCardRef} event={winner} />
    </div>
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-4xl px-4 mt-8 relative z-10"
    >
      <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_100px_rgba(255,85,0,0.15)] ring-1 ring-white/5 relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-opinion-orange/10 via-transparent to-orange-500/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-opinion-orange/20 blur-[100px] rounded-full" />
        
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          {/* Image */}
          <div className="w-full md:w-1/3 shrink-0">
            <Tilt 
              className="aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-20"
              glareEnable={true}
              glareMaxOpacity={0.45}
              scale={1.05}
              perspective={1000}
              transitionSpeed={1500}
              tiltMaxAngleX={15}
              tiltMaxAngleY={15}
            >
              <img 
                src={`https://wsrv.nl/?url=${encodeURIComponent(winner.image || winner.icon || '')}&w=800&h=800&fit=cover&a=attention`}
                alt={winner.title}
                className="w-full h-full object-cover" 
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes('opinion-logo.png')) {
                      img.style.display = 'none';
                  } else {
                      img.src = '/opinion-logo.png';
                      img.className = "w-full h-full object-contain p-12 opacity-50";
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </Tilt>
          </div>
          
          {/* Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-4">
              {winner.active && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 uppercase tracking-widest border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  Active
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-opinion-orange/20 text-opinion-orange uppercase tracking-widest border border-opinion-orange/20 shadow-[0_0_10px_rgba(255,85,0,0.2)]">
                Vol: ${(Number(winner.volume) || 0).toLocaleString()}
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6 text-white font-['Space_Grotesk'] tracking-tight">
              {winner.title}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-4 border border-green-500/20 relative overflow-hidden group/yes">
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover/yes:opacity-100 transition-opacity" />
                <div className="text-xs text-green-400 uppercase font-bold mb-1 tracking-wider relative z-10">Yes</div>
                <div className="text-4xl font-mono font-bold text-white relative z-10">
                  {(Number(winner.markets[0]?.outcomePrices[0] || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#ef4444]/10 to-[#ef4444]/5 rounded-2xl p-4 border border-[#ef4444]/20 relative overflow-hidden group/no">
                <div className="absolute inset-0 bg-[#ef4444]/10 opacity-0 group-hover/no:opacity-100 transition-opacity" />
                <div className="text-xs text-[#ef4444] uppercase font-bold mb-1 tracking-wider relative z-10">No</div>
                <div className="text-4xl font-mono font-bold text-white relative z-10">
                  {(Number(winner.markets[0]?.outcomePrices[1] || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a 
                href={`https://opinion.trade/?ref=RandomMarket&market=${encodeURIComponent(winner.slug || winner.markets[0]?.slug || winner.title)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-opinion-orange hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:shadow-[0_0_30px_rgba(255,85,0,0.6)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
              >
                <span>Trade on Opinion</span>
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <button 
                onClick={onShare}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center gap-2 font-bold text-gray-300"
                title="Share"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center gap-2 font-bold text-gray-300 disabled:opacity-50 disabled:cursor-wait"
                title="Download Story Image"
              >
                {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                <span>Save Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
