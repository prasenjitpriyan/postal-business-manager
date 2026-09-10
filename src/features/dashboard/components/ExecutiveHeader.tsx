'use client';

import Link from 'next/link';
import { 
  RotateCw, 
  Plus, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  Calendar, 
  Activity,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExecutiveHeaderProps {
  currentFiscalYear: string;
  currentFiscalMonthLabel: string;
  daysElapsedInMonth: number;
  totalDaysInMonth: number;
  monthRunRatePercentage: number;
  isRefetching: boolean;
  onRefresh: () => void;
  lastUpdatedTime: Date | null;
}

export function ExecutiveHeader({
  currentFiscalYear,
  currentFiscalMonthLabel,
  daysElapsedInMonth,
  totalDaysInMonth,
  monthRunRatePercentage,
  isRefetching,
  onRefresh,
  lastUpdatedTime,
}: ExecutiveHeaderProps) {
  const formattedTime = lastUpdatedTime
    ? lastUpdatedTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  return (
    <header className="border-b border-white/10 pb-6 space-y-4" aria-label="Executive Operations Header">
      {/* Top Banner with Title, Metadata, and Primary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" aria-hidden="true" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Executive Operations Dashboard
              </h1>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              India Post Division
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm flex flex-wrap items-center gap-2">
            <span>Operational monitoring for Postal Savings Accounts (POSB) & Insurance Portfolios (PLI/RPLI).</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              FY {currentFiscalYear} ({currentFiscalMonthLabel})
            </span>
          </p>
        </div>

        {/* Sync Status & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Sync indicator with one-click refresh */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline text-slate-400">Synced:</span>
              <strong className="font-mono text-white text-[11px]">{formattedTime}</strong>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefetching}
              aria-label="Refresh Dashboard Data"
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-blue-400' : ''}`} />
            </Button>
          </div>

          {/* Quick Action Buttons */}
          <Link href="/dashboard/contributions">
            <Button 
              size="sm" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 h-9 rounded-xl shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" /> Log Accounts
            </Button>
          </Link>

          <Link href="/dashboard/insurance">
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 h-9 rounded-xl shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" aria-hidden="true" /> PLI / RPLI
            </Button>
          </Link>

          <Link href="/dashboard/targets">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs px-3 h-9 rounded-xl"
            >
              <Target className="w-4 h-4 mr-1.5 text-amber-400" aria-hidden="true" /> Quotas
            </Button>
          </Link>

          <Link href="/dashboard/reports">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10 text-xs px-3 h-9 rounded-xl"
            >
              <BarChart3 className="w-4 h-4 mr-1.5 text-blue-400" aria-hidden="true" /> Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Fiscal Run-Rate Pacing Bar */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/50 border border-white/5 text-xs text-slate-300"
        aria-label="Fiscal Period Progress"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Fiscal Period Benchmark:</span>
          <span>
            {currentFiscalMonthLabel} • Day <strong>{daysElapsedInMonth}</strong> of {totalDaysInMonth}
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400">
            Pacing Run-Rate Baseline: <strong className="text-indigo-400 font-mono">{monthRunRatePercentage}%</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-48">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(2, monthRunRatePercentage))}%` }}
              role="progressbar"
              aria-valuenow={monthRunRatePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Month days elapsed percentage"
            />
          </div>
          <span className="font-mono text-[11px] text-slate-400 shrink-0">{monthRunRatePercentage}%</span>
        </div>
      </div>
    </header>
  );
}
