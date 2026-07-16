'use client';

import { OfficialsTable } from '@/features/officials/components/OfficialsTable';

export default function OfficialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Officials</h1>
        <p className="text-slate-500">Manage all registered officials and their details.</p>
      </div>
      
      <OfficialsTable />
    </div>
  );
}
