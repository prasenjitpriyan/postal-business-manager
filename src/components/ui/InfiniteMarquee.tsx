'use client';

import { motion } from 'motion/react';

interface MarqueeItem {
  label: string;
  category?: string;
}

interface InfiniteMarqueeProps {
  items: MarqueeItem[];
  direction?: 'left' | 'right';
  speed?: number;
}

export function InfiniteMarquee({ items, direction = 'left', speed = 25 }: InfiniteMarqueeProps) {
  // Duplicate items array to ensure seamless infinite looping
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden whitespace-nowrap flex select-none py-4 relative mask-linear-fade">
      {/* Subtle fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-4 items-center shrink-0"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: speed,
        }}
      >
        {marqueeItems.map((item, idx) => (
          <div
            key={`marquee-${idx}-${item.label}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md text-sm text-slate-300 font-medium hover:border-blue-500/40 hover:text-white transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>{item.label}</span>
            {item.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 uppercase tracking-wider font-semibold">
                {item.category}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
