'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Loader2 } from 'lucide-react';
import { TargetWithActuals } from '@/types/target';
import { FISCAL_MONTH_OPTIONS } from '@/constants/targets';

interface EditTargetDialogProps {
  target: TargetWithActuals | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditTargetFormProps {
  target: TargetWithActuals;
  onClose: () => void;
}

function EditTargetForm({ target, onClose }: EditTargetFormProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: target.title || '',
    targetValue: target.targetValue || 0,
    month: target.month !== null && target.month !== undefined ? target.month.toString() : '',
    notes: target.notes || '',
  });

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
        targetValue: formData.targetValue,
        month: formData.month ? parseInt(formData.month, 10) : null,
        notes: formData.notes.trim() || undefined,
      };

      const res = await fetch(`/api/targets/${target._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update target');
      }

      toast.success('Target quota updated successfully!');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['targets-summary'] });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-lg bg-slate-950 border border-white/10 text-slate-100 p-6 rounded-2xl shadow-2xl">
      <DialogHeader className="border-b border-white/10 pb-4">
        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
          <Edit2 className="w-5 h-5 text-blue-400" />
          Edit Target Quota
        </DialogTitle>
        <p className="text-xs text-slate-400 mt-1">
          Update target metrics for {target.category} ({target.periodLabel}).
        </p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Campaign / Target Title</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Campaign label"
            className="bg-slate-900 border-white/10 rounded-xl text-white text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Target Quota ({target.metricLabel})
            </label>
            <Input
              type="number"
              name="targetValue"
              required
              min={1}
              value={formData.targetValue}
              onChange={handleChange}
              className="bg-slate-900 border-white/10 rounded-xl text-white font-mono text-base"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Notes / Instructions</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-sm placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
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
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function EditTargetDialog({ target, open, onOpenChange }: EditTargetDialogProps) {
  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditTargetForm key={target._id} target={target} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

