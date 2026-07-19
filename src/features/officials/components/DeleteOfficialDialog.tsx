'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface DeleteOfficialDialogProps {
  officialId: string;
  officialName: string;
}

export function DeleteOfficialDialog({ officialId, officialName }: DeleteOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/officials/${officialId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete official');
      }

      toast.success('Official deleted successfully!');
      setOpen(false);
      
      // Invalidate query to refetch data
      queryClient.invalidateQueries({ queryKey: ['officials'] });
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
        title="Delete Official"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>Delete Official</DialogTitle>
            <DialogDescription className="mt-2 text-slate-300">
              Are you sure you want to delete <strong>{officialName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white border-0 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
