import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reports | Postal Business Manager',
  description: 'Analytics and reports for postal business',
};

const ReportsDashboard = dynamic(
  () => import('@/features/reports/components/ReportsDashboard').then((mod) => mod.ReportsDashboard),
  {
    loading: () => (
      <div className="flex flex-col justify-center items-center h-80 space-y-4 rounded-xl bg-slate-950/40 border border-white/5 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading Reports Dashboard...</p>
      </div>
    ),
  }
);

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h2>
        <p className="text-slate-400">
          Visualize performance and track business contributions.
        </p>
      </div>
      
      <ReportsDashboard />
    </div>
  );
}
