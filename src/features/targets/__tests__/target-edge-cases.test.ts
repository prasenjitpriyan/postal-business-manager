import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { TargetService } from '../services/target.service';
import { Target } from '@/models/Target';
import { Official } from '@/models/Official';
import { BusinessContribution } from '@/models/BusinessContribution';

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

describe('Target System - Edge Cases & Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Financial Year Boundaries', () => {
    it('handles April 1 to March 31 full financial year boundary', () => {
      const range = TargetService.getPeriodDateRange('2026-2027');
      expect(range.startDate.getUTCFullYear()).toBe(2026);
      expect(range.startDate.getUTCMonth()).toBe(3); // April
      expect(range.startDate.getUTCDate()).toBe(1);

      expect(range.endDate.getUTCFullYear()).toBe(2027);
      expect(range.endDate.getUTCMonth()).toBe(2); // March
      expect(range.endDate.getUTCDate()).toBe(31);
      expect(range.periodLabel).toBe('Full Year (FY 2026-2027)');
    });

    it('handles Month 1 (April) boundary in initial fiscal calendar', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 1);
      expect(range.startDate.getUTCFullYear()).toBe(2026);
      expect(range.startDate.getUTCMonth()).toBe(3); // April
      expect(range.startDate.getUTCDate()).toBe(1);
      expect(range.endDate.getUTCDate()).toBe(30);
      expect(range.totalDays).toBe(30);
    });

    it('handles Month 9 (December) before year transition', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 9);
      expect(range.startDate.getUTCFullYear()).toBe(2026);
      expect(range.startDate.getUTCMonth()).toBe(11); // Dec
      expect(range.endDate.getUTCDate()).toBe(31);
    });

    it('handles Month 10 (January) year-crossing boundary into next calendar year', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 10);
      expect(range.startDate.getUTCFullYear()).toBe(2027);
      expect(range.startDate.getUTCMonth()).toBe(0); // Jan
      expect(range.startDate.getUTCDate()).toBe(1);
      expect(range.endDate.getUTCFullYear()).toBe(2027);
      expect(range.endDate.getUTCDate()).toBe(31);
      expect(range.totalDays).toBe(31);
    });

    it('handles leap year in Month 11 (February 2024 for FY 2023-2024)', () => {
      const range = TargetService.getPeriodDateRange('2023-2024', 11);
      expect(range.startDate.getUTCFullYear()).toBe(2024);
      expect(range.startDate.getUTCMonth()).toBe(1); // Feb
      expect(range.endDate.getUTCDate()).toBe(29); // 2024 was leap year
      expect(range.totalDays).toBe(29);
    });

    it('handles non-leap year in Month 11 (February 2027 for FY 2026-2027)', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 11);
      expect(range.startDate.getUTCFullYear()).toBe(2027);
      expect(range.startDate.getUTCMonth()).toBe(1); // Feb
      expect(range.endDate.getUTCDate()).toBe(28); // 2027 is non-leap year
      expect(range.totalDays).toBe(28);
    });

    it('handles Month 12 (March) final fiscal month boundary', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 12);
      expect(range.startDate.getUTCFullYear()).toBe(2027);
      expect(range.startDate.getUTCMonth()).toBe(2); // Mar
      expect(range.endDate.getUTCDate()).toBe(31);
      expect(range.totalDays).toBe(31);
    });
  });

  describe('Achievement Calculations & Edge Cases', () => {
    const mockPeriod = {
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      totalDays: 365,
      elapsedDays: 180,
      periodLabel: 'Full Year',
    };

    it('handles 0 Target value without division by zero or NaN', () => {
      const result = TargetService.calculatePacingAndStatus(0, 50, mockPeriod);
      expect(result.achievementPercentage).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.status).toBe('Critical');
      expect(Number.isNaN(result.achievementPercentage)).toBe(false);
    });

    it('handles exact 100% achievement', () => {
      const result = TargetService.calculatePacingAndStatus(100, 100, mockPeriod);
      expect(result.status).toBe('Achieved');
      expect(result.achievementPercentage).toBe(100);
      expect(result.remaining).toBe(0);
    });

    it('handles overachievement (e.g. 150% and 250%)', () => {
      const result = TargetService.calculatePacingAndStatus(100, 175, mockPeriod);
      expect(result.status).toBe('Achieved');
      expect(result.achievementPercentage).toBe(175);
      expect(result.remaining).toBe(0);

      const extremeOver = TargetService.calculatePacingAndStatus(50, 200, mockPeriod);
      expect(extremeOver.status).toBe('Achieved');
      expect(extremeOver.achievementPercentage).toBe(400);
      expect(extremeOver.remaining).toBe(0);
    });

    it('handles missing target / target not found in service lookups', async () => {
      const fakeId = new Types.ObjectId().toString();
      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });
      vi.mocked(Target.findById).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.findById>);

      await expect(TargetService.getTargetById(fakeId)).rejects.toThrow('Target not found');
    });
  });

  describe('Target Modification (updateTarget)', () => {
    it('updates target successfully when target exists and official is valid', async () => {
      const targetId = new Types.ObjectId().toString();
      const officialId = new Types.ObjectId().toString();

      vi.mocked(Official.exists).mockResolvedValueOnce({ _id: new Types.ObjectId(officialId) } as unknown as { _id: Types.ObjectId });

      const updatedDoc = {
        _id: new Types.ObjectId(targetId),
        financialYear: '2026-2027',
        month: 2,
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 200,
        officialId: new Types.ObjectId(officialId),
        toObject: function () {
          return {
            _id: this._id,
            financialYear: this.financialYear,
            month: this.month,
            category: this.category,
            metricType: this.metricType,
            targetValue: this.targetValue,
            officialId: this.officialId,
          };
        },
      };

      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(updatedDoc),
      });
      vi.mocked(Target.findByIdAndUpdate).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.findByIdAndUpdate>);

      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([{ total: 100 }]);

      const result = await TargetService.updateTarget(targetId, {
        targetValue: 200,
        officialId,
      });

      expect(Official.exists).toHaveBeenCalled();
      expect(result.targetValue).toBe(200);
      expect(result.actual).toBe(100);
      expect(result.achievementPercentage).toBe(50);
    });

    it('rejects target modification when officialId is provided but official does not exist', async () => {
      const targetId = new Types.ObjectId().toString();
      const missingOfficialId = new Types.ObjectId().toString();

      vi.mocked(Official.exists).mockResolvedValueOnce(null);

      await expect(
        TargetService.updateTarget(targetId, { officialId: missingOfficialId })
      ).rejects.toThrow('Official not found');

      expect(Target.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects target modification when target does not exist', async () => {
      const targetId = new Types.ObjectId().toString();

      const mockPopulate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });
      vi.mocked(Target.findByIdAndUpdate).mockReturnValue({
        populate: mockPopulate,
      } as unknown as ReturnType<typeof Target.findByIdAndUpdate>);

      await expect(
        TargetService.updateTarget(targetId, { targetValue: 300 })
      ).rejects.toThrow('Target not found');
    });

    it('rejects target modification with invalid target ID string', async () => {
      await expect(
        TargetService.updateTarget('not-a-mongo-id', { targetValue: 300 })
      ).rejects.toThrow('Invalid target identifier');
    });
  });
});
