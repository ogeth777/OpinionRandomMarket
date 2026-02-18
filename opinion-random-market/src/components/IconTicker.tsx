import React from 'react';

export const IconTicker: React.FC = () => {
  const renderSegment = (key: number) => (
    <div
      key={key}
      className="flex items-center gap-6 px-8 text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-[#ED6432]"
    >
      <span>Opinion</span>
      <span>Trade&nbsp;&nbsp;Tomorrow&nbsp;&nbsp;Now</span>
      <img src="/photo_2026-02-18_13-06-59.jpg" alt="Icons" className="h-3 opacity-90" />
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-[#160504] border-t border-[#3c1600]">
      <div className="flex ticker-scroll">
        {Array.from({ length: 6 }).map((_, index) => renderSegment(index))}
      </div>
    </div>
  );
};
