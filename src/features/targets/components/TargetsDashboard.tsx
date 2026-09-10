'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Target as TargetIcon,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  Search,
  RefreshCw,
  Building2,
  User,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/useAuthStore';
import { AddTargetDialog } from './AddTargetDialog';
import { EditTargetDialog } from './EditTargetDialog';
import { DeleteTargetDialog } from './DeleteTargetDialog';
import {
  FINANCIAL_YEAR_OPTIONS,
  CURRENT_FINANCIAL_YEAR,
  FISCAL_MONTH_OPTIONS,
  TARGET_STATUS_CONFIG,
} from '@/constants/targets';
import { TargetWithActuals, TargetCategory, TargetStatus } from '@/types/target';

export function TargetsDashboard() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  const [financialYear, setFinancialYear] = useState<string>(CURRENT_FINANCIAL_YEAR);
  const [month, setMonth] = useState<string>('ALL');
  const [category, setCategory] = useState<TargetCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TargetStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [editingTarget, setEditingTarget] = useState<TargetWithActuals | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<TargetWithActuals | null>(null);

  // Fetch summary stats
  const { data: summaryData, refetch: refetchSummary } = useQuery({
    queryKey: ['targets-summary', financialYear, month],
    queryFn: async () => {
      let url = `/api/targets/summary?financialYear=${financialYear}`;
      if (month !== 'ALL') url += `&month=${month}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch target summary');
      return res.json();
    },
  });

  // Fetch targets list
  const { data: targetsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['targets', financialYear, month, category, statusFilter, search],
    queryFn: async () => {
      let url = `/api/targets?limit=100&financialYear=${financialYear}`;
      if (month !== 'ALL') url += `&month=${month}`;
      if (category !== 'ALL') url += `&category=${category}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch targets');
      return res.json();
    },
  });

  const summary = summaryData?.data || {
    totalTargets: 0,
    achievedCount: 0,
    onTrackCount: 0,
    needsAttentionCount: 0,
    criticalCount: 0,
    overallAchievementPercentage: 0,
  };

  const targets: TargetWithActuals[] = targetsData?.data?.targets || [];

  const handleRefresh = () => {
    refetch();
    refetchSummary();
  };

  const formatValue = (val: number, metricType: string) => {
    if (metricType === 'SUM_ASSURED' || metricType === 'INITIAL_PREMIUM') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(val || 0);
    }
    return Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <TargetIcon className="w-7 h-7 text-blue-400" />
              Target & Achievement Hub
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              India Post Goals
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Monitor divisional quotas, real-time intake velocity, and run-rate pacing across POSB and Insurance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="border-white/10 text-slate-300 hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdmin && <AddTargetDialog onSuccess={handleRefresh} />}
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Targets</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{summary.totalTargets}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg Velocity: <strong className="text-blue-400">{summary.overallAchievementPercentage}%</strong>
          </p>
        </Card>

        <Card className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Achieved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{summary.achievedCount}</p>
          <p className="text-[11px] text-emerald-300/80 mt-1">100%+ Target Fulfilled</p>
        </Card>

        <Card className="bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-blue-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">On Track</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">{summary.onTrackCount}</p>
          <p className="text-[11px] text-blue-300/80 mt-1">Maintaining Run-Rate</p>
        </Card>

        <Card className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Attention</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{summary.needsAttentionCount}</p>
          <p className="text-[11px] text-amber-300/80 mt-1">40% - 74% Achievement</p>
        </Card>

        <Card className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-2xl backdrop-blur-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-rose-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Lag</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">{summary.criticalCount}</p>
          <p className="text-[11px] text-rose-300/80 mt-1">&lt; 40% Deficit Quota</p>
        </Card>
      </div>

      {/* 3. Filter & Controls Ribbon */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* FY Filter */}
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="h-9 px-3 rounded-xl border border-white/10 bg-slate-900 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
          >
            {FINANCIAL_YEAR_OPTIONS.map((fy) => (
              <option key={fy.value} value={fy.value}>
                {fy.label}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 px-3 rounded-xl border border-white/10 bg-slate-900 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Fiscal Months</option>
            {FISCAL_MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Category Tabs */}
          <div className="inline-flex rounded-xl bg-slate-950/60 p-0.5 border border-white/10">
            {(['ALL', 'POSB', 'PLI', 'RPLI'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TargetStatus | 'ALL')}
            className="h-9 px-3 rounded-xl border border-white/10 bg-slate-900 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Achieved">Achieved (100%+)</option>
            <option value="On Track">On Track</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, office, scheme..."
              className="pl-8 h-9 bg-slate-950/60 border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-950/60 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Target Content View (Grid or Table) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : targets.length === 0 ? (
        <Card className="bg-slate-900/30 border border-white/10 p-12 text-center rounded-2xl">
          <TargetIcon className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No Target Quotas Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            No targets have been set matching the selected filters. Establish a new target to monitor
            quota attainment.
          </p>
          {isAdmin && <AddTargetDialog onSuccess={handleRefresh} />}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((t) => {
            const statusConfig = TARGET_STATUS_CONFIG[t.status];
            const officialObj = typeof t.officialId === 'object' && t.officialId !== null ? t.officialId : null;

            return (
              <Card
                key={t._id}
                className={`p-5 rounded-2xl border ${statusConfig.borderClass} ${statusConfig.bgClass} backdrop-blur-xl relative flex flex-col justify-between shadow-xl`}
              >
                <div>
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 border border-white/10">
                        {t.category}
                      </span>
                      {t.schemeType && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {t.schemeType}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t.periodLabel}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badgeClass}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {/* Title & Scope */}
                  <h3 className="text-base font-bold text-white mb-1 leading-snug">
                    {t.title || `${t.category} Quota (${t.metricLabel})`}
                  </h3>

                  <div className="space-y-0.5 text-xs text-slate-400 mb-4">
                    <p className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{t.office || 'Division-wide Target'}</span>
                    </p>
                    {officialObj && (
                      <p className="flex items-center gap-1.5 text-blue-300/90 truncate">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">
                          {officialObj.name} ({officialObj.designation})
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Achievement Pacing</span>
                      <span className={`font-bold font-mono ${statusConfig.textClass}`}>
                        {t.achievementPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 ${statusConfig.progressClass}`}
                        style={{ width: `${Math.min(t.achievementPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Numbers Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-center mb-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Target</p>
                      <p className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                        {formatValue(t.targetValue, t.metricType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Actual</p>
                      <p className={`text-xs font-bold font-mono mt-0.5 truncate ${statusConfig.textClass}`}>
                        {formatValue(t.actual, t.metricType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Remaining</p>
                      <p className="text-xs font-bold text-slate-300 font-mono mt-0.5 truncate">
                        {formatValue(t.remaining, t.metricType)}
                      </p>
                    </div>
                  </div>

                  {t.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-2">
                      &quot;{t.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Card Footer: Admin Actions */}
                {isAdmin && (
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/5 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTarget(t)}
                      className="h-8 text-xs text-slate-400 hover:text-white rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingTarget(t)}
                      className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-300">Category & Timeframe</TableHead>
                <TableHead className="text-slate-300">Target Title & Scope</TableHead>
                <TableHead className="text-right text-slate-300">Target</TableHead>
                <TableHead className="text-right text-slate-300">Actual</TableHead>
                <TableHead className="text-center text-slate-300">Achievement</TableHead>
                <TableHead className="text-center text-slate-300">Status</TableHead>
                {isAdmin && <TableHead className="text-right text-slate-300">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets.map((t) => {
                const statusConfig = TARGET_STATUS_CONFIG[t.status];
                const officialObj =
                  typeof t.officialId === 'object' && t.officialId !== null ? t.officialId : null;

                return (
                  <TableRow key={t._id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-white/10">
                          {t.category}
                        </span>
                        {t.schemeType && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {t.schemeType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{t.periodLabel}</p>
                    </TableCell>

                    <TableCell className="align-middle">
                      <p className="text-sm font-semibold text-white">
                        {t.title || `${t.category} (${t.metricLabel})`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t.office || 'Division-wide'}{' '}
                        {officialObj ? `• ${officialObj.name}` : ''}
                      </p>
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm text-white align-middle">
                      {formatValue(t.targetValue, t.metricType)}
                    </TableCell>

                    <TableCell className="text-right font-mono text-sm font-bold align-middle">
                      <span className={statusConfig.textClass}>
                        {formatValue(t.actual, t.metricType)}
                      </span>
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <span className={`font-mono font-bold text-sm ${statusConfig.textClass}`}>
                        {t.achievementPercentage}%
                      </span>
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badgeClass}`}
                      >
                        {t.status}
                      </span>
                    </TableCell>

                    {isAdmin && (
                      <TableCell className="text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTarget(t)}
                            className="h-8 w-8 text-slate-400 hover:text-white rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingTarget(t)}
                            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit & Delete Dialog Modals */}
      <EditTargetDialog
        target={editingTarget}
        open={Boolean(editingTarget)}
        onOpenChange={(open) => !open && setEditingTarget(null)}
      />

      <DeleteTargetDialog
        target={deletingTarget}
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => !open && setDeletingTarget(null)}
      />
    </div>
  );
}
