import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { OfficialService } from '../services/official.service';
import { Official } from '@/models/Official';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';

vi.mock('@/models/Official', () => ({
  Official: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock('@/models/BusinessContribution', () => ({
  BusinessContribution: {
    exists: vi.fn(),
  },
}));

vi.mock('@/models/InsuranceContribution', () => ({
  InsuranceContribution: {
    exists: vi.fn(),
  },
}));

describe('OfficialService - Referential Integrity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects deletion when official has linked business contributions', async () => {
    const validId = '507f1f77bcf86cd799439011';
    vi.mocked(BusinessContribution.exists).mockResolvedValueOnce({ _id: new Types.ObjectId(validId) });
    vi.mocked(InsuranceContribution.exists).mockResolvedValueOnce(null);

    await expect(OfficialService.deleteOfficial(validId)).rejects.toThrow(
      'Cannot delete official: active account contributions or insurance policy records are linked to this official. Please set status to INACTIVE instead.'
    );
    expect(Official.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('rejects deletion when official has linked insurance records', async () => {
    const validId = '507f1f77bcf86cd799439011';
    vi.mocked(BusinessContribution.exists).mockResolvedValueOnce(null);
    vi.mocked(InsuranceContribution.exists).mockResolvedValueOnce({ _id: new Types.ObjectId(validId) });

    await expect(OfficialService.deleteOfficial(validId)).rejects.toThrow(
      'Cannot delete official: active account contributions or insurance policy records are linked to this official. Please set status to INACTIVE instead.'
    );
    expect(Official.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('allows deletion when no linked records exist', async () => {
    const validId = '507f1f77bcf86cd799439011';
    vi.mocked(BusinessContribution.exists).mockResolvedValueOnce(null);
    vi.mocked(InsuranceContribution.exists).mockResolvedValueOnce(null);
    vi.mocked(Official.findByIdAndDelete).mockResolvedValueOnce({
      _id: new Types.ObjectId(validId),
      name: 'Test Official',
    } as never);

    const result = await OfficialService.deleteOfficial(validId);
    expect(result).toBeDefined();
    expect(Official.findByIdAndDelete).toHaveBeenCalledWith(validId);
  });
});
