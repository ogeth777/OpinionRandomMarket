import React from 'react';
import type { OpinionEvent } from '../types';
import { formatCurrency, formatPercentage } from '../utils/format';
import { getOpinionMarketUrl } from '../utils/api';
import { ExternalLink, X, Share2, BarChart3, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  event: OpinionEvent | null;
  onClose: () => void;
}

export const WinnerModal: React.FC<Props> = ({ event, onClose }) => {
  if (!event) return null;

  const mainMarket = event.markets[0];
  const yesPrice = mainMarket?.outcomePrices?.[0] || 0;
  const noPrice = mainMarket?.outcomePrices?.[1] || 0;
  const marketUrl = getOpinionMarketUrl(event);

  const handleShare = () => {
    const text = `I got this market on Opinion Random Market: "${event.title}" 🎲\nSpin here: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Opinion Random Market', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header Image */}
          <div className="relative h-48 md:h-64 shrink-0">
             <img 
               src={event.image || event.icon} 
               alt={event.title}
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
             <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors"
             >
               <X size={24} />
             </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 font-['Space_Grotesk']">
              {event.title}
            </h2>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex flex-col items-center">
                <span className="text-green-400 font-bold mb-1 uppercase tracking-wider text-xs">YES</span>
                <span className="text-3xl font-black text-white">{formatPercentage(yesPrice)}</span>
              </div>
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-4 rounded-xl flex flex-col items-center">
                <span className="text-[#ef4444] font-bold mb-1 uppercase tracking-wider text-xs">NO</span>
                <span className="text-3xl font-black text-white">{formatPercentage(noPrice)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-gray-400 text-sm mb-8">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-opinion-orange" />
                <span>Vol: <span className="text-white font-mono">{formatCurrency(event.volume)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-opinion-orange" />
                <span>Liq: <span className="text-white font-mono">{formatCurrency(event.liquidity)}</span></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <a 
                href={marketUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-opinion-orange hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Trade on Opinion</span>
                <ExternalLink size={20} />
              </a>
              <button 
                onClick={handleShare}
                className="md:w-auto w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-colors"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
