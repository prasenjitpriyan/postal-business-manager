'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Plus, 
  BarChart2, 
  ArrowRight, 
  Award, 
  Clock, 
  ChevronRight, 
  ShieldCheck,
  FileText,
  PieChart,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeActivityTab, setActiveActivityTab] = useState<'contributions' | 'insurance'>('contributions');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'accounts' | 'insurance' | 'offices'>('accounts');

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
      rpliCount: 0,
      pliSumAssured: 0,
      pliInitialPremium: 0,
      rpliSumAssured: 0,
      rpliInitialPremium: 0
    },
    topInsuranceOfficials: [],
    topInsuranceOffices: [],
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
    if (isLoading || !container.current) return;

    // Smooth header & metric card entrance stagger
    gsap.fromTo(
      '.dash-header-animate', 
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.dash-kpi-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.2)' }
    );
  }, { scope: container, dependencies: [isLoading] });

  return (
    <div ref={container} className="space-y-8">
      {/* 1. Header & Quick Action Shortcuts */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="dash-header-animate flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              India Post Portal
            </span>
          </div>
          <p className="dash-header-animate text-slate-400 text-xs sm:text-sm">
            Real-time analytics for Postal Savings Accounts, PLI, & RPLI Insurance portfolios.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="dash-header-animate flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link href="/dashboard/contributions">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 text-xs px-3.5 py-2 h-9 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> Add Contribution
            </Button>
          </Link>
          <Link href="/dashboard/insurance">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 text-xs px-3.5 py-2 h-9 rounded-xl">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> PLI / RPLI Policy
            </Button>
          </Link>
          <Link href="/dashboard/officials">
            <Button size="sm" variant="outline" className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs px-3.5 py-2 h-9 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> Add Official
            </Button>
          </Link>
          <Link href="/dashboard/reports">
            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs h-9 rounded-xl">
              <BarChart2 className="w-4 h-4 mr-1.5" /> Reports <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Primary 360° Business KPI Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Accounts */}
        <div className="dash-kpi-card flex flex-col justify-between rounded-3xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-xl shadow-xl hover:bg-slate-900/80 hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : (stats.totalAccountsOpened || 0).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Log entries</span>
            <span className="font-semibold text-indigo-400">{(stats.totalContributions || 0).toLocaleString()} entries</span>
          </div>
        </div>

        {/* Card 2: Total Sum Assured */}
        <div className="dash-kpi-card flex flex-col justify-between rounded-3xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-xl shadow-xl hover:bg-slate-900/80 hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sum Assured</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight truncate" title={formatCurrency(stats.insuranceStats?.totalSumAssured || 0)}>
              {isLoading ? '--' : formatCurrency(stats.insuranceStats?.totalSumAssured || 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Policies count</span>
            <span className="font-semibold text-emerald-400">{(stats.insuranceStats?.totalInsuranceEntries || 0)} policies</span>
          </div>
        </div>

        {/* Card 3: Total Initial Premium */}
        <div className="dash-kpi-card flex flex-col justify-between rounded-3xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-xl shadow-xl hover:bg-slate-900/80 hover:border-teal-500/30 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Initial Premium</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight truncate" title={formatCurrency(stats.insuranceStats?.totalInitialPremium || 0)}>
              {isLoading ? '--' : formatCurrency(stats.insuranceStats?.totalInitialPremium || 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">PLI / RPLI Ratio</span>
            <span className="font-semibold text-teal-300">
              PLI {stats.insuranceStats?.pliCount || 0} : RPLI {stats.insuranceStats?.rpliCount || 0}
            </span>
          </div>
        </div>

        {/* Card 4: Active Officials & Top Office */}
        <div className="dash-kpi-card flex flex-col justify-between rounded-3xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-xl shadow-xl hover:bg-slate-900/80 hover:border-amber-500/30 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Officials</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">
              {isLoading ? '--' : stats.totalOfficials}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Top Office</span>
            <span className="font-bold text-amber-300 truncate max-w-30" title={stats.topOffice}>
              {stats.topOffice}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics Row (Side-by-side Product Breakdown & Insurance Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Product Distribution */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Account Product Portfolio</h3>
                <p className="text-xs text-slate-400">Distribution across schemes (SB, RD, TD, PPF, SSA, etc.)</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading product distribution...</p>
          ) : !stats.accountsByType || stats.accountsByType.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No account product data recorded.</p>
          ) : (
            <div className="space-y-3.5 pt-1">
              {stats.accountsByType.map((item: { type: string; count: number; percentage?: number; formattedPercentage?: string }, idx: number) => {
                const rawPct = stats.totalAccountsOpened > 0 
                  ? (item.count / stats.totalAccountsOpened) * 100 
                  : 0;
                const formattedPct = item.formattedPercentage || (rawPct < 0.1 && rawPct > 0 ? '<0.1%' : `${rawPct.toFixed(1)}%`);
                const barWidth = Math.min(100, Math.max(1.5, rawPct));
                return (
                  <div key={`type-${idx}`} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{item.type}</span>
                      <span className="text-slate-400 font-mono">
                        <strong className="text-white font-bold">{item.count.toLocaleString()}</strong> accounts ({formattedPct})
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className="bg-linear-to-r from-indigo-500 via-blue-500 to-sky-400 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insurance Particulars Breakdown (PLI vs RPLI) */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Insurance Portfolio Breakdown</h3>
                <p className="text-xs text-slate-400">PLI vs RPLI distribution, sum assured, and premium revenue</p>
              </div>
            </div>
            <Link href="/dashboard/insurance">
              <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 text-xs px-2.5 h-8">
                Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* PLI Highlights */}
            <div className="bg-slate-950/60 border border-indigo-500/20 rounded-2xl p-4 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">PLI Policy</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stats.insuranceStats?.pliCount || 0} policies
                </span>
              </div>
              <p className="text-lg font-black text-white pt-1">
                {isLoading ? '--' : formatCurrency(stats.insuranceStats?.pliSumAssured || 0)}
              </p>
              <p className="text-[11px] text-slate-400">
                Initial Prem: <strong className="text-indigo-300 font-bold">{formatCurrency(stats.insuranceStats?.pliInitialPremium || 0)}</strong>
              </p>
            </div>

            {/* RPLI Highlights */}
            <div className="bg-slate-950/60 border border-sky-500/20 rounded-2xl p-4 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">RPLI Policy</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {stats.insuranceStats?.rpliCount || 0} policies
                </span>
              </div>
              <p className="text-lg font-black text-white pt-1">
                {isLoading ? '--' : formatCurrency(stats.insuranceStats?.rpliSumAssured || 0)}
              </p>
              <p className="text-[11px] text-slate-400">
                Initial Prem: <strong className="text-sky-300 font-bold">{formatCurrency(stats.insuranceStats?.rpliInitialPremium || 0)}</strong>
              </p>
            </div>
          </div>

          {/* Combined Visual Ratio Bar */}
          {!isLoading && (stats.insuranceStats?.pliCount + stats.insuranceStats?.rpliCount > 0) && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-400">
                  PLI ({Math.round((stats.insuranceStats.pliCount / (stats.insuranceStats.pliCount + stats.insuranceStats.rpliCount || 1)) * 100)}%)
                </span>
                <span className="text-sky-400">
                  RPLI ({Math.round((stats.insuranceStats.rpliCount / (stats.insuranceStats.pliCount + stats.insuranceStats.rpliCount || 1)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                <div 
                  className="bg-linear-to-r from-indigo-600 to-indigo-400 h-full rounded-l-full transition-all duration-700" 
                  style={{ width: `${Math.round((stats.insuranceStats.pliCount / (stats.insuranceStats.pliCount + stats.insuranceStats.rpliCount || 1)) * 100)}%` }}
                />
                <div 
                  className="bg-linear-to-r from-sky-400 to-teal-400 h-full rounded-r-full transition-all duration-700" 
                  style={{ width: `${Math.round((stats.insuranceStats.rpliCount / (stats.insuranceStats.pliCount + stats.insuranceStats.rpliCount || 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Section: Tabbed Live Activity Feeds & Segmented Leaderboards Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Tabbed Live Activity Feeds */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            {/* Header & Activity Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">Live Business Streams</h3>
                  <p className="text-xs text-slate-400">Recent entries logged across post offices</p>
                </div>
              </div>

              {/* Segmented Control Tabs */}
              <div className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-2xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveActivityTab('contributions')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    activeActivityTab === 'contributions'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Account Contributions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActivityTab('insurance')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    activeActivityTab === 'insurance'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Insurance Policies
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Account Contributions */}
            {activeActivityTab === 'contributions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Showing recent 6 account contribution entries</span>
                  <Link href="/dashboard/contributions" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center">
                    View All Contributions <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Official</th>
                        <th className="py-3 px-4">Office</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4 text-right">Accounts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">Loading activity feed...</td>
                        </tr>
                      ) : !stats.recentActivity || stats.recentActivity.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">No account contributions logged yet.</td>
                        </tr>
                      ) : (
                        stats.recentActivity.map((item: { _id?: string; contributionDate?: string; officialId?: { name?: string; office?: string }; contributeOffice?: string; accountType?: string; accountsOpened?: number }, idx: number) => (
                          <tr key={item._id || `act-${idx}`} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                              {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {item.officialId?.name || 'Unknown'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {item.contributeOffice || item.officialId?.office || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {item.accountType || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                              +{item.accountsOpened || 0}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Insurance Particulars */}
            {activeActivityTab === 'insurance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Showing recent 6 insurance policy entries</span>
                  <Link href="/dashboard/insurance" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center">
                    View All Policies <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Official</th>
                        <th className="py-3 px-4">Indexing Office</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Sum Assured</th>
                        <th className="py-3 px-4 text-right">Initial Premium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">Loading insurance policies...</td>
                        </tr>
                      ) : !stats.recentInsuranceActivity || stats.recentInsuranceActivity.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">No insurance policy entries logged yet.</td>
                        </tr>
                      ) : (
                        stats.recentInsuranceActivity.map((item: { _id?: string; contributionDate?: string; officialId?: { name?: string; office?: string }; officeOfIndexing?: string; insuranceType?: string; sumAssured?: number; initialPremium?: number }, idx: number) => (
                          <tr key={item._id || `ins-${idx}`} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                              {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString('en-IN') : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {item.officialId?.name || 'Unknown'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {item.officeOfIndexing || item.officialId?.office || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.insuranceType === 'PLI'
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              }`}>
                                {item.insuranceType || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-200">
                              {formatCurrency(item.sumAssured || 0)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                              {formatCurrency(item.initialPremium || 0)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Segmented Leaderboards Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
            {/* Header & Leaderboard Segmented Controls */}
            <div className="space-y-3 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-lg">Top Performers</h3>
                </div>
              </div>

              {/* Segmented Control Buttons */}
              <div className="grid grid-cols-3 p-1 bg-slate-950/80 border border-white/10 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveLeaderboardTab('accounts')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 text-center ${
                    activeLeaderboardTab === 'accounts'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Accounts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLeaderboardTab('insurance')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 text-center ${
                    activeLeaderboardTab === 'insurance'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Insurance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLeaderboardTab('offices')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 text-center ${
                    activeLeaderboardTab === 'offices'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Offices
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Top Account Performers */}
            {activeLeaderboardTab === 'accounts' && (
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Loading top account performers...</p>
                ) : !stats.topOfficials || stats.topOfficials.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No account performer records available.</p>
                ) : (
                  stats.topOfficials.map((off: { id?: string; name?: string; office?: string; designation?: string; totalAccounts?: number }, idx: number) => (
                    <div key={off.id || `off-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-black text-xs ${
                          idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20' :
                          idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                          idx === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate" title={off.name || 'Unknown'}>{off.name || 'Unknown'}</p>
                          <p className="text-[11px] text-slate-400 truncate" title={off.designation || off.office || 'Official'}>{off.designation || off.office || 'Official'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">{off.totalAccounts || 0}</span>
                        <p className="text-[10px] text-slate-500 font-semibold">accounts</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Insurance Champions */}
            {activeLeaderboardTab === 'insurance' && (
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Loading insurance champions...</p>
                ) : !stats.topInsuranceOfficials || stats.topInsuranceOfficials.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No insurance champions recorded.</p>
                ) : (
                  stats.topInsuranceOfficials.map((off: { id?: string; name?: string; office?: string; designation?: string; totalSumAssured?: number; totalInitialPremium?: number; policies?: number }, idx: number) => (
                    <div key={off.id || `ins-off-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-black text-xs ${
                          idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20' :
                          idx === 1 ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30' :
                          idx === 2 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate" title={off.name || 'Unknown'}>{off.name || 'Unknown'}</p>
                          <p className="text-[11px] text-slate-400 truncate" title={`${off.office || 'Official'} (${off.policies || 0} policies)`}>
                            {off.office || 'Official'} ({off.policies || 0} pol)
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-400 block">{formatCurrency(off.totalSumAssured || 0)}</span>
                        <p className="text-[10px] text-slate-400 font-mono">Prem: {formatCurrency(off.totalInitialPremium || 0)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 3: Top Indexing Offices */}
            {activeLeaderboardTab === 'offices' && (
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Loading top indexing offices...</p>
                ) : !stats.topInsuranceOffices || stats.topInsuranceOffices.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No office records available.</p>
                ) : (
                  stats.topInsuranceOffices.map((off: { office?: string; totalSumAssured?: number; totalInitialPremium?: number; policies?: number }, idx: number) => {
                    const maxSum = stats.topInsuranceOffices[0]?.totalSumAssured || 1;
                    const barWidth = Math.min(100, Math.max(10, Math.round(((off.totalSumAssured || 0) / maxSum) * 100)));
                    return (
                      <div key={`ins-office-${idx}`} className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center text-xs gap-2">
                          <span className="font-bold text-white truncate min-w-0 flex-1" title={off.office || 'N/A'}>
                            {idx + 1}. {off.office || 'N/A'}
                          </span>
                          <span className="font-black text-teal-400 shrink-0">{formatCurrency(off.totalSumAssured || 0)}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div 
                            className="bg-linear-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{off.policies || 0} policies logged</span>
                          <span>Premium: <strong className="text-teal-300">{formatCurrency(off.totalInitialPremium || 0)}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Export & Reports Card */}
          <div className="bg-linear-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border border-indigo-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-3.5">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                <Download className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Download Analytics & CSV Reports</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export official CSV logs for both postal account contributions and PLI/RPLI insurance particulars.
            </p>
            <Link href="/dashboard/reports" className="block pt-1">
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 h-10 rounded-xl shadow-md shadow-indigo-600/30">
                <BarChart2 className="w-4 h-4 mr-1.5" /> Export Official Reports
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
