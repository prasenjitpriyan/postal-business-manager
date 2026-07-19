'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error(error);
    
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-rose-900/10 blur-[120px]" />
      </div>

      <div 
        ref={containerRef}
        className="relative z-10 flex max-w-md w-full flex-col items-center gap-6 rounded-2xl border border-red-500/20 bg-slate-950/80 p-8 text-center backdrop-blur-md shadow-2xl shadow-red-900/20"
      >
        <div className="rounded-2xl bg-red-500/10 p-5 border border-red-500/20 shadow-inner">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">Oops! Something went wrong</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Button 
            variant="default"
            onClick={() => reset()}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 transition-all hover:text-red-300 h-12"
          >
            Try again
          </Button>
          
          <Link href="/" className="flex-1">
            <Button 
              variant="outline"
              className="w-full bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
