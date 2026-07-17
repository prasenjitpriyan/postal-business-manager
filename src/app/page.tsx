'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Floating backgrounds
    gsap.to('.bg-orb-1', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    gsap.to('.bg-orb-2', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });

    // SVG Line Drawing Animation
    tl.to('.svg-path', {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: 'power2.inOut',
      stagger: 0.3,
    }, 0)
    .to('.svg-node', {
      opacity: 1,
      scale: 1.5,
      duration: 0.8,
      stagger: 0.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    }, 1.5);

    // Initial sequence
    tl.fromTo('header', 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      0
    )
    .fromTo('.hero-badge', 
      { scale: 0.8, y: 20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      0.3
    )
    // Advanced 3D staggered text reveal for title
    .fromTo('.hero-word', 
      { y: 50, opacity: 0, rotateX: -90, transformOrigin: "0% 50% -50" },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)' },
      0.5
    )
    .fromTo('.hero-text', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      1.0
    )
    .fromTo('.hero-btn', 
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
      1.2
    )
    .fromTo('.feature-card', 
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' },
      1.4
    )
    .fromTo('footer', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      1.8
    );

    // Continuous floating animation for the badge
    gsap.to('.hero-badge', {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5
    });

  }, { scope: container });

  const titleWords = ["Manage", "contributions", "with"];

  return (
    <div ref={container} className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb-1 absolute top-[-25%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="bg-orb-2 absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* GSAP Animated SVG Background for Hero */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 flex items-center justify-center">
        <svg className="w-full h-full max-w-7xl" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" fill="none">
          <path className="svg-path" d="M-100,250 C200,100 400,400 1100,200" stroke="url(#grad1)" strokeWidth="3" strokeDasharray="1500" strokeDashoffset="1500" strokeLinecap="round" />
          <path className="svg-path" d="M-100,300 C300,500 500,50 1100,250" stroke="url(#grad2)" strokeWidth="3" strokeDasharray="1500" strokeDashoffset="1500" strokeLinecap="round" />
          <path className="svg-path" d="M-100,150 C250,-50 600,450 1100,150" stroke="url(#grad3)" strokeWidth="3" strokeDasharray="1500" strokeDashoffset="1500" strokeLinecap="round" />
          
          <circle className="svg-node origin-center" cx="290" cy="225" r="5" fill="#60A5FA" opacity="0" />
          <circle className="svg-node origin-center" cx="620" cy="275" r="5" fill="#818CF8" opacity="0" />
          <circle className="svg-node origin-center" cx="440" cy="240" r="5" fill="#C084FC" opacity="0" />
          
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

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Postal Manager</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Go to Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-24 text-center">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">Modernize your postal business workflow</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl relative perspective-1000">
          {titleWords.map((word, i) => (
            <span key={i} className="hero-word inline-block mr-3 md:mr-4 whitespace-nowrap">{word}</span>
          ))}
          <span className="hero-word inline-block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400 whitespace-nowrap">
            absolute precision
          </span>
        </h1>
        
        <p className="hero-text text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The all-in-one management system designed to track officials, oversee contributions, and generate comprehensive reports seamlessly.
        </p>

        <div className="hero-btn flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:-translate-y-1 group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards-container grid md:grid-cols-3 gap-6 mt-28 w-full max-w-6xl px-4 text-left">
          <div className="feature-card flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all hover:-translate-y-2 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-400 text-left">Optimized performance ensures your data is always ready when you need it.</p>
          </div>
          <div className="feature-card flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all hover:-translate-y-2 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
            <p className="text-slate-400 text-left">Enterprise-grade security keeps your officials&apos; data and contributions protected.</p>
          </div>
          <div className="feature-card flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-all hover:-translate-y-2 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Box className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Comprehensive Tracking</h3>
            <p className="text-slate-400 text-left">Monitor contributions across all offices from a single unified dashboard.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/30 backdrop-blur-md py-10 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Postal Manager</span>
          </div>
          
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Postal Business Manager. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
