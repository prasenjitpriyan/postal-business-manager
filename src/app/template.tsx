'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="w-full min-h-full flex flex-col">
      {children}
    </div>
  );
}
