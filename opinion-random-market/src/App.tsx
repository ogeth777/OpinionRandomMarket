import { useState } from 'react';
import { useEvents } from './hooks/useEvents';
import { HorizontalScroller } from './components/HorizontalScroller';
import { Loader2 } from 'lucide-react';
import type { OpinionEvent } from './types';
import { OpinionLogo } from './components/OpinionLogo';
import { Background } from './components/Background';
import { DetailView } from './components/DetailView';
import { IconTicker } from './components/IconTicker';
import confetti from 'canvas-confetti';
import { playWin, initAudio } from './utils/sound';
import { VisitorStats } from './components/VisitorStats';

function App() {
  const { events, loading, error } = useEvents();
  const [winner, setWinner] = useState<OpinionEvent | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpinStart = () => {
    initAudio();
    if (isSpinning || loading || events.length === 0) return;
    setWinner(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = (wonEvent: OpinionEvent) => {
    setWinner(wonEvent);
    setIsSpinning(false);
    playWin();
    
    // Confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#FF5500', '#ffffff', '#22c55e'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleShare = () => {
    if (!winner) return;
    const siteUrl = window.location.origin + window.location.pathname;
    const url = `${siteUrl}?ref=OG_Cryptooo`;
    const text = `I got ${winner.title}! Check out OpinionRandomMarket: ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'OpinionRandomMarket', text, url });
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-opinion-black text-white font-['Inter'] selection:bg-opinion-orange/30 overflow-x-hidden relative">
      <Background />
      
      <header className="fixed top-0 left-0 right-0 z-40 bg-opinion-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 py-4 flex justify-between items-center">
          <OpinionLogo />
          <div className="hidden md:block text-xs font-mono text-gray-500 uppercase tracking-widest">
            {loading ? 'SYNCING MARKET DATA...' : <span className="text-opinion-orange/80">{events.length} ACTIVE MARKETS</span>}
          </div>
        </div>
        <IconTicker />
      </header>

      <main className="pt-40 pb-16 flex flex-col items-center min-h-screen relative z-10">
        
        {/* BIG BUTTON */}
        <div className="mb-12 z-20">
          <button
            onClick={handleSpinStart}
            disabled={isSpinning || loading || !!error}
            className="group relative px-12 py-6 bg-opinion-orange rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,85,0,0.4)] hover:shadow-[0_0_60px_rgba(255,85,0,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <span className="relative text-2xl font-black tracking-widest text-white uppercase font-['Space_Grotesk']">
              {isSpinning ? 'SPINNING...' : 'REVEAL RANDOM MARKET'}
            </span>
          </button>
        </div>

        {/* SCROLLER AREA */}
        <div className="w-full relative min-h-[360px] flex items-center justify-center mb-8">
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="absolute inset-0 bg-opinion-orange/5 blur-3xl pointer-events-none" />

          {loading ? (
            <div className="flex flex-col items-center gap-4 text-gray-400 animate-pulse">
              <Loader2 size={48} className="animate-spin text-opinion-orange" />
              <p className="font-mono text-sm tracking-widest uppercase">Loading markets...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 bg-red-500/10 p-6 rounded-xl border border-red-500/20 text-center max-w-md backdrop-blur-md">
              <p className="font-bold mb-2">Error loading data</p>
              <p className="text-sm opacity-80">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <HorizontalScroller 
              events={events}
              isSpinning={isSpinning}
              onSpinEnd={handleSpinEnd}
              winner={winner}
            />
          )}
        </div>

        {/* WINNER DETAIL VIEW */}
        {winner && !isSpinning && (
          <DetailView 
            winner={winner} 
            onShare={handleShare}
          />
        )}
      </main>

      <VisitorStats />

      {/* FOOTER SOCIALS */}
      <footer className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-md p-3 rounded-full border border-white/10 shadow-xl">
          <a 
            href="https://opinion.trade" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            title="Opinion Labs Website"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-opinion-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
          
          <div className="w-px h-4 bg-white/10" />

          <a 
            href="https://x.com/opinionlabsxyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            title="Follow on X (Twitter)"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a 
            href="http://discord.gg/opinionlabs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            title="Join Discord Community"
          >
             <svg className="w-5 h-5 text-gray-400 group-hover:text-[#5865F2] transition-colors" fill="currentColor" viewBox="0 0 24 24">
               <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
             </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
