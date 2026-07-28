'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ContributionsTable = dynamic(
  () => import('@/features/contributions/components/ContributionsTable').then((mod) => mod.ContributionsTable),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 rounded-xl bg-slate-950/40 border border-white/5 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading Contributions Table...</p>
      </div>
    ),
  }
);

export default function ContributionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Contributions</h1>
        <p className="text-slate-400">Manage daily business contributions from officials.</p>
      </div>
      
      <ContributionsTable />
    </div>
  );
}
