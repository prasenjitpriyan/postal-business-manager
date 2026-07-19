'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaderRef.current) {
      gsap.to(loaderRef.current, {
        rotation: 360,
        repeat: -1,
        ease: 'linear',
        duration: 1,
      });
    }
  }, []);

  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center backdrop-blur-sm shadow-xl shadow-black/50">
        <div ref={loaderRef} className="rounded-full bg-blue-500/10 p-4 border border-blue-500/20">
          <Loader2 className="h-8 w-8 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-200">Loading data</h3>
          <p className="animate-pulse text-sm text-slate-400">Please wait while we fetch the latest information...</p>
        </div>
      </div>
    </div>
  );
}
