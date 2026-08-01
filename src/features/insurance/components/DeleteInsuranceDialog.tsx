'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteInsuranceDialogProps {
  id: string;
}

export function DeleteInsuranceDialog({ id }: DeleteInsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insurance/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete insurance entry');
      }

      toast.success('Insurance contribution deleted successfully!');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['insuranceContributions'] });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        title="Delete Record"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-100">
              Delete Insurance Contribution
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-2">
              Are you sure you want to delete this insurance contribution record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white border-0"
            >
              {loading ? 'Deleting...' : 'Delete Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
