'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Users, FileText, Home, LogOut, Menu, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
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
      { y: -100, opacity: 0 },
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

  // Prevent hydration mismatch
  if (!isMounted) return null;
  if (!isAuthenticated) return null;

  return (
    <div ref={container} className="dark flex h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="bg-orb-1 absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="bg-orb-2 absolute bottom-[-10%] right-[-10%] w-[35%] h-[45%] rounded-full bg-indigo-900/10 blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/90 md:bg-slate-950/40 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Postal Manager</h1>
            <p className="text-xs text-blue-400 font-medium">Business Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="dashboard-nav-item group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
            <Home className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/officials" onClick={() => setIsMobileMenuOpen(false)} className="dashboard-nav-item group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
            <Users className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Officials</span>
          </Link>
          <Link href="/dashboard/contributions" onClick={() => setIsMobileMenuOpen(false)} className="dashboard-nav-item group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
            <FileText className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Contributions</span>
          </Link>
          <Link href="/dashboard/reports" onClick={() => setIsMobileMenuOpen(false)} className="dashboard-nav-item group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/5">
            <FileText className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Reports</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 bg-slate-950/20">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg font-bold border border-white/10">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
              <p className="text-xs text-blue-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navbar */}
        <header className="dashboard-header bg-slate-950/40 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 z-20">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300 hover:text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            {/* Additional header actions can go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-main flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
