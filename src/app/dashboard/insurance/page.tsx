'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const InsuranceTable = dynamic(
  () => import('@/features/insurance/components/InsuranceTable').then((mod) => mod.InsuranceTable),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 rounded-xl bg-slate-950/40 border border-white/5 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading Insurance Business Table...</p>
      </div>
    ),
  }
);

export default function InsurancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Postal & Rural Postal Life Insurance (PLI / RPLI)
        </h1>
        <p className="text-slate-400 mt-1">
          Track official contributions for PLI and RPLI policies, office of indexing, sum assured, and initial premium.
        </p>
      </div>

      <InsuranceTable />
    </div>
  );
}
