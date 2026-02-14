import { useEffect, useState } from 'react';

const STORAGE_KEY = 'opinion_visitor_stats_v1'; // Bump version for new structure
const BASE_TOTAL = 124; 
const DAILY_GROWTH_MIN = 2;
const DAILY_GROWTH_MAX = 8;

interface VisitorData {
  total: number;
  today: number;
  week: number;
  lastVisit: string;
}

export const VisitorStats = () => {
  const [stats, setStats] = useState<VisitorData>({ total: BASE_TOTAL, today: 12, week: 45, lastVisit: '' });
  const [liveViewers, setLiveViewers] = useState<number>(3);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);

    let currentData: VisitorData;

    if (stored) {
      currentData = JSON.parse(stored);
      
      // Handle day change
      if (currentData.lastVisit !== today) {
        const lastDate = new Date(currentData.lastVisit);
        const currDate = new Date(today);
        const diffTime = currDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          // Add accumulated visitors for missed days
          let missedVisitors = 0;
          for (let i = 0; i < diffDays; i++) {
            missedVisitors += Math.floor(Math.random() * (DAILY_GROWTH_MAX - DAILY_GROWTH_MIN + 1)) + DAILY_GROWTH_MIN;
          }
          
          currentData.total += missedVisitors;
          currentData.week += missedVisitors; // Simply add to week for now
          
          // Reset "today" count for the new day
          // Start with a random small number for "today" so it's not 0
          currentData.today = Math.floor(Math.random() * 5) + 2; 
          
          currentData.lastVisit = today;
        }
      }
    } else {
      // First init
      const startToday = Math.floor(Math.random() * 15) + 5;
      const startWeek = Math.floor(Math.random() * 50) + 30;
      
      currentData = {
        total: BASE_TOTAL + Math.floor(Math.random() * 20),
        today: startToday,
        week: startWeek + startToday,
        lastVisit: today
      };
    }

    setStats(currentData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

    // Live update interval
    const interval = setInterval(() => {
      // 1. Live viewers fluctuation
      setLiveViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        let newVal = prev + (Math.random() > 0.7 ? change : 0);
        if (newVal < 2) newVal = 2;
        if (newVal > 9) newVal = 9;
        return newVal;
      });

      // 2. Randomly add new visitor (rare event)
      if (Math.random() > 0.85) {
        setStats(prev => {
          const newData = {
            ...prev,
            total: prev.total + 1,
            today: prev.today + 1,
            week: prev.week + 1
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          return newData;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50 font-mono text-xs select-none pointer-events-none">
      
      {/* Live Indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-green-500/20 rounded-full shadow-lg w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-green-400 font-bold tracking-wider">{liveViewers} LIVE</span>
      </div>

      {/* Stats Card */}
      <div className="flex flex-col gap-1 p-3 bg-opinion-card/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg text-gray-400 w-fit min-w-[140px]">
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] uppercase tracking-wider opacity-60">Total</span>
          <span className="font-bold text-white">{stats.total.toLocaleString()}</span>
        </div>
        <div className="w-full h-px bg-white/5 my-0.5" />
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] uppercase tracking-wider opacity-60">Today</span>
          <span className="font-bold text-green-400">+{stats.today}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[10px] uppercase tracking-wider opacity-60">This Week</span>
          <span className="font-bold text-opinion-orange">+{stats.week}</span>
        </div>
      </div>

    </div>
  );
};
