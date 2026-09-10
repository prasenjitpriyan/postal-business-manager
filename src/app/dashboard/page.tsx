'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Clock, FileText, ShieldCheck, ChevronRight } from 'lucide-react';

import { ExecutiveHeader } from '@/features/dashboard/components/ExecutiveHeader';
import { ExecutivePulseCards } from '@/features/dashboard/components/ExecutivePulseCards';
import { TargetVsActualSection } from '@/features/dashboard/components/TargetVsActualSection';
import { BusinessTrendSection } from '@/features/dashboard/components/BusinessTrendSection';
import { OfficePerformanceTable } from '@/features/dashboard/components/OfficePerformanceTable';
import { OfficialPerformanceSection } from '@/features/dashboard/components/OfficialPerformanceSection';
import { ExecutiveActionCenter } from '@/features/dashboard/components/ExecutiveActionCenter';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { DashboardErrorState } from '@/features/dashboard/components/DashboardErrorState';
import { ExecutiveDashboardData } from '@/types/dashboard';
import { formatCurrencyINR } from '@/features/dashboard/utils/formatters';

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null);
  const [activeActivityTab, setActiveActivityTab] = useState<'contributions' | 'insurance'>('contributions');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date | null>(null);

  const fetchStats = async (): Promise<ExecutiveDashboardData> => {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Failed to fetch executive dashboard telemetry');
    }
    const json = await res.json();
    setLastUpdatedTime(new Date());
    return json.data;
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery<ExecutiveDashboardData>({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
    refetchInterval: 60_000, // Automatic background polling every 60 seconds
  });

  // Subtle GSAP entrance animation for high-density executive console
  useGSAP(
    () => {
      if (isLoading || !container.current || !data) return;

      gsap.fromTo(
        '.exec-section-fade',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      );
    },
    { scope: container, dependencies: [isLoading, Boolean(data)] }
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        error={error as Error}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div ref={container} className="space-y-7 pb-10">
      {/* 1. Executive Command Header (Zone 1) */}
      <div className="exec-section-fade">
        <ExecutiveHeader
          currentFiscalYear={data.currentFiscalYear}
          currentFiscalMonthLabel={data.currentFiscalMonthLabel}
          daysElapsedInMonth={data.daysElapsedInMonth}
          totalDaysInMonth={data.totalDaysInMonth}
          monthRunRatePercentage={data.monthRunRatePercentage}
          isRefetching={isRefetching}
          onRefresh={() => refetch()}
          lastUpdatedTime={lastUpdatedTime}
        />
      </div>

      {/* 2. Executive Pulse (6 High-Density KPI Cards - Zone 2) */}
      <div className="exec-section-fade">
        <ExecutivePulseCards
          today={data.today}
          mtd={data.mtd}
          targetsSummary={data.targetsSummary}
          pliTrend={data.pliTrend}
          rpliTrend={data.rpliTrend}
          monthRunRatePercentage={data.monthRunRatePercentage}
        />
      </div>

      {/* 3. Strategic Performance & Momentum (Target vs Actual + Business Trend - Zone 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 exec-section-fade">
        <TargetVsActualSection
          targetsSummary={data.targetsSummary}
          monthRunRatePercentage={data.monthRunRatePercentage}
        />
        <BusinessTrendSection
          timelineTrends={data.timelineTrends}
          pliTrend={data.pliTrend}
          rpliTrend={data.rpliTrend}
          accountsTrend={data.accountsTrend}
        />
      </div>

      {/* 4. Operational Field Intelligence (Office Performance + Official Performance - Zone 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 exec-section-fade">
        <OfficePerformanceTable officeRankings={data.officeRankings} />
        <OfficialPerformanceSection
          topOfficials={data.topOfficials}
          topInsuranceOfficials={data.topInsuranceOfficials}
          officialsNeedingAttention={data.officialsNeedingAttention}
        />
      </div>

      {/* 5. Executive Action Center (Directives & Alerts - Zone 5) */}
      <div className="exec-section-fade">
        <ExecutiveActionCenter actionItems={data.actionItems} />
      </div>

      {/* 6. Live Business Audit Stream (Preserved Operational Granularity) */}
      <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4 exec-section-fade">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">Live Business Entry Log</h3>
              <p className="text-xs text-slate-400">Most recent transaction records posted from post offices</p>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div 
            className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-xl self-start sm:self-auto"
            role="tablist"
            aria-label="Activity Feed Type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeActivityTab === 'contributions'}
              onClick={() => setActiveActivityTab('contributions')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeActivityTab === 'contributions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              Account Entries
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeActivityTab === 'insurance'}
              onClick={() => setActiveActivityTab('insurance')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeActivityTab === 'insurance'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Insurance Policies
            </button>
          </div>
        </div>

        {/* Tab 1: Account Contributions */}
        {activeActivityTab === 'contributions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Showing recent 6 account contribution records</span>
              <Link href="/dashboard/contributions" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center">
                All Contributions <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
              <table className="w-full text-left text-xs" aria-label="Recent Account Contributions">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="py-3 px-4">Date</th>
                    <th scope="col" className="py-3 px-4">Official</th>
                    <th scope="col" className="py-3 px-4">Office</th>
                    <th scope="col" className="py-3 px-4">Product</th>
                    <th scope="col" className="py-3 px-4 text-right">Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!data.recentActivity || data.recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No account contributions logged yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentActivity.map((item, idx: number) => (
                      <tr key={item._id ? String(item._id) : `act-${idx}`} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {item.contributionDate
                            ? new Date(item.contributionDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.officialId?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.contributeOffice || item.officialId?.office || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {item.accountType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400 font-mono">
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

        {/* Tab 2: Insurance Policies */}
        {activeActivityTab === 'insurance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Showing recent 6 insurance policy records</span>
              <Link href="/dashboard/insurance" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center">
                All Policies <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
              <table className="w-full text-left text-xs" aria-label="Recent Insurance Policies">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="py-3 px-4">Date</th>
                    <th scope="col" className="py-3 px-4">Official</th>
                    <th scope="col" className="py-3 px-4">Indexing Office</th>
                    <th scope="col" className="py-3 px-4">Type</th>
                    <th scope="col" className="py-3 px-4 text-right">Sum Assured</th>
                    <th scope="col" className="py-3 px-4 text-right">Initial Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!data.recentInsuranceActivity || data.recentInsuranceActivity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No insurance policy entries logged yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentInsuranceActivity.map((item, idx: number) => (
                      <tr key={item._id ? String(item._id) : `ins-${idx}`} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {item.contributionDate
                            ? new Date(item.contributionDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.officialId?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {item.officeOfIndexing || item.officialId?.office || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              item.insuranceType === 'PLI'
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                            }`}
                          >
                            {item.insuranceType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                          {formatCurrencyINR(item.sumAssured || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                          {formatCurrencyINR(item.initialPremium || 0)}
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
  );
}
