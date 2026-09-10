'use client';

import Link from 'next/link';
import { Target, ChevronRight, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveTargetSummary, TargetProgressItem } from '@/types/dashboard';
import { TARGET_STATUS_CONFIG } from '@/constants/targets';
import { formatNumber } from '@/features/dashboard/utils/formatters';

interface TargetVsActualSectionProps {
  targetsSummary: ExecutiveTargetSummary;
  monthRunRatePercentage: number;
}

function TargetProgressBar({ item }: { item: TargetProgressItem }) {
  const isTargetSet = item.targetValue > 0;
  const statusCfg = TARGET_STATUS_CONFIG[item.status] || TARGET_STATUS_CONFIG['On Track'];
  const percentage = Math.min(100, Math.max(0, item.achievementPercentage));

  return (
    <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{item.title}</span>
          <span className="text-[10px] text-slate-400">({item.metricLabel})</span>
        </div>
        {isTargetSet ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.badgeClass}`}>
            {item.status === 'Achieved' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" aria-hidden="true" />}
            {item.status === 'Critical' && <AlertTriangle className="w-2.5 h-2.5 mr-1" aria-hidden="true" />}
            {item.status}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/5">
            Quota Open
          </span>
        )}
      </div>

      {/* Target & Actual Numbers */}
      <div className="flex items-baseline justify-between text-xs">
        <div className="space-x-1.5">
          <span className="text-slate-400">Actual:</span>
          <span className="font-bold text-white font-mono">{formatNumber(item.actualValue)}</span>
        </div>
        <div className="space-x-1.5">
          <span className="text-slate-400">Target:</span>
          <span className="font-bold text-indigo-300 font-mono">
            {isTargetSet ? formatNumber(item.targetValue) : 'Not set'}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            item.status === 'Achieved'
              ? 'bg-emerald-500'
              : item.status === 'Critical'
              ? 'bg-rose-500'
              : item.status === 'Needs Attention'
              ? 'bg-amber-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${isTargetSet ? Math.max(3, percentage) : 0}%` }}
          role="progressbar"
          aria-valuenow={isTargetSet ? item.achievementPercentage : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${item.title} achievement progress`}
        />
      </div>

      {/* Bottom Deficit and % */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {isTargetSet ? (
            item.remaining > 0 ? (
              <>Gap: <strong className="text-slate-300 font-mono">{formatNumber(item.remaining)}</strong> remaining</>
            ) : (
              <span className="text-emerald-400 font-semibold">100% Fulfilled</span>
            )
          ) : (
            'Baseline tracking'
          )}
        </span>
        <span className="font-bold text-white font-mono">
          {isTargetSet ? `${item.achievementPercentage}%` : '--'}
        </span>
      </div>
    </div>
  );
}

export function TargetVsActualSection({
  targetsSummary,
  monthRunRatePercentage,
}: TargetVsActualSectionProps) {
  const { posb, pli, rpli } = targetsSummary.categories;
  const hasAllocatedTargets = targetsSummary.totalTargetsCount > 0;

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-5 flex flex-col justify-between">
      <div>
        {/* Header with Title and Link to Target Management */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">Target vs Actual Performance</h3>
              <p className="text-xs text-slate-400">Monthly goal fulfillment across product lines</p>
            </div>
          </div>

          <Link href="/dashboard/targets">
            <Button
              size="sm"
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 text-xs px-2.5 h-8 gap-1"
            >
              All Targets <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Pacing Overview Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Overall Target Pacing:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-mono">
              Expected Run-Rate: <strong>{monthRunRatePercentage}%</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-bold text-white font-mono">
              Achieved: {targetsSummary.overallAchievementPercentage}%
            </span>
          </div>
        </div>

        {/* Target vs Actual Progress Items */}
        <div className="space-y-3 pt-3">
          <TargetProgressBar item={posb} />
          <TargetProgressBar item={pli} />
          <TargetProgressBar item={rpli} />
        </div>
      </div>

      {/* Target Setup Prompt if no targets are set */}
      {!hasAllocatedTargets && (
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <p className="font-bold text-indigo-300">No Target Quotas Configured</p>
            <p className="text-[11px] text-slate-400">Allocate monthly goals for POSB, PLI, and RPLI to track division run-rates.</p>
          </div>
          <Link href="/dashboard/targets">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 rounded-xl shrink-0">
              Set Targets <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
