'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Shield, Zap, BarChart3, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostalLogo } from '@/components/brand/PostalLogo';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TiltCard } from '@/components/ui/TiltCard';
import { InfiniteMarquee } from '@/components/ui/InfiniteMarquee';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { TimelineReveal, TimelineStep } from '@/components/ui/TimelineReveal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const marqueeTech = [
  { label: 'Next.js 16', category: 'Framework' },
  { label: 'GSAP Animation Engine', category: 'Motion' },
  { label: 'Framer Motion', category: 'UI' },
  { label: 'TypeScript', category: 'Language' },
  { label: 'Tailwind CSS v4', category: 'Styling' },
  { label: 'MongoDB & Mongoose', category: 'Database' },
  { label: 'PLI / RPLI Analytics', category: 'Domain' },
  { label: 'Official Management', category: 'Feature' },
];

const timelineSteps: TimelineStep[] = [
  {
    step: 'Phase 01',
    title: 'Official Directory & Roles',
    description: 'Centralized indexing for officials across all postal offices with secure role-based access.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    step: 'Phase 02',
    title: 'Insurance Policy Tracking',
    description: 'Monitor PLI & RPLI contributions, sum assured values, and initial premium collections.',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    step: 'Phase 03',
    title: 'Analytical Reports & Export',
    description: 'Generate instant statistical breakdowns, interactive charts, and downloadable data reports.',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    step: 'Phase 04',
    title: 'Audit & Compliance',
    description: 'Real-time validation, pagination, and precision record keeping for departmental compliance.',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
];

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Floating background blobs
    gsap.to('.bg-orb-1', {
      y: 'random(-60, 60)',
      x: 'random(-60, 60)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    gsap.to('.bg-orb-2', {
      y: 'random(-70, 70)',
      x: 'random(-70, 70)',
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });

    gsap.to('.bg-orb-3', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 14,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2,
    });

    // 2. SVG Line & Node Drawing Animation
    const svgTl = gsap.timeline();
    svgTl.to('.svg-path', {
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

    // 3. Hero Sequence with SplitText Style Word Reveal
    const heroTl = gsap.timeline();
    heroTl.fromTo('header', 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0
    )
    .fromTo('.hero-badge', 
      { scale: 0.8, y: 20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      0.3
    )
    .fromTo('.hero-word', 
      { y: 60, opacity: 0, rotateX: -90, transformOrigin: '0% 50% -60px' },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.4)' },
      0.5
    )
    .fromTo('.hero-text', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      1.0
    )
    .fromTo('.hero-btn-container', 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
      1.2
    );

    // 4. Scroll-Triggered Staggered Section Entrances
    if (container.current) {
      const sections = container.current.querySelectorAll('.gsap-reveal-section');

      sections.forEach((sec) => {
        gsap.fromTo(sec, 
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });
    }

    // 5. Continuous Floating Badge Animation
    gsap.to('.hero-badge', {
      y: -6,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.8
    });

  }, { scope: container });

  const heroWordsFirst = ["Modern", "Postal", "Management"];
  const heroWordsSecond = ["Engineered", "with"];

  return (
    <div ref={container} className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* Floating Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-orb-1 absolute top-[-25%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-900/20 blur-[130px]" />
        <div className="bg-orb-2 absolute top-[25%] right-[-10%] w-[45%] h-[65%] rounded-full bg-indigo-900/20 blur-[130px]" />
        <div className="bg-orb-3 absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-900/15 blur-[120px]" />
      </div>

      {/* SVG Path Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25 flex items-center justify-center">
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

      {/* Navigation Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-white/10 backdrop-blur-md bg-slate-950/60">
        <div className="header-logo">
          <PostalLogo size="md" />
        </div>
        <div className="header-actions flex items-center gap-4">
          <MagneticButton strength={0.25}>
            <Link href="/login" id="login-nav-btn">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-semibold min-h-11 rounded-full px-5">
                Sign In
              </Button>
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.35}>
            <Link href="/signup" id="signup-nav-btn">
              <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm min-h-11 rounded-full px-6 shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
          </MagneticButton>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-20 text-center">
        {/* Animated Badge */}
        <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
            Next.js + GSAP + Motion Integration
          </span>
        </div>
        
        {/* SplitText Style 3D Heading Reveal */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-5xl relative perspective-1000">
          {heroWordsFirst.map((word, i) => (
            <span key={`hw1-${i}-${word}`} className="hero-word inline-block mr-3 md:mr-4 whitespace-nowrap">{word}</span>
          ))}
          <br className="hidden sm:inline" />
          {heroWordsSecond.map((word, i) => (
            <span key={`hw2-${i}-${word}`} className="hero-word inline-block mr-3 md:mr-4 whitespace-nowrap">{word}</span>
          ))}
          <span className="hero-word inline-block text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-cyan-400 whitespace-nowrap">
            Absolute Precision
          </span>
        </h1>
        
        <p className="hero-text text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          The all-in-one postal operational platform designed to track officials, oversee PLI & RPLI contributions, and generate high-impact analytical reports.
        </p>

        {/* Magnetic CTAs */}
        <div className="hero-btn-container flex flex-col sm:flex-row items-center gap-4">
          <MagneticButton strength={0.4}>
            <Link href="/dashboard" id="hero-get-started-link">
              <Button id="hero-get-started-btn" size="lg" className="h-14 px-8 text-base sm:text-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.35)] transition-all group relative overflow-hidden">
                <span className="relative z-10 flex items-center font-bold">
                  Explore Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </MagneticButton>

          <MagneticButton strength={0.25}>
            <Link href="/dashboard/insurance">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base sm:text-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-400/60 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] font-bold transition-all">
                <Shield className="w-5 h-5 mr-2 text-emerald-400" />
                PLI & RPLI Tracker
              </Button>
            </Link>
          </MagneticButton>
        </div>

        {/* Infinite Tech Marquee Section */}
        <section aria-label="Technology Stack" className="w-full max-w-7xl mt-20 gsap-reveal-section">
          <InfiniteMarquee items={marqueeTech} speed={30} />
        </section>

        {/* Animated Counter Stats Row */}
        <section aria-label="Key Performance Statistics" className="w-full max-w-5xl mt-20 px-4 gsap-reveal-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <AnimatedCounter key="ac-officials" value={500} suffix="+" label="Officials Tracked" />
            <AnimatedCounter key="ac-sum" value={10} prefix="₹" suffix="M+" label="Sum Assured" />
            <AnimatedCounter key="ac-offices" value={100} suffix="+" label="Postal Offices" />
            <AnimatedCounter key="ac-accuracy" value={99.9} suffix="%" label="Audit Accuracy" />
          </div>
        </section>

        {/* 3D Tilt Feature Cards */}
        <section aria-labelledby="features-heading" className="w-full max-w-6xl mt-28 gsap-reveal-section">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Speed & Reliability
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Cutting-edge architecture backed by reactive state and modern motion design
            </p>
          </div>

          <div className="feature-cards-container grid md:grid-cols-3 gap-6 px-4 text-left">
            <TiltCard key="tc-fast" maxTilt={10} className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                <Zap className="w-6 h-6 text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Optimized React Query caching ensures instant data retrieval across all postal divisions.
              </p>
            </TiltCard>

            <TiltCard key="tc-secure" maxTilt={10} className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Architecture</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enterprise JWT session management and bcrypt encryption for official data protection.
              </p>
            </TiltCard>

            <TiltCard key="tc-tracking" maxTilt={10} className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                <Box className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">PLI & RPLI Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Complete oversight of insurance particulars, index offices, premium collection, and policy counts.
              </p>
            </TiltCard>
          </div>
        </section>

        {/* Scroll Timeline Section */}
        <section aria-label="Workflow Timeline" className="w-full max-w-6xl mt-28 gsap-reveal-section">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              Operational Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
              How Postal Manager Powers Your Workflow
            </h2>
          </div>

          <TimelineReveal steps={timelineSteps} />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-10 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="footer-brand flex items-center opacity-90 hover:opacity-100 transition-opacity">
            <PostalLogo size="md" />
          </div>
          
          <p className="footer-text text-slate-500 text-sm">
            © {new Date().getFullYear()} Postal Business Manager. Built with Next.js, GSAP & Motion.
          </p>
          
          <nav aria-label="Footer Navigation" className="flex gap-6">
            <Link href="#" id="footer-privacy-link" className="footer-link text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" id="footer-terms-link" className="footer-link text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" id="footer-contact-link" className="footer-link text-sm text-slate-400 hover:text-white transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
