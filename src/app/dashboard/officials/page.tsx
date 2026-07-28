'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const OfficialsTable = dynamic(
  () => import('@/features/officials/components/OfficialsTable').then((mod) => mod.OfficialsTable),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 rounded-xl bg-slate-950/40 border border-white/5 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading Officials Table...</p>
      </div>
    ),
  }
);

export default function OfficialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Officials</h1>
        <p className="text-slate-400">Manage all registered officials and their details.</p>
      </div>
      
      <OfficialsTable />
    </div>
  );
}
