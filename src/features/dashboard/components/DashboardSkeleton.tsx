'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading Executive Dashboard">
      {/* Header Skeleton */}
      <div className="border-b border-white/10 pb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-72 bg-slate-800/80 rounded-xl" />
            <div className="h-4 w-96 bg-slate-800/50 rounded-lg" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-28 bg-slate-800/80 rounded-xl" />
            <div className="h-9 w-32 bg-slate-800/80 rounded-xl" />
            <div className="h-9 w-32 bg-slate-800/80 rounded-xl" />
          </div>
        </div>
        <div className="h-8 w-full bg-slate-900/50 rounded-2xl border border-white/5" />
      </div>

      {/* 6 Pulse Cards Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-48 bg-slate-800/60 rounded-md" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`pulse-skel-${i}`} className="h-36 rounded-2xl bg-slate-900/60 border border-white/5 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-800 rounded" />
                <div className="h-7 w-7 bg-slate-800 rounded-lg" />
              </div>
              <div className="h-7 w-24 bg-slate-800/80 rounded" />
              <div className="h-3 w-28 bg-slate-800/50 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2 Middle Sections Skeleton (Target vs Actual + Business Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-100 rounded-3xl bg-slate-900/60 border border-white/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-slate-800 rounded" />
            <div className="h-5 w-20 bg-slate-800 rounded" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-20 bg-slate-950/60 rounded-2xl" />
            <div className="h-20 bg-slate-950/60 rounded-2xl" />
            <div className="h-20 bg-slate-950/60 rounded-2xl" />
          </div>
        </div>

        <div className="h-100 rounded-3xl bg-slate-900/60 border border-white/5 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-56 bg-slate-800 rounded" />
            <div className="h-7 w-40 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-12 bg-slate-950/40 rounded-xl" />
          <div className="h-60 bg-slate-950/60 rounded-2xl" />
        </div>
      </div>

      {/* Bottom Row Skeleton (Offices + Officials) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-3xl bg-slate-900/60 border border-white/5 p-6 space-y-4">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="h-72 bg-slate-950/50 rounded-2xl" />
        </div>
        <div className="h-96 rounded-3xl bg-slate-900/60 border border-white/5 p-6 space-y-4">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="h-72 bg-slate-950/50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
