'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Award, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveOfficialAttentionItem } from '@/types/dashboard';
import { formatCurrencyINR, formatNumber } from '@/features/dashboard/utils/formatters';

interface TopOfficialItem {
  id?: string;
  name?: string;
  designation?: string;
  office?: string;
  totalAccounts?: number;
}

interface TopInsuranceOfficialItem {
  id?: string;
  name?: string;
  designation?: string;
  office?: string;
  totalSumAssured?: number;
  totalInitialPremium?: number;
  policies?: number;
}

interface OfficialPerformanceSectionProps {
  topOfficials: TopOfficialItem[];
  topInsuranceOfficials: TopInsuranceOfficialItem[];
  officialsNeedingAttention: ExecutiveOfficialAttentionItem[];
}

export function OfficialPerformanceSection({
  topOfficials,
  topInsuranceOfficials,
  officialsNeedingAttention,
}: OfficialPerformanceSectionProps) {
  const [activeTab, setActiveTab] = useState<'attention' | 'top_accounts' | 'top_insurance'>('attention');

  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4">
      {/* Header and Perspective Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">Official Performance & Roster</h3>
            <p className="text-xs text-slate-400">Staff activity monitoring and operational follow-ups</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div 
          className="flex items-center p-1 bg-slate-950/80 border border-white/10 rounded-xl self-start sm:self-auto"
          role="tablist"
          aria-label="Official Performance Perspective"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'attention'}
            onClick={() => setActiveTab('attention')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'attention'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Needs Attention ({officialsNeedingAttention.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'top_accounts'}
            onClick={() => setActiveTab('top_accounts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'top_accounts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            Top Accounts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'top_insurance'}
            onClick={() => setActiveTab('top_insurance')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'top_insurance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Insurance
          </button>
        </div>
      </div>

      {/* TAB 1: OFFICIALS NEEDING ATTENTION */}
      {activeTab === 'attention' && (
        <div className="space-y-3" role="tabpanel" aria-label="Officials Needing Attention">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Staff with zero monthly contributions or extended inactivity:
            </span>
            <Link href="/dashboard/officials" className="text-rose-400 hover:text-rose-300 font-semibold flex items-center">
              Official Roster <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {officialsNeedingAttention.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-80" aria-hidden="true" />
              <p className="text-xs font-semibold text-emerald-300">All Officials Active</p>
              <p className="text-[11px] text-slate-400">Every assigned official has active log activity within expected operational thresholds.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {officialsNeedingAttention.map((official) => (
                <div
                  key={official.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate" title={official.name}>
                        {official.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          official.urgency === 'Critical'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : official.urgency === 'High'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-white/10'
                        }`}
                      >
                        {official.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {official.designation || 'Staff'} • {official.office || 'Office'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {official.daysInactive >= 30 ? '30+ days' : `${official.daysInactive} days`} inactive
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {official.mtdAccounts} accounts this month
                      </p>
                    </div>

                    <Link href={`/dashboard/officials?search=${encodeURIComponent(official.name)}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-200"
                        title={`View ${official.name} in Official Directory`}
                      >
                        Inspect <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOP PERFORMERS (ACCOUNTS) */}
      {activeTab === 'top_accounts' && (
        <div className="space-y-3" role="tabpanel" aria-label="Top Account Performers">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Division leaders in POSB savings accounts opened:</span>
            <Link href="/dashboard/contributions" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center">
              All Contributions <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {topOfficials.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No account performer records available.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {topOfficials.map((off, idx) => (
                <div
                  key={off.id || `acc-off-${idx}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{off.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {off.designation || 'Staff'} • {off.office || 'Office'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-400 font-mono block">
                      {formatNumber(off.totalAccounts || 0)}
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold">accounts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TOP INSURANCE OFFICIALS */}
      {activeTab === 'top_insurance' && (
        <div className="space-y-3" role="tabpanel" aria-label="Insurance Champions">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Division leaders in PLI/RPLI policies & premium:</span>
            <Link href="/dashboard/insurance" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center">
              All Policies <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {topInsuranceOfficials.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">No insurance champions recorded.</p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {topInsuranceOfficials.map((off, idx) => (
                <div
                  key={off.id || `ins-off-${idx}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : idx === 1
                          ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30'
                          : idx === 2
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{off.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {off.office || 'Office'} ({off.policies || 0} policies)
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400 font-mono block">
                      {formatCurrencyINR(off.totalSumAssured || 0)}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Prem: {formatCurrencyINR(off.totalInitialPremium || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
