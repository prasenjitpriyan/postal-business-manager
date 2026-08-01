'use client';

import { InsuranceTable } from '@/features/insurance/components/InsuranceTable';

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
