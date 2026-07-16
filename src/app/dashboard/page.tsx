export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of the Business Contribution Management System.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Total Contributions</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">--</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Total Officials</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">--</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Top Office</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">--</p>
        </div>
      </div>
    </div>
  );
}
