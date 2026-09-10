import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { TargetService } from '../services/target.service';
import { Target } from '@/models/Target';
import { Official } from '@/models/Official';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { ITarget } from '@/models/Target';

vi.mock('@/models/Target', () => ({
  Target: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('@/models/Official', () => ({
  Official: {
    exists: vi.fn(),
  },
}));

vi.mock('@/models/BusinessContribution', () => ({
  BusinessContribution: {
    aggregate: vi.fn(),
  },
}));

vi.mock('@/models/InsuranceContribution', () => ({
  InsuranceContribution: {
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}));

describe('TargetService - Unit & Integration Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTarget', () => {
    it('creates a target successfully and validates official when provided', async () => {
      const validOfficialId = '507f1f77bcf86cd799439011';
      vi.mocked(Official.exists).mockResolvedValueOnce({ _id: new Types.ObjectId(validOfficialId) } as unknown as { _id: Types.ObjectId });

      const fakeTargetDoc = {
        _id: new Types.ObjectId('507f191e810c19729de860ea'),
        financialYear: '2026-2027',
        month: 1,
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 50,
        division: 'Kolkata South Division',
        office: 'Alipore H.O',
        officialId: new Types.ObjectId(validOfficialId),
        toObject: function () {
          return {
            _id: this._id,
            financialYear: this.financialYear,
            month: this.month,
            category: this.category,
            metricType: this.metricType,
            targetValue: this.targetValue,
            division: this.division,
            office: this.office,
            officialId: this.officialId,
          };
        },
      };

      vi.mocked(Target.create).mockResolvedValueOnce(fakeTargetDoc as unknown as Awaited<ReturnType<typeof Target.create>>);

      // findById chaining with populate
      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(fakeTargetDoc),
      });
      vi.mocked(Target.findById).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.findById>);

      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([{ total: 25 }]);

      const result = await TargetService.createTarget({
        financialYear: '2026-2027',
        month: 1,
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 50,
        office: 'Alipore H.O',
        officialId: validOfficialId,
      });

      expect(Official.exists).toHaveBeenCalledWith({
        _id: new Types.ObjectId(validOfficialId),
      });
      expect(result.actual).toBe(25);
      expect(result.achievementPercentage).toBe(50);
      expect(result.remaining).toBe(25);
    });

    it('rejects creation when official does not exist', async () => {
      const missingOfficialId = '507f1f77bcf86cd799439012';
      vi.mocked(Official.exists).mockResolvedValueOnce(null);

      await expect(
        TargetService.createTarget({
          financialYear: '2026-2027',
          category: 'POSB',
          metricType: 'ACCOUNTS_COUNT',
          targetValue: 100,
          officialId: missingOfficialId,
        })
      ).rejects.toThrow('Official not found');

      expect(Target.create).not.toHaveBeenCalled();
    });
  });

  describe('computeTargetActual for PLI Insurance', () => {
    it('queries InsuranceContribution for POLICIES_COUNT', async () => {
      vi.mocked(InsuranceContribution.countDocuments).mockResolvedValueOnce(18);

      const targetDoc = {
        category: 'PLI',
        metricType: 'POLICIES_COUNT',
        financialYear: '2026-2027',
        month: 1,
        office: 'Tollygunge S.O',
      } as unknown as ITarget;

      const actual = await TargetService.computeTargetActual(targetDoc);
      expect(actual).toBe(18);
      expect(InsuranceContribution.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getTargetById', () => {
    it('throws error when target does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439013';

      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });
      vi.mocked(Target.findById).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.findById>);

      await expect(TargetService.getTargetById(nonExistentId)).rejects.toThrow('Target not found');
    });

    it('throws error for invalid MongoDB ObjectId', async () => {
      await expect(TargetService.getTargetById('invalid-id-string')).rejects.toThrow(
        'Invalid target identifier'
      );
    });
  });

  describe('deleteTarget', () => {
    it('deletes target successfully', async () => {
      const validId = '507f1f77bcf86cd799439014';
      vi.mocked(Target.findByIdAndDelete).mockResolvedValueOnce({ _id: validId } as unknown as ReturnType<typeof Target.findByIdAndDelete>);

      const deleted = await TargetService.deleteTarget(validId);
      expect(deleted).toBe(true);
      expect(Target.findByIdAndDelete).toHaveBeenCalledWith(validId);
    });

    it('throws when target to delete is not found', async () => {
      const validId = '507f1f77bcf86cd799439014';
      vi.mocked(Target.findByIdAndDelete).mockResolvedValueOnce(null);

      await expect(TargetService.deleteTarget(validId)).rejects.toThrow('Target not found');
    });
  });

  describe('getTargets', () => {
    it('handles populated officialId object without throwing BSON error', async () => {
      const officialObjId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const fakeTargetDoc = {
        _id: new Types.ObjectId('507f191e810c19729de860ea'),
        financialYear: '2026-2027',
        month: 6,
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 100,
        division: 'Kolkata South Division',
        office: 'Bhowanipore S.O',
        // Populated officialId structure as returned by Mongoose
        officialId: {
          _id: officialObjId,
          name: 'Debashis Roy',
          designation: 'Postal Assistant',
          office: 'Bhowanipore S.O',
        },
        toObject: function () {
          return {
            _id: this._id,
            financialYear: this.financialYear,
            month: this.month,
            category: this.category,
            metricType: this.metricType,
            targetValue: this.targetValue,
            division: this.division,
            office: this.office,
            officialId: this.officialId,
          };
        },
      };

      vi.mocked(Target.countDocuments).mockResolvedValueOnce(1);
      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([fakeTargetDoc]),
            }),
          }),
        }),
      });
      vi.mocked(Target.find).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.find>);

      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([{ total: 42 }]);

      const result = await TargetService.getTargets({
        financialYear: '2026-2027',
        limit: 100,
      });

      expect(result.targets).toHaveLength(1);
      expect(result.targets[0].actual).toBe(42);
      expect(result.targets[0].status).toBeDefined();
    });
  });

  describe('getTargetsSummary', () => {
    it('returns empty stats if no targets match filter', async () => {
      vi.mocked(Target.find).mockResolvedValueOnce([]);

      const summary = await TargetService.getTargetsSummary('2026-2027');
      expect(summary.totalTargets).toBe(0);
      expect(summary.achievedCount).toBe(0);
      expect(summary.overallAchievementPercentage).toBe(0);
    });
  });
});

