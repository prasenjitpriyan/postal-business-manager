'use client';

import { 
  Zap, 
  Wallet, 
  Target, 
  Award, 
  ShieldCheck, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  ExecutiveTodayStats, 
  ExecutiveMTDStats, 
  ExecutiveTargetSummary, 
  ExecutiveTrendMetric 
} from '@/types/dashboard';
import { formatCurrencyINR, formatNumber } from '@/features/dashboard/utils/formatters';
import { TARGET_STATUS_CONFIG } from '@/constants/targets';

interface ExecutivePulseCardsProps {
  today: ExecutiveTodayStats;
  mtd: ExecutiveMTDStats;
  targetsSummary: ExecutiveTargetSummary;
  pliTrend: ExecutiveTrendMetric;
  rpliTrend: ExecutiveTrendMetric;
  monthRunRatePercentage: number;
}

export function ExecutivePulseCards({
  today,
  mtd,
  targetsSummary,
  pliTrend,
  rpliTrend,
  monthRunRatePercentage,
}: ExecutivePulseCardsProps) {
  // Compute total target sum for display
  const totalTargetUnits =
    (targetsSummary.categories.posb.targetValue || 0) +
    (targetsSummary.categories.pli.targetValue || 0) +
    (targetsSummary.categories.rpli.targetValue || 0);

  const statusConfig = TARGET_STATUS_CONFIG[targetsSummary.status] || TARGET_STATUS_CONFIG['On Track'];

  const pacingDiff = targetsSummary.overallAchievementPercentage - monthRunRatePercentage;
  const isAheadOfRunRate = pacingDiff >= 0;

  return (
    <section aria-label="Key Performance Indicators" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Executive Pulse & Operational KPIs
        </h2>
        <span className="text-[11px] text-slate-500">Real-time live metrics</span>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* CARD 1: TODAY'S BUSINESS */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-indigo-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Today&apos;s Business
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  {formatNumber(today.accountsOpened)}
                </span>
                <span className="text-xs text-slate-400 font-medium">accounts</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Premium: <strong className="text-emerald-400 font-mono">{formatCurrencyINR(today.initialPremium)}</strong>
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Policies: {today.policiesCount}</span>
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              {today.accountsChangeVsYesterday > 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  +{today.accountsChangeVsYesterday}% vs yday
                </span>
              ) : today.accountsChangeVsYesterday < 0 ? (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  {today.accountsChangeVsYesterday}% vs yday
                </span>
              ) : (
                <span className="text-slate-400">Steady vs yday</span>
              )}
            </span>
          </div>
        </div>

        {/* CARD 2: MTD BUSINESS */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-blue-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                MTD Business
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Wallet className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  {formatNumber(mtd.accountsOpened)}
                </span>
                <span className="text-xs text-slate-400 font-medium">accounts</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Premium: <strong className="text-blue-400 font-mono">{formatCurrencyINR(mtd.initialPremium)}</strong>
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{mtd.policiesCount} total policies</span>
            <span className="text-slate-300 font-mono truncate max-w-24" title={formatCurrencyINR(mtd.sumAssured)}>
              Sum: {formatCurrencyINR(mtd.sumAssured)}
            </span>
          </div>
        </div>

        {/* CARD 3: TARGET QUOTA */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-purple-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Target Quota
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Target className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  {totalTargetUnits > 0 ? formatNumber(totalTargetUnits) : '--'}
                </span>
                <span className="text-xs text-slate-400 font-medium">goal units</span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate">
                {targetsSummary.totalTargetsCount > 0 
                  ? `${targetsSummary.totalTargetsCount} allocated quotas`
                  : 'No targets allocated'}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Active Month Scope</span>
            <span className="text-purple-400 font-semibold">
              {totalTargetUnits > 0 ? 'Allocated' : 'Set Quota'}
            </span>
          </div>
        </div>

        {/* CARD 4: ACHIEVEMENT RATE */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-emerald-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Achievement
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl lg:text-3xl font-black tracking-tight font-mono ${statusConfig.textClass}`}>
                  {targetsSummary.overallAchievementPercentage}%
                </span>
                <span className="text-xs text-slate-400 font-medium">achieved</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.badgeClass}`}>
                  {targetsSummary.status === 'Achieved' ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                  ) : targetsSummary.status === 'Critical' ? (
                    <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                  ) : null}
                  {targetsSummary.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Run rate: {monthRunRatePercentage}%</span>
            <span className={isAheadOfRunRate ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {isAheadOfRunRate ? `+${pacingDiff.toFixed(1)}%` : `${pacingDiff.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* CARD 5: PLI KPI (WITH TREND) */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-indigo-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                PLI Portfolio
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  {formatNumber(mtd.pliCount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">policies</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Premium: <strong className="text-indigo-300 font-mono">{formatCurrencyINR(mtd.pliInitialPremium)}</strong>
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono truncate max-w-22" title={formatCurrencyINR(mtd.pliSumAssured)}>
              Sum: {formatCurrencyINR(mtd.pliSumAssured)}
            </span>
            <span className="flex items-center font-semibold">
              {pliTrend.direction === 'increasing' ? (
                <span className="text-emerald-400 flex items-center" title="Weekly momentum increasing">
                  <TrendingUp className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  +{pliTrend.percentage}% WoW
                </span>
              ) : pliTrend.direction === 'decreasing' ? (
                <span className="text-rose-400 flex items-center" title="Weekly momentum decreasing">
                  <TrendingDown className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  -{pliTrend.percentage}% WoW
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  Neutral
                </span>
              )}
            </span>
          </div>
        </div>

        {/* CARD 6: RPLI KPI (WITH TREND) */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900/70 border border-white/10 p-4.5 backdrop-blur-xl hover:border-teal-500/30 transition-colors group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                RPLI Portfolio
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Landmark className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  {formatNumber(mtd.rpliCount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">policies</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Premium: <strong className="text-teal-300 font-mono">{formatCurrencyINR(mtd.rpliInitialPremium)}</strong>
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono truncate max-w-22" title={formatCurrencyINR(mtd.rpliSumAssured)}>
              Sum: {formatCurrencyINR(mtd.rpliSumAssured)}
            </span>
            <span className="flex items-center font-semibold">
              {rpliTrend.direction === 'increasing' ? (
                <span className="text-emerald-400 flex items-center" title="Weekly momentum increasing">
                  <TrendingUp className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  +{rpliTrend.percentage}% WoW
                </span>
              ) : rpliTrend.direction === 'decreasing' ? (
                <span className="text-rose-400 flex items-center" title="Weekly momentum decreasing">
                  <TrendingDown className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  -{rpliTrend.percentage}% WoW
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-3 h-3 mr-0.5" aria-hidden="true" />
                  Neutral
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
