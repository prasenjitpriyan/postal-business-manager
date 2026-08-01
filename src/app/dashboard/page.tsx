'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Zap, Users, MapPin, TrendingUp, Plus, BarChart2, ArrowRight, Award, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  const stats = data?.data || { 
    totalContributions: 0, 
    totalAccountsOpened: 0, 
    totalOfficials: 0, 
    topOffice: '--',
    recentActivity: [],
    topOfficials: [],
    accountsByType: [],
    insuranceStats: {
      totalSumAssured: 0,
      totalInitialPremium: 0,
      totalInsuranceEntries: 0,
      pliCount: 0,
      rpliCount: 0
    },
    recentInsuranceActivity: []
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  useGSAP(() => {
    // Header text & initial KPI cards animate on load
    gsap.fromTo('.dash-header-text', 
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
    );

    gsap.fromTo('.dash-metric-card',
      { y: 40, opacity: 0, rotateX: -10, transformOrigin: "50% 100%" },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)' }
    );

    // Scroll-triggered animations for all widgets further down the page
    const widgets = container.current?.querySelectorAll('.dash-widget');
    widgets?.forEach((widget) => {
      gsap.fromTo(widget,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: widget,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    gsap.to('.dash-icon-bg', {
      scale: 1.05,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: container });

  return (
    <div ref={container} className="space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="dash-header-text text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
            Dashboard Overview
          </h1>
          <p className="dash-header-text text-slate-400 text-sm md:text-base">
            Welcome back to the Business & Insurance Management System.
          </p>
        </div>

        <div className="dash-header-text flex flex-wrap items-center gap-3">
          <Link href="/dashboard/insurance">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> PLI / RPLI Insurance
            </Button>
          </Link>
          <Link href="/dashboard/contributions">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20">
              <Plus className="w-4 h-4 mr-1.5" /> Add Contribution
            </Button>
          </Link>
          <Link href="/dashboard/officials">
            <Button size="sm" variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200">
              <Plus className="w-4 h-4 mr-1.5" /> Add Official
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
              <BarChart2 className="w-4 h-4 mr-1.5" /> Reports <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Business KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Accounts */}
        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm shadow-lg hover:bg-white/8 transition-all hover:-translate-y-1.5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Accounts</span>
          <p className="mt-1 text-3xl font-extrabold text-white tracking-tight">
            {isLoading ? '--' : (stats.totalAccountsOpened || 0).toLocaleString()}
          </p>
        </div>

        {/* Card 2: Total Contributions */}
        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm shadow-lg hover:bg-white/8 transition-all hover:-translate-y-1.5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/20">
            <Zap className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Entries</span>
          <p className="mt-1 text-3xl font-extrabold text-white tracking-tight">
            {isLoading ? '--' : (stats.totalContributions || 0).toLocaleString()}
          </p>
        </div>

        {/* Card 3: Total Officials */}
        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm shadow-lg hover:bg-white/8 transition-all hover:-translate-y-1.5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/20">
            <Users className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Officials</span>
          <p className="mt-1 text-3xl font-extrabold text-white tracking-tight">
            {isLoading ? '--' : stats.totalOfficials}
          </p>
        </div>

        {/* Card 4: Top Office */}
        <div className="dash-metric-card flex flex-col items-start rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm shadow-lg hover:bg-white/8 transition-all hover:-translate-y-1.5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="dash-icon-bg w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/20">
            <MapPin className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Office</span>
          <p className="mt-1 text-xl font-bold text-white tracking-tight truncate w-full">
            {isLoading ? '--' : stats.topOffice}
          </p>
        </div>
      </div>

      {/* Insurance Particulars Summary Row */}
      <div className="dash-widget bg-linear-to-r from-slate-950/80 via-emerald-950/20 to-slate-950/80 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">Insurance Particulars Overview</h3>
              <p className="text-xs text-slate-400">PLI & RPLI policy totals and initial premium summaries</p>
            </div>
          </div>
          <Link href="/dashboard/insurance">
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs">
              Manage Insurance Policies <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400">Total Sum Assured</span>
            <p className="text-2xl font-extrabold text-white mt-1">
              {isLoading ? '--' : formatCurrency(stats.insuranceStats?.totalSumAssured || 0)}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400">Total Initial Premium</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {isLoading ? '--' : formatCurrency(stats.insuranceStats?.totalInitialPremium || 0)}
            </p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400">PLI Policies Logged</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-extrabold text-indigo-400">
                {isLoading ? '--' : (stats.insuranceStats?.pliCount || 0)}
              </p>
              <span className="text-xs text-slate-500">PLI</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-400">RPLI Policies Logged</span>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-extrabold text-sky-400">
                {isLoading ? '--' : (stats.insuranceStats?.rpliCount || 0)}
              </p>
              <span className="text-xs text-slate-500">RPLI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Activity & Product Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Business Activity Widget */}
          <div className="dash-widget bg-slate-950/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-lg">Recent Account Contributions</h3>
              </div>
              <Link href="/dashboard/contributions" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center font-medium">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 px-4">Official</th>
                    <th className="pb-3 px-4">Office</th>
                    <th className="pb-3 px-4">Product</th>
                    <th className="pb-3 pl-4 text-right">Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">Loading activity...</td>
                    </tr>
                  ) : !stats.recentActivity || stats.recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">No recent activity logged.</td>
                    </tr>
                  ) : (
                    stats.recentActivity.map((item: { _id?: string; contributionDate?: string; officialId?: { name?: string; office?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }, idx: number) => (
                      <tr key={item._id || `act-${idx}`} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-4 text-slate-300 font-mono">
                          {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {item.officialId?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.contributeOffice || item.officialId?.office || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {item.accountType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right font-bold text-emerald-400">
                          +{item.accountsOpened || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Insurance Activity Widget */}
          <div className="dash-widget bg-slate-950/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-lg">Recent Insurance Particulars</h3>
              </div>
              <Link href="/dashboard/insurance" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-medium">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-medium">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 px-4">Official</th>
                    <th className="pb-3 px-4">Indexing Office</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4 text-right">Sum Assured</th>
                    <th className="pb-3 pl-4 text-right">Initial Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">Loading insurance activity...</td>
                    </tr>
                  ) : !stats.recentInsuranceActivity || stats.recentInsuranceActivity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">No recent insurance entries.</td>
                    </tr>
                  ) : (
                    stats.recentInsuranceActivity.map((item: { _id?: string; contributionDate?: string; officialId?: { name?: string; office?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number }, idx: number) => (
                      <tr key={item._id || `ins-${idx}`} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-4 text-slate-300 font-mono">
                          {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {item.officialId?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.officeOfIndexing || item.officialId?.office || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.insuranceType === 'PLI'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          }`}>
                            {item.insuranceType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-200">
                          {formatCurrency(item.sumAssured || 0)}
                        </td>
                        <td className="py-3 pl-4 text-right font-bold text-emerald-400">
                          {formatCurrency(item.initialPremium || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Types Breakdown Widget */}
          <div className="dash-widget bg-slate-950/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="font-semibold text-white text-lg mb-4">Account Product Distribution</h3>
            {isLoading ? (
              <p className="text-xs text-slate-500">Loading breakdown...</p>
            ) : !stats.accountsByType || stats.accountsByType.length === 0 ? (
              <p className="text-xs text-slate-500">No account type data available.</p>
            ) : (
              <div className="space-y-3">
                {stats.accountsByType.map((item: { type: string; count: number }, idx: number) => {
                  const percentage = stats.totalAccountsOpened > 0 
                    ? Math.round((item.count / stats.totalAccountsOpened) * 100) 
                    : 0;
                  return (
                    <div key={`type-${idx}`} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-200">{item.type}</span>
                        <span className="text-slate-400">{item.count.toLocaleString()} accounts ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-linear-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Top Officials Leaderboard & Reports Shortcut */}
        <div className="space-y-6">
          {/* Top Officials Leaderboard */}
          <div className="dash-widget bg-slate-950/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-lg">Top Performers</h3>
              </div>
              <Link href="/dashboard/officials" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-500 py-4">Loading top performers...</p>
            ) : !stats.topOfficials || stats.topOfficials.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No performer records available.</p>
            ) : (
              <div className="space-y-3">
                {stats.topOfficials.map((off: { id?: string; name?: string; office?: string; designation?: string; totalAccounts?: number }, idx: number) => (
                  <div key={off.id || `off-${idx}`} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                        idx === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{off.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{off.designation || off.office || 'Official'}</p>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-xs font-bold text-emerald-400">{off.totalAccounts || 0}</span>
                      <p className="text-[10px] text-slate-500">opened</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info & Download Reports Card */}
          <div className="dash-widget bg-linear-to-br from-indigo-950/40 to-slate-950/60 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-md">
            <h4 className="font-semibold text-indigo-300 text-sm mb-2">Download Analytics & Reports</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Export comprehensive CSV reports for both account contributions and PLI/RPLI insurance particulars for official record keeping.
            </p>
            <Link href="/dashboard/reports">
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20">
                <BarChart2 className="w-4 h-4 mr-1.5" /> Download Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

