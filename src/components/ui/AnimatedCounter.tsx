'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  label: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  label,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out expo formula
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easedProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-md">
      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-cyan-400 tracking-tight">
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </div>
      <p className="text-xs md:text-sm font-medium text-slate-400 mt-2 text-center uppercase tracking-wider">{label}</p>
    </div>
  );
}
