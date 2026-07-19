'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, Users, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
  });

  const stats = data?.data || { totalContributions: '--', totalOfficials: '--', topOffice: '--' };


  useGSAP(() => {
    const tl = gsap.timeline();

    // Staggered reveal for the header
    tl.fromTo('.dash-header-text', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
    )
    // Staggered 3D-like reveal for metric cards
    .fromTo('.dash-metric-card',
      { y: 50, opacity: 0, rotateX: -15, transformOrigin: "50% 100%" },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.5)' },
      '-=0.3'
    );

    // Continuous floating/pulse for icons inside cards
    gsap.to('.dash-icon-bg', {
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: container });

  return (
    <div ref={container} className="space-y-8">
      <div>
        <h1 className="dash-header-text text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="dash-header-text text-slate-400">
          Welcome back to the Business Contribution Management System.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-sm shadow-lg hover:bg-white/[0.07] transition-all hover:-translate-y-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-300 text-lg">Total Contributions</h3>
          <p className="mt-2 text-4xl font-bold text-white tracking-tight">
            {isLoading ? '--' : stats.totalContributions}
          </p>
        </div>

        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-sm shadow-lg hover:bg-white/[0.07] transition-all hover:-translate-y-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/20">
            <Users className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-300 text-lg">Total Officials</h3>
          <p className="mt-2 text-4xl font-bold text-white tracking-tight">
            {isLoading ? '--' : stats.totalOfficials}
          </p>
        </div>

        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-sm shadow-lg hover:bg-white/[0.07] transition-all hover:-translate-y-2 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/20">
            <MapPin className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-300 text-lg">Top Office</h3>
          <p className="mt-2 text-4xl font-bold text-white tracking-tight">
            {isLoading ? '--' : stats.topOffice}
          </p>
        </div>
      </div>
    </div>
  );
}
