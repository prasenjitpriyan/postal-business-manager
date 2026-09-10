'use client';

import Link from 'next/link';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  BellRing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveActionItem } from '@/types/dashboard';

interface ExecutiveActionCenterProps {
  actionItems: ExecutiveActionItem[];
}

export function ExecutiveActionCenter({ actionItems }: ExecutiveActionCenterProps) {
  return (
    <section aria-label="Executive Action Center" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <BellRing className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Action Center & Operational Directives
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {actionItems.length} {actionItems.length === 1 ? 'item requires' : 'items require'} executive review
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {actionItems.map((item) => {
          const isCritical = item.severity === 'critical';
          const isWarning = item.severity === 'warning';
          const isSuccess = item.severity === 'success';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                  : isSuccess
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-slate-900/60 border-white/10 hover:border-indigo-500/30'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : isSuccess
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {isCritical && <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {isWarning && <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {isSuccess && <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {!isCritical && !isWarning && !isSuccess && <Info className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <Link href={item.actionUrl} className="block w-full">
                  <Button
                    size="sm"
                    className={`w-full text-xs font-semibold h-8.5 rounded-xl justify-between ${
                      isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                        : isWarning
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        : isSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
