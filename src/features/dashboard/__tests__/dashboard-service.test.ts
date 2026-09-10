import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService, clearDashboardCache } from '../services/dashboard.service';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';
import { Target } from '@/models/Target';

vi.mock('@/models/BusinessContribution', () => ({
  BusinessContribution: {
    aggregate: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/models/InsuranceContribution', () => ({
  InsuranceContribution: {
    aggregate: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/models/Official', () => ({
  Official: {
    find: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/models/Target', () => ({
  Target: {
    find: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/features/targets/services/target.service', () => ({
  TargetService: {
    getPeriodDateRange: vi.fn().mockReturnValue({
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      totalDays: 365,
      elapsedDays: 100,
      periodLabel: 'Full Year',
    }),
    computeTargetActual: vi.fn().mockResolvedValue(50),
    calculatePacingAndStatus: vi.fn().mockReturnValue({
      achievementPercentage: 50,
      remaining: 50,
      status: 'On Track',
    }),
  },
}));

interface MockQueryChain {
  sort: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  populate: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  lean: ReturnType<typeof vi.fn>;
}

interface AggStage {
  $match?: {
    contributionDate?: {
      $gte?: Date;
      $lte?: Date;
      $lt?: Date;
    };
  };
  $group?: {
    _id?: unknown;
    total?: unknown;
    lastDate?: unknown;
  };
}

function createMockQuery(result: unknown[] = []): MockQueryChain {
  const query: Partial<MockQueryChain> = {};
  query.sort = vi.fn().mockReturnValue(query);
  query.limit = vi.fn().mockReturnValue(query);
  query.populate = vi.fn().mockReturnValue(query);
  query.select = vi.fn().mockReturnValue(query);
  query.lean = vi.fn().mockResolvedValue(result);
  return query as MockQueryChain;
}

describe('Dashboard Service - State & Data Volume Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDashboardCache();

    vi.mocked(BusinessContribution.find).mockImplementation(() => createMockQuery([]) as never);
    vi.mocked(InsuranceContribution.find).mockImplementation(() => createMockQuery([]) as never);
    vi.mocked(Official.find).mockImplementation(() => createMockQuery([]) as never);
    vi.mocked(Target.find).mockImplementation(() => createMockQuery([]) as never);
  });

  describe('Empty Database State', () => {
    it('handles zero contributions, targets, and policies without NaN or crashing', async () => {
      // All aggregates return empty
      vi.mocked(BusinessContribution.aggregate).mockResolvedValue([]);
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValue([]);

      const stats = await DashboardService.getDashboardStats(true);

      expect(stats.today.accountsOpened).toBe(0);
      expect(stats.today.initialPremium).toBe(0);
      expect(stats.mtd.accountsOpened).toBe(0);
      expect(stats.mtd.sumAssured).toBe(0);
      expect(stats.targetsSummary.totalTargetsCount).toBe(0);
      expect(stats.targetsSummary.overallAchievementPercentage).toBe(0);
      expect(Number.isNaN(stats.targetsSummary.overallAchievementPercentage)).toBe(false);
      expect(stats.officeRankings).toEqual([]);
      expect(stats.officialsNeedingAttention).toEqual([]);
      expect(stats.actionItems.length).toBeGreaterThan(0);
      expect(stats.actionItems[0].title).toBeDefined();
    });
  });

  describe('Error State Handling', () => {
    it('propagates database error when aggregate fails', async () => {
      vi.mocked(BusinessContribution.aggregate).mockRejectedValueOnce(
        new Error('MongoDB cluster unavailable')
      );

      await expect(DashboardService.getDashboardStats(true)).rejects.toThrow(
        'Failed to fetch dashboard stats'
      );
    });
  });

  describe('Normal Operational Data', () => {
    it('computes accurate today, MTD, pacing, and trends with standard operational volumes', async () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const startOfMTD = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      vi.mocked(BusinessContribution.aggregate).mockImplementation((async (pipeline: unknown[]) => {
        const stages = pipeline as AggStage[];
        const firstStage = stages[0] || {};
        const secondStage = stages[1] || {};

        if (firstStage.$match) {
          const d = firstStage.$match.contributionDate;
          if (d?.$gte?.getTime?.() === startOfToday.getTime()) {
            return [{ total: 15 }];
          }
          if (d?.$lte && d.$lte.getTime() < startOfToday.getTime()) {
            // Yesterday
            return [{ total: 10 }];
          }
          if (d?.$gte?.getTime?.() === startOfMTD.getTime()) {
            if (secondStage.$group?._id === '$officialId') {
              return [{ _id: 'off-1', mtdAccounts: 80 }];
            }
            return [{ total: 250 }];
          }
          if (typeof secondStage.$group?._id === 'object') {
            return [{ _id: '2026-09-08', accounts: 25 }];
          }
          // 7-day windows
          return [{ total: 60 }];
        }

        if (firstStage.$group?._id === '$contributeOffice') {
          return [
            { _id: 'Alipore HO', accountsOpened: 150, totalAccounts: 150 },
            { _id: 'Ballygunge SO', accountsOpened: 100, totalAccounts: 100 },
          ];
        }

        if (firstStage.$group?._id === '$officialId') {
          if (firstStage.$group?.lastDate) {
            return [{ _id: 'off-1', lastDate: new Date('2026-09-08') }];
          }
          return [{ _id: 'off-1', totalAccounts: 80 }];
        }

        if (firstStage.$group?.total) {
          return [{ total: 250 }];
        }

        return [];
      }) as never);

      vi.mocked(InsuranceContribution.aggregate).mockImplementation((async (pipeline: unknown[]) => {
        const stages = pipeline as AggStage[];
        const firstStage = stages[0] || {};
        if (firstStage.$match) {
          const d = firstStage.$match.contributionDate;
          if (d?.$gte?.getTime?.() === startOfToday.getTime()) {
            return [{ count: 3, sumAssured: 300000, initialPremium: 6000 }];
          }
          if (d?.$lte && d.$lte.getTime() < startOfToday.getTime()) {
            return [{ count: 2, sumAssured: 200000, initialPremium: 4000 }];
          }
          if (d?.$gte?.getTime?.() === startOfMTD.getTime()) {
            return [{
              count: 45,
              sumAssured: 4500000,
              initialPremium: 90000,
              pliCount: 30,
              rpliCount: 15,
              pliSumAssured: 3000000,
              pliInitialPremium: 60000,
              rpliSumAssured: 1500000,
              rpliInitialPremium: 30000,
            }];
          }
          // Trend: current 7 days vs previous 7 days
          if (d?.$gte && !d?.$lt) {
            return [
              { _id: 'PLI', count: 15, sumAssured: 1500000, initialPremium: 35000 },
              { _id: 'RPLI', count: 8, sumAssured: 800000, initialPremium: 18000 },
            ];
          }
          if (d?.$lt) {
            return [
              { _id: 'PLI', count: 10, sumAssured: 1000000, initialPremium: 20000 },
              { _id: 'RPLI', count: 5, sumAssured: 500000, initialPremium: 10000 },
            ];
          }
          return [];
        }

        if (firstStage.$group?._id === '$officeOfIndexing') {
          return [
            { _id: 'Alipore HO', policiesCount: 30, sumAssured: 3000000, initialPremium: 60000 },
          ];
        }

        if (firstStage.$group?.total) {
          return [{
            totalSumAssured: 4500000,
            totalInitialPremium: 90000,
            totalInsuranceEntries: 45,
            pliCount: 30,
            rpliCount: 15,
          }];
        }

        return [];
      }) as never);

      vi.mocked(Official.find).mockImplementation(
        () => createMockQuery([
          { _id: 'off-1', name: 'Alok Sen', designation: 'PA', office: 'Alipore HO' },
        ]) as never
      );

      const stats = await DashboardService.getDashboardStats(true);

      expect(stats.today.accountsOpened).toBe(15);
      expect(stats.today.initialPremium).toBe(6000);
      expect(stats.mtd.accountsOpened).toBe(250);
      expect(stats.mtd.initialPremium).toBe(90000);
      expect(stats.mtd.pliCount).toBe(30);
      expect(stats.mtd.rpliCount).toBe(15);
      expect(stats.pliTrend.direction).toBe('increasing');
      expect(stats.rpliTrend.direction).toBe('increasing');
    });
  });

  describe('Large Datasets Performance & Sorting', () => {
    it('handles and ranks large office arrays correctly', async () => {
      // Simulate 50 offices in POSB aggregate
      const largeOfficeList = Array.from({ length: 50 }, (_, i) => ({
        _id: `Post Office Branch ${i + 1}`,
        accountsOpened: (50 - i) * 10,
        totalAccounts: (50 - i) * 10,
      }));

      vi.mocked(BusinessContribution.aggregate).mockImplementation(((pipeline: unknown[]) => {
        const stages = pipeline as AggStage[];
        const firstStage = stages[0] || {};
        if (firstStage.$group?._id === '$contributeOffice') {
          return Promise.resolve(largeOfficeList);
        }
        return Promise.resolve([]);
      }) as never);

      vi.mocked(InsuranceContribution.aggregate).mockResolvedValue([]);

      const stats = await DashboardService.getDashboardStats(true);

      // Verify all 50 offices are ranked descending by volume with proper ranks
      expect(stats.officeRankings.length).toBe(50);
      expect(stats.officeRankings[0].rank).toBe(1);
      expect(stats.officeRankings[49].rank).toBe(50);
      expect(stats.officeRankings[0].accountsOpened).toBeGreaterThan(
        stats.officeRankings[1].accountsOpened
      );
    });
  });

  describe('Cache Behavior', () => {
    it('returns cached data within TTL when forceRefresh is false', async () => {
      vi.mocked(BusinessContribution.aggregate).mockResolvedValue([{ total: 99 }]);
      vi.mocked(InsuranceContribution.aggregate).mockResolvedValue([]);

      const firstCall = await DashboardService.getDashboardStats(false);
      expect(firstCall).toBeDefined();

      // Second call should return cached object without querying database again
      const secondCall = await DashboardService.getDashboardStats(false);
      expect(secondCall).toBe(firstCall);
    });
  });
});
