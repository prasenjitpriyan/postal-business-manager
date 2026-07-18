'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function NotFound() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Floating backgrounds (similar to landing page)
    gsap.to('.bg-orb-1', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    gsap.to('.bg-orb-2', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });

    // SVG Line Drawing Animation for 404
    tl.to('.svg-path', {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
      stagger: 0.2,
    }, 0)
    .to('.svg-node', {
      opacity: 1,
      scale: 1.5,
      duration: 0.8,
      stagger: 0.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    }, 1.2);

    // Initial text and button sequence
    tl.fromTo('.not-found-badge', 
      { scale: 0.8, y: 20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      0.5
    )
    .fromTo('.not-found-title', 
      { y: 30, opacity: 0, rotateX: -90, transformOrigin: "0% 50% -50" },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.8, ease: 'back.out(1.5)' },
      0.8
    )
    .fromTo('.not-found-text', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      1.1
    )
    .fromTo('.not-found-btn', 
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
      1.3
    );

    // Continuous floating animation for the badge
    gsap.to('.not-found-badge', {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5
    });

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb-1 absolute top-[-20%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]" />
        <div className="bg-orb-2 absolute bottom-[-10%] right-[10%] w-[35%] h-[45%] rounded-full bg-indigo-900/20 blur-[100px]" />
      </div>

      {/* GSAP Animated SVG 404 Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center">
        <svg className="w-full h-full max-w-5xl" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" fill="none">
          {/* Decorative broken lines indicating a lost route (postal theme) */}
          <path className="svg-path" d="M100,250 L400,250 M450,250 L550,250 M600,250 L900,250" stroke="url(#grad1)" strokeWidth="4" strokeDasharray="800" strokeDashoffset="800" strokeLinecap="round" />
          <path className="svg-path" d="M300,100 C400,100 450,200 450,250" stroke="url(#grad2)" strokeWidth="3" strokeDasharray="500" strokeDashoffset="500" strokeLinecap="round" />
          <path className="svg-path" d="M700,400 C600,400 550,300 550,250" stroke="url(#grad3)" strokeWidth="3" strokeDasharray="500" strokeDashoffset="500" strokeLinecap="round" />
          
          {/* Animated 404 Text constructed from SVG paths */}
          <g transform="translate(250, 150) scale(1.5)">
            {/* Number 4 */}
            <path className="svg-path" d="M80,100 L20,100 L60,20 L60,120" stroke="url(#grad1)" strokeWidth="8" strokeDasharray="300" strokeDashoffset="300" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Number 0 */}
            <path className="svg-path" d="M150,20 C110,20 110,120 150,120 C190,120 190,20 150,20 Z" stroke="url(#grad2)" strokeWidth="8" strokeDasharray="400" strokeDashoffset="400" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Number 4 */}
            <path className="svg-path" d="M260,100 L200,100 L240,20 L240,120" stroke="url(#grad3)" strokeWidth="8" strokeDasharray="300" strokeDashoffset="300" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          
          <circle className="svg-node origin-center" cx="425" cy="250" r="6" fill="#EF4444" opacity="0" />
          <circle className="svg-node origin-center" cx="575" cy="250" r="6" fill="#EF4444" opacity="0" />
          
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="1000" y2="0">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="grad2" x1="0" y1="0" x2="1000" y2="0">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="grad3" x1="0" y1="0" x2="1000" y2="0">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Postal Manager</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24 text-center">
        <div className="not-found-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-200">Error 404</span>
        </div>
        
        <h1 className="not-found-title text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight relative perspective-1000">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
            Package Not Found
          </span>
        </h1>
        
        <p className="not-found-text text-lg md:text-xl text-slate-400 max-w-xl mb-12 leading-relaxed">
          The postal route you&apos;re looking for doesn&apos;t seem to exist. It might have been moved, deleted, or delivered to the wrong address.
        </p>

        <div className="not-found-btn">
          <Link href="/">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:-translate-y-1 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Return to Base
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
