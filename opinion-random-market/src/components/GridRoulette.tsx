import React, { useState, useEffect } from 'react';
import type { OpinionEvent } from '../types';
import { MarketGridCard } from './MarketGridCard';
import { getRandomItem } from '../utils/random';

interface Props {
  allEvents: OpinionEvent[];
  onSpinStart?: () => void;
  onSpinEnd?: (winner: OpinionEvent) => void;
}

const GRID_SIZE = 24; // Number of cards to show in the grid

export const GridRoulette: React.FC<Props> = ({ allEvents, onSpinStart, onSpinEnd }) => {
  const [displayEvents, setDisplayEvents] = useState<OpinionEvent[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<OpinionEvent | null>(null);
  
  // Audio refs could be added here for sound effects

  // Initialize grid with random events on mount or when allEvents changes
  useEffect(() => {
    if (allEvents.length > 0 && displayEvents.length === 0) {
      resetGrid();
    }
  }, [allEvents]);

  const resetGrid = () => {
    if (allEvents.length === 0) return;
    const shuffled = [...allEvents].sort(() => 0.5 - Math.random());
    setDisplayEvents(shuffled.slice(0, GRID_SIZE));
    setHighlightIndex(-1);
    setWinner(null);
  };

  const handleSpin = () => {
    if (isSpinning || allEvents.length === 0) return;
    
    onSpinStart?.();
    setIsSpinning(true);
    setWinner(null);
    setHighlightIndex(-1);

    // 1. Pick a winner from ALL events
    const pickedWinner = getRandomItem(allEvents);
    if (!pickedWinner) return;

    // 2. Prepare the grid
    // Ensure winner is in the grid.
    let newGrid = [...displayEvents];
    
    // If we want a fresh grid every time:
    const randomSubset = [...allEvents].sort(() => 0.5 - Math.random()).slice(0, GRID_SIZE - 1);
    newGrid = randomSubset;
    
    // Insert winner at random position
    const winnerPos = Math.floor(Math.random() * GRID_SIZE);
    newGrid.splice(winnerPos, 0, pickedWinner);
    
    setDisplayEvents(newGrid);

    // 3. Animation Logic
    let speed = 50; // Initial speed (ms)
    
    // Actually, let's just cycle sequentially for visual clarity
    // We will use a recursive timeout to simulate deceleration
    
    let step = 0;
    
    const tick = () => {
      // Calculate current highlight index
      const idx = step % GRID_SIZE;
      setHighlightIndex(idx);
      
      // Scroll to it
      const el = document.getElementById(`card-${newGrid[idx].id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }

      // Check if finished
      // Logic: we want to stop exactly at winnerPos after some rounds
      // Let's say we want to run at least 'minSteps'
      const minSteps = GRID_SIZE * 2;
      
      if (step >= minSteps && idx === winnerPos) {
        // STOP
        setWinner(pickedWinner);
        setIsSpinning(false);
        onSpinEnd?.(pickedWinner);
        return;
      }

      // Deceleration logic
      step++;
      
      // Increase delay as we progress
      if (step > minSteps - 10) {
        speed += 30; // Slow down significantly at the end
      } else if (step > GRID_SIZE) {
        speed += 5; // Slow down a bit
      }

      setTimeout(tick, speed);
    };

    tick();
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8">
      {/* Controls */}
      {!isSpinning && !winner && (
         <button 
           onClick={handleSpin}
           className="bg-gradient-to-r from-opinion-orange to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-2xl md:text-4xl font-black py-6 px-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all animate-pulse"
         >
           REVEAL RANDOM MARKET
         </button>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full px-4 perspective-1000">
        {displayEvents.map((event, idx) => (
          <MarketGridCard 
            key={`${event.id}-${idx}`} 
            event={event} 
            isHighlighted={isSpinning && idx === highlightIndex}
            isWinner={winner?.id === event.id}
          />
        ))}
      </div>

      {/* Result Actions */}
      {winner && !isSpinning && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-in slide-in-from-bottom duration-500">
          <button 
            onClick={handleSpin}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full shadow-lg border border-gray-600 mb-4 flex items-center gap-2"
          >
             <span>Spin Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
