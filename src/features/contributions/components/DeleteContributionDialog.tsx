'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteContributionDialogProps {
  contributionId: string;
}

export function DeleteContributionDialog({ contributionId }: DeleteContributionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/contributions/${contributionId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete contribution');
      }

      toast.success('Contribution deleted successfully!');
      setOpen(false);

      // Invalidate query to refetch data
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    } catch (error: unknown) {
      toast.error((error as Error).message || 'An error occurred');
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
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors h-8 w-8"
        title="Delete Contribution"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Contribution</DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              Are you sure you want to delete this contribution? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
