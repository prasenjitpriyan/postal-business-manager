'use client';

import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Official } from '@/types/official';

export function AddContributionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    officialId: '',
    contributionDate: '',
    contributeOffice: '',
    accountType: '',
    accountsOpened: 1,
    remarks: '',
  });

  // Fetch officials for the dropdown
  const { data: officialsData, isLoading: isLoadingOfficials } = useQuery({
    queryKey: ['officials', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/officials?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch officials');
      return res.json();
    },
    enabled: open, // Only fetch when dialog is open
  });

  const officials = officialsData?.data?.officials || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'accountsOpened' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add contribution');
      }

      toast.success('Contribution added successfully!');
      setOpen(false);
      setFormData({
        officialId: '',
        contributionDate: '',
        contributeOffice: '',
        accountType: '',
        accountsOpened: 1,
        remarks: '',
      });
      
      // Invalidate query to refetch data
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-0">
        Add Contribution
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            <div className="space-y-2">
              <label htmlFor="officialId" className="text-sm font-medium">Official *</label>
              <select
                id="officialId"
                name="officialId"
                required
                value={formData.officialId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select Official</option>
                {isLoadingOfficials ? (
                  <option value="" disabled>Loading officials...</option>
                ) : (
                  officials.map((official: Official) => (
                    <option key={official._id} value={official._id}>
                      {official.name} ({official.designation})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contributionDate" className="text-sm font-medium">Date *</label>
                <Input id="contributionDate" name="contributionDate" type="date" required value={formData.contributionDate} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
              </div>
              <div className="space-y-2">
                <label htmlFor="contributeOffice" className="text-sm font-medium">Office *</label>
                <Input id="contributeOffice" name="contributeOffice" required value={formData.contributeOffice} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" placeholder="e.g. BO / SO" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="accountType" className="text-sm font-medium">Account Type *</label>
                <Input id="accountType" name="accountType" required value={formData.accountType} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" placeholder="e.g. SB, RD, TD..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="accountsOpened" className="text-sm font-medium">Accounts Opened *</label>
                <Input id="accountsOpened" name="accountsOpened" type="number" min="1" required value={formData.accountsOpened} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="remarks" className="text-sm font-medium">Remarks</label>
              <Input id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} className="bg-slate-900/50 border-white/10 text-slate-100" placeholder="Optional notes" />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                {loading ? 'Adding...' : 'Add Contribution'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
