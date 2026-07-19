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
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background gradients for consistency with the rest of the app */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center backdrop-blur-md shadow-xl shadow-black/50">
        <div ref={loaderRef} className="rounded-full bg-blue-500/10 p-4 border border-blue-500/20">
          <Loader2 className="h-8 w-8 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-200">Loading Postal Manager</h3>
          <p className="animate-pulse text-sm text-slate-400">Please wait while we set things up...</p>
        </div>
      </div>
    </div>
  );
}
