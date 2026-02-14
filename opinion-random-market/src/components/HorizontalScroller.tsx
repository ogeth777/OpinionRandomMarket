import React, { useEffect, useState, useRef } from 'react';
import type { OpinionEvent } from '../types';
import { motion, useAnimation } from 'framer-motion';
import { formatPercentage } from '../utils/format';
import { playTick } from '../utils/sound';
import Tilt from 'react-parallax-tilt';
import clsx from 'clsx';

interface Props {
  events: OpinionEvent[];
  isSpinning: boolean;
  onSpinEnd: (winner: OpinionEvent) => void;
  winner: OpinionEvent | null;
}

const CARD_WIDTH = 220; // Width of each card
const CARD_GAP = 16;    // Gap between cards
const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_GAP;

export const HorizontalScroller: React.FC<Props> = ({ events, isSpinning, onSpinEnd, winner }) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a long list by duplicating events to simulate infinite scroll
  // We need enough duplicates to ensure we can scroll for a while
  // If we have 100 events, 3 duplicates = 300 items. 
  // 300 * 236px ~ 70,000px wide. Enough for a long spin.
  const [displayList, setDisplayList] = useState<OpinionEvent[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const initialized = useRef(false);
  const lastTickX = useRef(0);

  useEffect(() => {
    if (events.length > 0) {
      // Ensure we have enough items. If events are few, duplicate more.
      const multiplier = events.length < 100 ? 50 : 20; // Increased multiplier for epic length
      const list = Array(multiplier).fill(events).flat();
      setDisplayList(list);
    }
  }, [events]);

  useEffect(() => {
    // Set initial position to the middle of the list so it looks "infinite" immediately
    if (displayList.length > 0 && !isSpinning && !initialized.current) {
        const midIndex = Math.floor(displayList.length / 2);
        // Calculate offset to center the mid card
        const initialX = -(midIndex * TOTAL_CARD_WIDTH) - (CARD_WIDTH / 2);
        
        controls.set({ x: initialX });
        initialized.current = true;
        // Small timeout to ensure the set operation has taken effect visually before showing
        requestAnimationFrame(() => setIsReady(true));
    }
  }, [displayList, controls, isSpinning]);

  useEffect(() => {
    if (isSpinning) {
      startSpin();
    } else {
       // Reset if needed, but we want to keep the winner highlighted
    }
  }, [isSpinning]);

  const startSpin = async () => {
    if (displayList.length === 0) return;
    setWinningIndex(null);

    // Start from current position (should be middleish)
    // We want to scroll further to the right (negative X)
    
    // 1. Determine a random winner index significantly further down the list
    // Let's pick a winner in the last 25% of the list to ensure long scroll
    const minIndex = Math.floor(displayList.length * 0.6); 
    const maxIndex = Math.floor(displayList.length * 0.9);
    const winnerIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    
    setWinningIndex(winnerIndex);
    const targetEvent = displayList[winnerIndex];

    // 2. Calculate offset
    // Target X should center the winner card
    const targetX = -(winnerIndex * TOTAL_CARD_WIDTH) - (CARD_WIDTH / 2);

    // 3. Animate
    await controls.start({
      x: targetX,
      transition: {
        duration: 8, // seconds
        ease: [0.15, 0.85, 0.35, 1], // Modified bezier for smoother landing
      }
    });

    // 4. Notify end
    onSpinEnd(targetEvent);
  };

  // Image Proxy Helper - simplified to avoid ORB issues
  const getProxyUrl = (url?: string) => {
    if (!url) return '';
    // Use direct URL instead of wsrv.nl to avoid ORB blocking
    return url;
  };

  return (
    <div className="w-full overflow-hidden py-10 relative" ref={containerRef}>
      {/* Center Marker / Pointer */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-opinion-orange to-transparent z-20 -translate-x-1/2 hidden md:block pointer-events-none opacity-50"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-30 text-opinion-orange text-3xl animate-bounce filter drop-shadow-[0_0_10px_rgba(255,85,0,0.8)] pointer-events-none">
        ▼
      </div>

      <motion.div
        className={clsx(
          "flex gap-4 pl-[50vw] pr-[50vw] transition-opacity duration-500",
          isReady ? "opacity-100" : "opacity-0"
        )}
        animate={controls}
        onUpdate={(latest) => {
          const x = typeof latest.x === 'number' ? latest.x : 0;
          if (Math.abs(x - lastTickX.current) > CARD_WIDTH) {
             playTick();
             if (typeof navigator !== 'undefined' && navigator.vibrate) {
                 navigator.vibrate(5);
             }
             lastTickX.current = x;
          }
        }}
        // Removed initial={{ x: 0 }} to prevent overriding our manual set
        style={{ width: 'fit-content' }} // Important for flex container width
      >
        {displayList.map((event, idx) => {
          const isWinner = winningIndex === idx;
          const isWinnerAndStopped = isWinner && !isSpinning && winner?.id === event.id;

          // Determine component and props based on winner status
          const CardComponent = isWinnerAndStopped ? Tilt : 'div';
          const tiltProps = isWinnerAndStopped ? {
            glareEnable: true,
            glareMaxOpacity: 0.45,
            scale: 1.1,
            perspective: 1000,
            tiltMaxAngleX: 10,
            tiltMaxAngleY: 10,
            transitionSpeed: 1500,
          } : {};

          return (
             <CardComponent 
               key={`${event.id}-${idx}`}
               {...tiltProps}
               className={clsx(
                 "relative shrink-0 rounded-xl overflow-hidden border transition-all duration-300 select-none",
                 // Glassmorphism style
                 "bg-white/5 border-white/10 backdrop-blur-md shadow-lg",
                 // Motion Blur effect during spin
                 isSpinning && "blur-[1px]",
                 // Winner highlight
                 isWinnerAndStopped 
                    ? "border-opinion-orange shadow-[0_0_50px_rgba(255,85,0,0.6)] z-20 ring-2 ring-opinion-orange/50" 
                    : isSpinning 
                        ? "opacity-80" 
                        : "opacity-100 hover:border-opinion-orange/50 hover:shadow-[0_0_20px_rgba(255,85,0,0.2)] hover:scale-105 z-10",
                 // Shake effect
                 isWinnerAndStopped && "animate-shake"
               )}
               style={{ 
                 width: CARD_WIDTH, 
                 height: 340,
               }}
             >
               {/* Image */}
               <div className="h-40 w-full relative overflow-hidden bg-white/5 flex items-center justify-center">
                 <img 
                   src={getProxyUrl(event.image || event.icon)} 
                   alt={event.title}
                   className="w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-110"
                   draggable={false}
                   onError={(e) => {
                       // Fallback to logo if image fails
                       const img = e.target as HTMLImageElement;
                       if (img.src.includes('opinion-logo.png')) {
                           // If fallback also fails, hide it
                           img.style.display = 'none';
                           img.parentElement!.style.background = 'linear-gradient(45deg, #1a1a1a, #2a2a2a)';
                       } else {
                           img.src = '/opinion-logo.png';
                           img.className = "w-full h-full object-contain p-8 opacity-50"; // Adjust style for fallback
                       }
                   }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
               </div>

               {/* Content */}
               <div className="p-4 flex flex-col h-[calc(100%-160px)] justify-between relative">
                 <h3 className="text-white font-['Inter'] font-semibold text-sm leading-snug line-clamp-3 tracking-tight">
                   {event.title}
                 </h3>
                 
                 <div className="flex justify-between items-end mt-3 pt-3 border-t border-white/5">
                   <div className="flex flex-col">
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Yes</span>
                     <span className="text-[#22c55e] font-mono font-bold text-lg leading-none">{formatPercentage(event.markets[0]?.outcomePrices[0] || 0)}</span>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">No</span>
                     <span className="text-[#ef4444] font-mono font-bold text-lg leading-none">{formatPercentage(event.markets[0]?.outcomePrices[1] || 0)}</span>
                   </div>
                 </div>
               </div>
             </CardComponent>
          );
        })}
      </motion.div>
    </div>
  );
};
