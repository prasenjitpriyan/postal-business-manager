'use client';

import { Building2, Award } from 'lucide-react';
import { ExecutiveOfficeRanking } from '@/types/dashboard';
import { formatCurrencyINR, formatNumber } from '@/features/dashboard/utils/formatters';

interface OfficePerformanceTableProps {
  officeRankings: ExecutiveOfficeRanking[];
}

export function OfficePerformanceTable({ officeRankings }: OfficePerformanceTableProps) {
  return (
    <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">Office Performance Leaderboard</h3>
            <p className="text-xs text-slate-400">Rankings across divisional sub & branch post offices</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          {officeRankings.length} Active Offices
        </span>
      </div>

      {officeRankings.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center">
          <Building2 className="w-8 h-8 mb-2 opacity-30" aria-hidden="true" />
          <p>No office contributions logged yet for this cycle.</p>
          <p className="text-[11px] text-slate-600 mt-1">Transactions recorded by officials will populate office rankings.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/40">
          <table className="w-full text-left text-xs" aria-label="Office Performance Table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th scope="col" className="py-3 px-3.5 w-14 text-center">Rank</th>
                <th scope="col" className="py-3 px-4">Post Office</th>
                <th scope="col" className="py-3 px-3.5 text-right">Accounts</th>
                <th scope="col" className="py-3 px-3.5 text-right">Policies</th>
                <th scope="col" className="py-3 px-4 text-right">Initial Premium</th>
                <th scope="col" className="py-3 px-4 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {officeRankings.slice(0, 10).map((office, idx) => {
                const isTop1 = idx === 0;
                const isTop3 = idx < 3;
                return (
                  <tr key={office.office} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                          isTop1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                            : idx === 2
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {office.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-44 sm:max-w-56" title={office.office}>
                          {office.office}
                        </span>
                        {isTop3 && (
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Top 3 Office" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-slate-200">
                      {formatNumber(office.accountsOpened)}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono text-slate-300">
                      {office.policiesCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrencyINR(office.initialPremium)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-slate-300 text-[11px]">{office.sharePercentage}%</span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-white/5 hidden sm:block">
                          <div
                            className="bg-teal-400 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, office.sharePercentage))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
