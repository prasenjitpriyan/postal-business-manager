import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TargetService } from '../services/target.service';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { ITarget } from '@/models/Target';

vi.mock('@/models/BusinessContribution', () => ({
  BusinessContribution: {
    aggregate: vi.fn(),
  },
}));

vi.mock('@/models/InsuranceContribution', () => ({
  InsuranceContribution: {
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

describe('TargetService - Calculations & Pacing Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPeriodDateRange', () => {
    it('calculates exact UTC boundaries for Full Financial Year (April 1 to March 31)', () => {
      const range = TargetService.getPeriodDateRange('2026-2027');
      expect(range.startDate.toISOString()).toBe('2026-04-01T00:00:00.000Z');
      expect(range.endDate.toISOString()).toBe('2027-03-31T23:59:59.999Z');
      expect(range.periodLabel).toBe('Full Year (FY 2026-2027)');
      expect(range.totalDays).toBeGreaterThanOrEqual(364);
    });

    it('calculates exact UTC boundaries for Fiscal Month 1 (April)', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 1);
      expect(range.startDate.toISOString()).toBe('2026-04-01T00:00:00.000Z');
      expect(range.endDate.toISOString()).toBe('2026-04-30T23:59:59.999Z');
      expect(range.totalDays).toBe(30);
    });

    it('calculates exact UTC boundaries for Fiscal Month 10 (January in next calendar year)', () => {
      const range = TargetService.getPeriodDateRange('2026-2027', 10);
      expect(range.startDate.toISOString()).toBe('2027-01-01T00:00:00.000Z');
      expect(range.endDate.toISOString()).toBe('2027-01-31T23:59:59.999Z');
      expect(range.totalDays).toBe(31);
    });
  });

  describe('calculatePacingAndStatus', () => {
    const mockOngoingPeriod = {
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      totalDays: 365,
      elapsedDays: 180, // ~50% elapsed
      periodLabel: 'Full Year (FY 2026-2027)',
    };

    it('returns "Achieved" with remaining 0 when actual meets or exceeds target', () => {
      const result = TargetService.calculatePacingAndStatus(100, 120, mockOngoingPeriod);
      expect(result.status).toBe('Achieved');
      expect(result.achievementPercentage).toBe(120);
      expect(result.remaining).toBe(0);
    });

    it('returns "On Track" when achievement meets or exceeds required run-rate pacing', () => {
      // 50% time elapsed, actual 55% achieved -> On Track
      const result = TargetService.calculatePacingAndStatus(100, 55, mockOngoingPeriod);
      expect(result.status).toBe('On Track');
      expect(result.achievementPercentage).toBe(55);
      expect(result.remaining).toBe(45);
    });

    it('returns "Needs Attention" when achievement is behind run-rate', () => {
      // 50% time elapsed, actual 28% achieved -> Needs Attention
      const result = TargetService.calculatePacingAndStatus(100, 28, mockOngoingPeriod);
      expect(result.status).toBe('Needs Attention');
      expect(result.achievementPercentage).toBe(28);
      expect(result.remaining).toBe(72);
    });

    it('returns "Critical" when achievement is severely lagging', () => {
      // 50% time elapsed, actual 10% achieved -> Critical
      const result = TargetService.calculatePacingAndStatus(100, 10, mockOngoingPeriod);
      expect(result.status).toBe('Critical');
      expect(result.achievementPercentage).toBe(10);
      expect(result.remaining).toBe(90);
    });
  });

  describe('computeTargetActual', () => {
    it('computes POSB actual accounts by querying BusinessContribution', async () => {
      vi.mocked(BusinessContribution.aggregate).mockResolvedValueOnce([{ _id: null, total: 42 }]);

      const mockTarget = {
        financialYear: '2026-2027',
        month: 1,
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        office: 'Ballygunge SO',
      } as unknown as ITarget;

      const actual = await TargetService.computeTargetActual(mockTarget);
      expect(actual).toBe(42);
      expect(BusinessContribution.aggregate).toHaveBeenCalled();
    });

    it('computes PLI Sum Assured by querying InsuranceContribution', async () => {
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValueOnce([
        { _id: null, total: 1500000 },
      ]);

      const mockTarget = {
        financialYear: '2026-2027',
        category: 'PLI',
        metricType: 'SUM_ASSURED',
      } as unknown as ITarget;

      const actual = await TargetService.computeTargetActual(mockTarget);
      expect(actual).toBe(1500000);
      expect(InsuranceContribution.aggregate).toHaveBeenCalled();
    });

    it('computes PLI Policy Count by counting documents', async () => {
      vi.mocked(InsuranceContribution.countDocuments).mockResolvedValueOnce(18 as never);

      const mockTarget = {
        financialYear: '2026-2027',
        category: 'PLI',
        metricType: 'POLICIES_COUNT',
      } as unknown as ITarget;

      const actual = await TargetService.computeTargetActual(mockTarget);
      expect(actual).toBe(18);
      expect(InsuranceContribution.countDocuments).toHaveBeenCalled();
    });
  });
});
