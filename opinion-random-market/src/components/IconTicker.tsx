import React from 'react';

export const IconTicker: React.FC = () => {
  const renderSegment = (key: number) => (
    <div
      key={key}
      className="flex items-center gap-6 px-6 text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-opinion-orange/80"
    >
      <span>Trade Tomorrow Now</span>
      <img src="/icons.svg" alt="Opinion Icons" className="h-4 opacity-80" />
      <span>Opinion Random Market</span>
      <img src="/icons.svg" alt="Opinion Icons" className="h-4 opacity-80" />
    </div>
  );

  return (
    <div className="w-full overflow-hidden border-t border-opinion-orange/20 bg-black/80">
      <div className="flex ticker-scroll">
        {Array.from({ length: 6 }).map((_, index) => renderSegment(index))}
      </div>
    </div>
  );
};

