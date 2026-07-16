'use client';

import { ContributionsTable } from '@/features/contributions/components/ContributionsTable';

export default function ContributionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contributions</h1>
        <p className="text-slate-500">Manage daily business contributions from officials.</p>
      </div>
      
      <ContributionsTable />
    </div>
  );
}
