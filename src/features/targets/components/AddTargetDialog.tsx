'use client';

import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Target as TargetIcon, Loader2 } from 'lucide-react';
import { Official } from '@/types/official';
import { OFFICE_OPTIONS } from '@/constants/offices';
import { POSTAL_ACCOUNT_TYPE_OPTIONS } from '@/constants/accounts';
import {
  FINANCIAL_YEAR_OPTIONS,
  CURRENT_FINANCIAL_YEAR,
  FISCAL_MONTH_OPTIONS,
  TARGET_CATEGORY_OPTIONS,
  METRIC_TYPE_OPTIONS,
} from '@/constants/targets';
import { TargetCategory, MetricType } from '@/types/target';

interface AddTargetDialogProps {
  onSuccess?: () => void;
}

export function AddTargetDialog({ onSuccess }: AddTargetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    financialYear: CURRENT_FINANCIAL_YEAR,
    month: '', // empty means Full Year
    division: 'Kolkata South Division',
    office: '',
    officialId: '',
    category: 'POSB' as TargetCategory,
    metricType: 'ACCOUNTS_COUNT' as MetricType,
    schemeType: 'ALL',
    targetValue: 100,
    notes: '',
  });

  // Fetch officials for optional individual target allocation
  const { data: officialsData, isLoading: isLoadingOfficials } = useQuery({
    queryKey: ['officials', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/officials?limit=500');
      if (!res.ok) throw new Error('Failed to fetch officials');
      return res.json();
    },
    enabled: open,
  });

  const officials = officialsData?.data?.officials || [];

  const handleCategoryChange = (cat: TargetCategory) => {
    let defaultMetric: MetricType = 'ACCOUNTS_COUNT';
    if (cat === 'PLI' || cat === 'RPLI') {
      defaultMetric = 'SUM_ASSURED';
    }
    setFormData((prev) => ({
      ...prev,
      category: cat,
      metricType: defaultMetric,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'targetValue' ? Math.max(1, parseFloat(value) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim() || undefined,
        financialYear: formData.financialYear,
        month: formData.month ? parseInt(formData.month, 10) : null,
        division: formData.division,
        office: formData.office && formData.office !== 'ALL' ? formData.office : undefined,
        officialId: formData.officialId ? formData.officialId : null,
        category: formData.category,
        metricType: formData.metricType,
        schemeType:
          formData.category === 'POSB' && formData.schemeType !== 'ALL'
            ? formData.schemeType
            : undefined,
        targetValue: formData.targetValue,
        notes: formData.notes.trim() || undefined,
      };

      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create target');
      }

      toast.success('Target quota created successfully!');
      setOpen(false);
      setFormData({
        title: '',
        financialYear: CURRENT_FINANCIAL_YEAR,
        month: '',
        division: 'Kolkata South Division',
        office: '',
        officialId: '',
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        schemeType: 'ALL',
        targetValue: 100,
        notes: '',
      });

      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['targets-summary'] });
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create target');
    } finally {
      setLoading(false);
    }
  };

  const availableMetrics = METRIC_TYPE_OPTIONS.filter((m) =>
    m.applicableTo.includes(formData.category)
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl gap-2 shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-4 h-4" />
        Set New Target
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/10 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <TargetIcon className="w-5 h-5 text-blue-400" />
            Set Business Target Quota
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            Establish qualitative performance goals across POSB savings, PLI, or RPLI portfolios.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Campaign Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Campaign / Target Title (Optional)</label>
            <Input
              name="title"
              placeholder="e.g., Special Mahila Samman Mela / Monsoon PLI Drive"
              value={formData.title}
              onChange={handleChange}
              className="bg-slate-900 border-white/10 rounded-xl text-white text-sm"
            />
          </div>

          {/* FY and Month Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Financial Year *</label>
              <select
                name="financialYear"
                required
                value={formData.financialYear}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {FINANCIAL_YEAR_OPTIONS.map((fy) => (
                  <option key={fy.value} value={fy.value}>
                    {fy.label} {fy.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Timeframe</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Full Financial Year</option>
                {FISCAL_MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Portfolio *</label>
            <div className="grid grid-cols-3 gap-2">
              {TARGET_CATEGORY_OPTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.category === cat.value
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-bold">{cat.value}</p>
                  <p className="text-[11px] opacity-75 truncate">{cat.label.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Metric Type and Specific Scheme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Measurement Metric *</label>
              <select
                name="metricType"
                required
                value={formData.metricType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {availableMetrics.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.category === 'POSB' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Savings Scheme Filter</label>
                <select
                  name="schemeType"
                  value={formData.schemeType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Schemes Combined</option>
                  {POSTAL_ACCOUNT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Insurance Division Scope</label>
                <Input
                  value={formData.division}
                  disabled
                  className="bg-slate-900/50 border-white/5 text-slate-400 rounded-xl text-sm"
                />
              </div>
            )}
          </div>

          {/* Target Value Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Target Quota Value *</span>
              {formData.metricType === 'SUM_ASSURED' || formData.metricType === 'INITIAL_PREMIUM' ? (
                <span className="text-blue-400 font-mono text-xs">
                  ₹{Number(formData.targetValue || 0).toLocaleString('en-IN')}
                </span>
              ) : null}
            </label>
            <Input
              type="number"
              name="targetValue"
              required
              min={1}
              value={formData.targetValue}
              onChange={handleChange}
              placeholder="e.g. 50"
              className="bg-slate-900 border-white/10 rounded-xl text-white font-mono text-base"
            />
          </div>

          {/* Office and Official Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Allocated Office (Optional)</label>
              <select
                name="office"
                value={formData.office}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Offices (Divisional)</option>
                {OFFICE_OPTIONS.map((off) => (
                  <option key={off.code} value={off.value}>
                    {off.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Allocated Official (Optional)</label>
              <select
                name="officialId"
                value={formData.officialId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Entire Office / Team Target</option>
                {isLoadingOfficials ? (
                  <option disabled>Loading staff roster...</option>
                ) : (
                  officials.map((off: Official) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.designation})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Operational Notes (Optional)</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Special instructions, incentive guidelines, or review deadlines..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-sm placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.targetValue}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Quota...
                </>
              ) : (
                'Save Target Quota'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>
);
}
