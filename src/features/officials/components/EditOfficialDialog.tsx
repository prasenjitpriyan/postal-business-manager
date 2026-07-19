'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Official } from '@/types/official';
import { Pencil } from 'lucide-react';

interface EditOfficialDialogProps {
  official: Official;
}

export function EditOfficialDialog({ official }: EditOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: official.name || '',
    designation: official.designation || '',
    office: official.office || '',
    phone: official.phone || '',
    email: official.email || '',
    joiningDate: official.joiningDate ? new Date(official.joiningDate).toISOString().split('T')[0] : '',
    status: official.status || 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/officials/${official._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update official');
      }

      toast.success('Official updated successfully!');
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
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors h-8 w-8"
        title="Edit Official"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Official</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name *</label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="designation" className="text-sm font-medium">Designation *</label>
              <Input id="designation" name="designation" required value={formData.designation} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
            </div>
            <div className="space-y-2">
              <label htmlFor="office" className="text-sm font-medium">Office *</label>
              <Input id="office" name="office" required value={formData.office} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone *</label>
              <Input id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="joiningDate" className="text-sm font-medium">Joining Date *</label>
              <Input id="joiningDate" name="joiningDate" type="date" required value={formData.joiningDate} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-8 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
