'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export function DashboardErrorState({ error, onRetry }: DashboardErrorStateProps) {
  return (
    <div
      role="alert"
      className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12 backdrop-blur-xl"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Failed to Load Executive Telemetry</h2>
        <p className="text-xs text-slate-400">
          {error?.message || 'An unexpected error occurred while connecting to the database.'}
        </p>
      </div>

      <div className="pt-3 flex items-center justify-center gap-3">
        <Button
          onClick={onRetry}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 h-9 rounded-xl shadow-md"
        >
          <RotateCw className="w-4 h-4 mr-1.5" aria-hidden="true" /> Retry Connection
        </Button>
      </div>
    </div>
  );
}
