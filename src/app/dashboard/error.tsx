'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [error]);

  return (
    <div className="flex h-[60vh] w-full items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="flex max-w-md flex-col items-center gap-6 rounded-xl border border-red-500/20 bg-slate-950/50 p-8 text-center backdrop-blur-sm shadow-xl shadow-red-900/10"
      >
        <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Something went wrong!</h2>
          <p className="text-sm text-slate-400">
            An unexpected error occurred while loading this section of the dashboard.
          </p>
        </div>

        <Button 
          variant="default"
          onClick={() => reset()}
          className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 transition-all hover:text-red-300"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
