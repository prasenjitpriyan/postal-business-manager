import { Metadata } from 'next';
import { ReportsDashboard } from '@/features/reports/components/ReportsDashboard';

export const metadata: Metadata = {
  title: 'Reports | Postal Business Manager',
  description: 'Analytics and reports for postal business',
};

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
