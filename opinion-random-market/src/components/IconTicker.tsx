import React from 'react';

export const IconTicker: React.FC = () => {
  const renderSegment = (key: number) => (
    <div
      key={key}
      className="flex items-center gap-10 px-8 text-[10px] md:text-xs font-['Space_Grotesk'] uppercase tracking-[0.32em] text-[#ED6432]"
    >
      <span className="font-bold">Opinion</span>
      <span className="font-medium">Trade</span>
      <span className="font-medium">Tomorrow</span>
      <span className="font-medium">Now</span>
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
