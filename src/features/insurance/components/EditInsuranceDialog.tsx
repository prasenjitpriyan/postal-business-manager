'use client';

import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Official } from '@/types/official';
import { InsuranceContribution } from '@/types/insurance';
import { OFFICE_OPTIONS } from '@/constants/offices';

interface EditInsuranceDialogProps {
  contribution: InsuranceContribution;
}

export function EditInsuranceDialog({ contribution }: EditInsuranceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const getOfficialId = (official: string | { _id: string }) => {
    if (typeof official === 'object' && official !== null) return official._id;
    return official || '';
  };

  const getFormData = (data: InsuranceContribution) => ({
    officialId: getOfficialId(data.officialId),
    contributionDate: data.contributionDate
      ? new Date(data.contributionDate).toISOString().split('T')[0]
      : '',
    officeOfIndexing: data.officeOfIndexing || '',
    insuranceType: data.insuranceType || 'PLI',
    sumAssured: data.sumAssured ? String(data.sumAssured) : '',
    initialPremium: data.initialPremium ? String(data.initialPremium) : '',
    remarks: data.remarks || '',
  });

  const [formData, setFormData] = useState(() => getFormData(contribution));

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getFormData(contribution));
    }
    setOpen(newOpen);
  };

  const { data: officialsData, isLoading: isLoadingOfficials } = useQuery({
    queryKey: ['officials', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/officials?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch officials');
      return res.json();
    },
    enabled: open,
  });

  const officials = officialsData?.data?.officials || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        sumAssured: parseFloat(formData.sumAssured),
        initialPremium: parseFloat(formData.initialPremium),
      };

      const res = await fetch(`/api/insurance/${contribution._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update insurance contribution');
      }

      toast.success('Insurance contribution updated successfully!');
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
        onClick={() => handleOpenChange(true)}
        className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
        title="Edit Insurance Record"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md md:max-w-lg bg-slate-950/90 backdrop-blur-md border border-white/10 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-100">
              Edit Insurance Contribution
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="officialId" className="text-sm font-medium text-slate-200">
                Official *
              </label>
              <select
                id="officialId"
                name="officialId"
                required
                value={formData.officialId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select Official</option>
                {isLoadingOfficials ? (
                  <option value="" disabled>Loading officials...</option>
                ) : (
                  officials.map((official: Official) => (
                    <option key={official._id} value={official._id}>
                      {official.name} ({official.designation}) - {official.office}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contributionDate" className="text-sm font-medium text-slate-200">
                  Date of Indexing *
                </label>
                <Input
                  id="contributionDate"
                  name="contributionDate"
                  type="date"
                  required
                  value={formData.contributionDate}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-white/10 text-slate-100 scheme-dark"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="officeOfIndexing" className="text-sm font-medium text-slate-200">
                  Office of Indexing *
                </label>
                <select
                  id="officeOfIndexing"
                  name="officeOfIndexing"
                  required
                  value={formData.officeOfIndexing}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Sub Office</option>
                  {formData.officeOfIndexing && !OFFICE_OPTIONS.some((off) => off.value === formData.officeOfIndexing) && (
                    <option value={formData.officeOfIndexing}>{formData.officeOfIndexing}</option>
                  )}
                  {OFFICE_OPTIONS.map((off) => (
                    <option key={off.code} value={off.value}>
                      {off.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="insuranceType" className="text-sm font-medium text-slate-200">
                Insurance Scheme Type *
              </label>
              <select
                id="insuranceType"
                name="insuranceType"
                required
                value={formData.insuranceType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/80 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-100"
              >
                <option value="PLI">PLI (Postal Life Insurance)</option>
                <option value="RPLI">RPLI (Rural Postal Life Insurance)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sumAssured" className="text-sm font-medium text-slate-200">
                  Sum Assured (₹) *
                </label>
                <Input
                  id="sumAssured"
                  name="sumAssured"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.sumAssured}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-white/10 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="initialPremium" className="text-sm font-medium text-slate-200">
                  Initial Premium (₹) *
                </label>
                <Input
                  id="initialPremium"
                  name="initialPremium"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.initialPremium}
                  onChange={handleChange}
                  className="bg-slate-900/80 border-white/10 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="remarks" className="text-sm font-medium text-slate-200">
                Remarks
              </label>
              <Input
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="bg-slate-900/80 border-white/10 text-slate-100"
              />
            </div>

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
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
              >
                {loading ? 'Updating...' : 'Update Record'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
