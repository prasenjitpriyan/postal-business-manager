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
import { AlertTriangle, Loader2 } from 'lucide-react';
import { TargetWithActuals } from '@/types/target';

interface DeleteTargetDialogProps {
  target: TargetWithActuals | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTargetDialog({
  target,
  open,
  onOpenChange,
}: DeleteTargetDialogProps) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!target) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/targets/${target._id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete target');
      }

      toast.success('Target quota removed successfully');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['targets-summary'] });
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border border-white/10 text-slate-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-1">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Remove Target Quota?
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Are you sure you want to remove the target for{' '}
            <strong className="text-white">
              {target.category} ({target.metricLabel})
            </strong>{' '}
            for {target.periodLabel}? This will stop tracking against this goal.
          </p>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              'Confirm Removal'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
