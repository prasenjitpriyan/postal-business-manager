'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Users, FileText, Home, LogOut, Menu, ShieldCheck, BarChart3, X, Sparkles, UserCog, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostalLogo } from '@/components/brand/PostalLogo';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useGSAP(() => {
    if (!isMounted || !isAuthenticated) return;

    const tl = gsap.timeline();

    // Ambient floating backgrounds
    gsap.to('.bg-orb-1', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    
    gsap.to('.bg-orb-2', {
      y: 'random(-30, 30)',
      x: 'random(-30, 30)',
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1,
    });

    // Layout entrance animations
    tl.fromTo('.dashboard-sidebar', 
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.dashboard-header', 
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.dashboard-nav-item', 
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)' },
      '-=0.3'
    )
    .fromTo('.dashboard-main', 
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.2'
    );
  }, { scope: container, dependencies: [isMounted, isAuthenticated] });

  if (!isMounted || !isAuthenticated) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/officials', label: 'Officials', icon: Users },
    { href: '/dashboard/contributions', label: 'Contributions', icon: FileText },
    { href: '/dashboard/insurance', label: 'Insurance (PLI/RPLI)', icon: ShieldCheck },
    { href: '/dashboard/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ href: '/dashboard/messages', label: 'Support Messages', icon: Mail });
    navItems.push({ href: '/dashboard/users', label: 'User Access Control', icon: UserCog });
  }

  return (
    <div ref={container} className="dark flex h-screen bg-slate-950 text-slate-50 relative overflow-hidden font-sans">
      {/* Background ambient gradient blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-orb-1 absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-900/15 blur-[130px]" />
        <div className="bg-orb-2 absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-900/15 blur-[130px]" />
      </div>

      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 md:bg-slate-950/60 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <PostalLogo size="sm" />
          <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`dashboard-nav-item group relative flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl min-h-11 transition-all duration-200 border ${
                  isActive 
                    ? 'bg-linear-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-white border-blue-500/30 shadow-lg shadow-blue-500/10 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5 font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-linear-to-b from-blue-400 to-indigo-500 shadow-sm shadow-blue-400" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Account Details Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40">
          <div className="flex items-center space-x-3 mb-4 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 via-indigo-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center font-bold text-white text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate text-white">{user?.name}</p>
              <div className="flex items-center gap-1 text-[11px] text-blue-400 font-medium capitalize">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{user?.role || 'Officer'}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors min-h-11 rounded-xl text-xs font-semibold" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <header className="dashboard-header bg-slate-950/60 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-8 z-20">
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300 hover:text-white hover:bg-white/10 min-h-11 min-w-11">
              <Menu className="w-6 h-6" />
            </Button>
            <PostalLogo size="sm" showText={false} />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Welcome back,</span>
            <span className="text-xs font-bold text-white">{user?.name}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Live Portal
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-main flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
