import React from 'react';
import type { OpinionEvent } from '../types';
import { formatCurrency, formatPercentage } from '../utils/format';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  event: OpinionEvent;
  isHighlighted?: boolean;
  isWinner?: boolean;
}

export const MarketGridCard: React.FC<Props> = ({ event, isHighlighted, isWinner }) => {
  const mainMarket = event.markets[0];
  const yesPrice = mainMarket?.outcomePrices?.[0] || '0';
  const noPrice = mainMarket?.outcomePrices?.[1] || '0';
  
  const imageUrl = event.image || event.icon || '/opinion-logo.png';

  return (
    <motion.div 
      className={clsx(
        "relative rounded-xl overflow-hidden aspect-square bg-opinion-card border-2 transition-all duration-300",
        isHighlighted ? "border-opinion-orange shadow-[0_0_20px_rgba(255,85,0,0.6)] scale-105 z-10" : "border-white/10 opacity-60 scale-100 hover:border-opinion-orange/50 hover:opacity-100",
        isWinner ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.8)] scale-110 z-20 ring-4 ring-green-500/30" : ""
      )}
      layout
      id={`card-${event.id}`}
    >
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.src.includes('opinion-logo.png')) {
             img.style.display = 'none'; 
             if (img.parentElement) img.parentElement.style.background = 'linear-gradient(45deg, #1a1a1a, #2a2a2a)';
          } else {
             img.src = '/opinion-logo.png';
             img.className = "absolute inset-0 w-full h-full object-contain p-4 opacity-50"; 
          }
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col gap-1">
        <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-3 mb-1 drop-shadow-md">
          {event.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs md:text-sm font-mono">
          <div className="flex gap-2">
            <span className="text-green-400 font-bold">{formatPercentage(yesPrice)}</span>
            <span className="text-red-400 font-bold">{formatPercentage(noPrice)}</span>
          </div>
          <div className="text-gray-400">
             {formatCurrency(event.volume)}
          </div>
        </div>
      </div>
      
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute top-2 right-2 bg-green-500 text-black font-bold px-2 py-1 rounded text-xs animate-bounce">
          WINNER!
        </div>
      )}
    </motion.div>
  );
};
