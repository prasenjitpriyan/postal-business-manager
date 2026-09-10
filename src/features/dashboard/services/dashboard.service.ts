import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';
import { Target, ITarget } from '@/models/Target';
import { TargetService } from '@/features/targets/services/target.service';
import { FISCAL_MONTH_OPTIONS } from '@/constants/targets';
import { OfficialStatus } from '@/types/official';
import { TargetStatus } from '@/types/target';
import {
  ExecutiveDashboardData,
  ExecutiveTrendMetric,
  ExecutiveTodayStats,
  ExecutiveMTDStats,
  ExecutiveTargetSummary,
  ExecutiveDailyTrendPoint,
  ExecutiveOfficeRanking,
  ExecutiveOfficialAttentionItem,
  ExecutiveActionItem,
  TargetProgressItem,
  RecentContributionActivity,
  RecentInsuranceActivity,
} from '@/types/dashboard';

interface DashboardStatsCache {
  data: ExecutiveDashboardData;
  timestamp: number;
}

let cachedStats: DashboardStatsCache | null = null;
const CACHE_TTL_MS = 30_000;

export function clearDashboardCache() {
  cachedStats = null;
}

function calculateTrend(current: number, previous: number): ExecutiveTrendMetric {
  if (previous === 0 && current === 0) {
    return { direction: 'neutral', percentage: 0, currentPeriodValue: current, previousPeriodValue: previous };
  }
  if (previous === 0 && current > 0) {
    return { direction: 'increasing', percentage: 100, currentPeriodValue: current, previousPeriodValue: previous };
  }
  if (previous > 0 && current === 0) {
    return { direction: 'decreasing', percentage: 100, currentPeriodValue: current, previousPeriodValue: previous };
  }
  const diff = current - previous;
  const pct = Number(Math.abs((diff / previous) * 100).toFixed(1));
  if (diff > 0) {
    return { direction: 'increasing', percentage: pct, currentPeriodValue: current, previousPeriodValue: previous };
  } else if (diff < 0) {
    return { direction: 'decreasing', percentage: pct, currentPeriodValue: current, previousPeriodValue: previous };
  }
  return { direction: 'neutral', percentage: 0, currentPeriodValue: current, previousPeriodValue: previous };
}

export class DashboardService {
  static async getDashboardStats(forceRefresh = false): Promise<ExecutiveDashboardData> {
    if (!forceRefresh && cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL_MS) {
      return cachedStats.data;
    }

    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      const startOfMTD = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysElapsedInMonth = Math.min(now.getDate(), totalDaysInMonth);
      const monthRunRatePercentage = Number(((daysElapsedInMonth / totalDaysInMonth) * 100).toFixed(1));

      // Financial Year and Fiscal Month Calculation (India Post: Month 1 = April ... Month 12 = March)
      const calMonth = now.getMonth(); // 0-11
      const currentFiscalYear =
        calMonth >= 3
          ? `${now.getFullYear()}-${now.getFullYear() + 1}`
          : `${now.getFullYear() - 1}-${now.getFullYear()}`;
      const fiscalMonth = calMonth >= 3 ? calMonth - 2 : calMonth + 10;
      const fiscalMonthConfig = FISCAL_MONTH_OPTIONS.find((m) => m.value === fiscalMonth);
      const currentFiscalMonthLabel = fiscalMonthConfig
        ? fiscalMonthConfig.label.split(' - ')[1]
        : `Month ${fiscalMonth}`;

      // Date ranges for trend analysis (Week-over-week: Last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [
        totalContributions,
        totalOfficials,
        totalAccountsResult,
        topOfficeResult,
        recentActivity,
        topOfficialsResult,
        accountsByTypeResult,
        insuranceSummaryResult,
        recentInsuranceActivity,
        insuranceByTypeResult,
        topInsuranceOfficialsResult,
        topInsuranceOfficesResult,
        // Executive Today Aggregations
        todayAccountsResult,
        yesterdayAccountsResult,
        todayInsuranceResult,
        yesterdayInsuranceResult,
        // Executive MTD Aggregations
        mtdAccountsResult,
        mtdInsuranceResult,
        // Trend Analysis (Last 7 Days vs Previous 7 Days)
        curr7DaysInsurance,
        prev7DaysInsurance,
        curr7DaysAccounts,
        prev7DaysAccounts,
        // 14-day Daily Velocity Timeline
        timelineAccountsResult,
        timelineInsuranceResult,
        // Office Level Performance Aggregations
        officeAccountsResult,
        officeInsuranceResult,
        // Active Officials for Attention Monitoring
        activeOfficialsList,
        mtdOfficialActivity,
        allTimeOfficialLastActivity,
        // Targets for current fiscal cycle
        activeTargetsList,
      ] = await Promise.all([
        BusinessContribution.countDocuments(),
        Official.countDocuments(),
        BusinessContribution.aggregate([
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        BusinessContribution.aggregate([
          { $group: { _id: '$contributeOffice', totalAccounts: { $sum: '$accountsOpened' } } },
          { $sort: { totalAccounts: -1 } },
          { $limit: 1 },
        ]),
        BusinessContribution.find()
          .sort({ contributionDate: -1, createdAt: -1 })
          .limit(6)
          .populate('officialId', 'name office designation')
          .lean(),
        BusinessContribution.aggregate([
          { $group: { _id: '$officialId', totalAccounts: { $sum: '$accountsOpened' } } },
          { $sort: { totalAccounts: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'officials',
              localField: '_id',
              foreignField: '_id',
              as: 'official',
            },
          },
          { $unwind: '$official' },
          {
            $project: {
              name: '$official.name',
              designation: '$official.designation',
              office: '$official.office',
              totalAccounts: 1,
            },
          },
        ]),
        BusinessContribution.aggregate([
          { $group: { _id: '$accountType', count: { $sum: '$accountsOpened' } } },
          { $sort: { count: -1 } },
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: null,
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              totalInsuranceEntries: { $sum: 1 },
              pliCount: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] },
              },
              rpliCount: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] },
              },
            },
          },
        ]),
        InsuranceContribution.find()
          .sort({ contributionDate: -1, createdAt: -1 })
          .limit(6)
          .populate('officialId', 'name office designation')
          .lean(),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$insuranceType',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              count: { $sum: 1 },
            },
          },
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$officialId',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              policies: { $sum: 1 },
            },
          },
          { $sort: { totalSumAssured: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'officials',
              localField: '_id',
              foreignField: '_id',
              as: 'official',
            },
          },
          { $unwind: '$official' },
          {
            $project: {
              name: '$official.name',
              designation: '$official.designation',
              office: '$official.office',
              totalSumAssured: 1,
              totalInitialPremium: 1,
              policies: 1,
            },
          },
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$officeOfIndexing',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              policies: { $sum: 1 },
            },
          },
          { $sort: { totalSumAssured: -1 } },
          { $limit: 5 },
        ]),
        // 1. Today's POSB accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfToday, $lte: endOfToday } } },
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        // 2. Yesterday's POSB accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfYesterday, $lte: endOfYesterday } } },
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        // 3. Today's Insurance
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfToday, $lte: endOfToday } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
        ]),
        // 4. Yesterday's Insurance
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfYesterday, $lte: endOfYesterday } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
        ]),
        // 5. MTD POSB accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfMTD, $lte: endOfToday } } },
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        // 6. MTD Insurance
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfMTD, $lte: endOfToday } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
              pliCount: { $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] } },
              rpliCount: { $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] } },
              pliSumAssured: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, '$sumAssured', 0] },
              },
              rpliSumAssured: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, '$sumAssured', 0] },
              },
              pliInitialPremium: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, '$initialPremium', 0] },
              },
              rpliInitialPremium: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, '$initialPremium', 0] },
              },
            },
          },
        ]),
        // 7. Current 7 Days Insurance
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: sevenDaysAgo, $lte: endOfToday } } },
          {
            $group: {
              _id: '$insuranceType',
              count: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
        ]),
        // 8. Previous 7 Days Insurance (Days -14 to -7)
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
          {
            $group: {
              _id: '$insuranceType',
              count: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
        ]),
        // 9. Current 7 Days Accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: sevenDaysAgo, $lte: endOfToday } } },
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        // 10. Previous 7 Days Accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
        ]),
        // 11. Timeline 14-day Accounts
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: fourteenDaysAgo, $lte: endOfToday } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$contributionDate' } },
              accounts: { $sum: '$accountsOpened' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // 12. Timeline 14-day Insurance
        InsuranceContribution.aggregate([
          { $match: { contributionDate: { $gte: fourteenDaysAgo, $lte: endOfToday } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$contributionDate' } },
              pliPolicies: { $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] } },
              rpliPolicies: { $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] } },
              totalPolicies: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // 13. Office Accounts
        BusinessContribution.aggregate([
          {
            $group: {
              _id: '$contributeOffice',
              accountsOpened: { $sum: '$accountsOpened' },
            },
          },
          { $sort: { accountsOpened: -1 } },
          { $limit: 12 },
        ]),
        // 14. Office Insurance
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$officeOfIndexing',
              policiesCount: { $sum: 1 },
              sumAssured: { $sum: '$sumAssured' },
              initialPremium: { $sum: '$initialPremium' },
            },
          },
          { $sort: { initialPremium: -1 } },
          { $limit: 12 },
        ]),
        // 15. Active Officials List
        Official.find({ status: OfficialStatus.ACTIVE })
          .select('_id name designation office phone email')
          .lean(),
        // 16. MTD Official Activity (Contribution counts this month)
        BusinessContribution.aggregate([
          { $match: { contributionDate: { $gte: startOfMTD, $lte: endOfToday } } },
          { $group: { _id: '$officialId', mtdAccounts: { $sum: '$accountsOpened' } } },
        ]),
        // 17. Most Recent Contribution Date per Official
        BusinessContribution.aggregate([
          {
            $group: {
              _id: '$officialId',
              lastDate: { $max: '$contributionDate' },
            },
          },
        ]),
        // 18. Active Targets in current fiscal cycle
        Target.find({
          financialYear: currentFiscalYear,
          $or: [{ month: fiscalMonth }, { month: null }],
        }).lean(),
      ]);

      // --- 1. Compute Today's Business ---
      const todayAcc = todayAccountsResult[0]?.total || 0;
      const yesterdayAcc = yesterdayAccountsResult[0]?.total || 0;
      const todayIns = todayInsuranceResult[0] || { count: 0, sumAssured: 0, initialPremium: 0 };
      const yesterdayIns = yesterdayInsuranceResult[0] || { count: 0, initialPremium: 0 };

      const accountsChangeVsYesterday =
        yesterdayAcc > 0 ? Number((((todayAcc - yesterdayAcc) / yesterdayAcc) * 100).toFixed(1)) : 0;
      const premiumChangeVsYesterday =
        yesterdayIns.initialPremium > 0
          ? Number(
              (
                ((todayIns.initialPremium - yesterdayIns.initialPremium) /
                  yesterdayIns.initialPremium) *
                100
              ).toFixed(1)
            )
          : 0;

      const todayStats: ExecutiveTodayStats = {
        accountsOpened: todayAcc,
        policiesCount: todayIns.count,
        sumAssured: todayIns.sumAssured,
        initialPremium: todayIns.initialPremium,
        accountsChangeVsYesterday,
        premiumChangeVsYesterday,
      };

      // --- 2. Compute MTD Business ---
      const mtdAcc = mtdAccountsResult[0]?.total || 0;
      const mtdIns = mtdInsuranceResult[0] || {
        count: 0,
        sumAssured: 0,
        initialPremium: 0,
        pliCount: 0,
        rpliCount: 0,
        pliSumAssured: 0,
        rpliSumAssured: 0,
        pliInitialPremium: 0,
        rpliInitialPremium: 0,
      };

      const mtdStats: ExecutiveMTDStats = {
        accountsOpened: mtdAcc,
        policiesCount: mtdIns.count,
        sumAssured: mtdIns.sumAssured,
        initialPremium: mtdIns.initialPremium,
        pliCount: mtdIns.pliCount,
        rpliCount: mtdIns.rpliCount,
        pliSumAssured: mtdIns.pliSumAssured,
        pliInitialPremium: mtdIns.pliInitialPremium,
        rpliSumAssured: mtdIns.rpliSumAssured,
        rpliInitialPremium: mtdIns.rpliInitialPremium,
      };

      // --- 3. Compute Week-Over-Week Momentum (Increasing vs Decreasing) ---
      const currPli = curr7DaysInsurance.find((i) => i._id === 'PLI') || { count: 0, initialPremium: 0 };
      const prevPli = prev7DaysInsurance.find((i) => i._id === 'PLI') || { count: 0, initialPremium: 0 };
      const pliTrend = calculateTrend(currPli.initialPremium, prevPli.initialPremium);

      const currRpli = curr7DaysInsurance.find((i) => i._id === 'RPLI') || { count: 0, initialPremium: 0 };
      const prevRpli = prev7DaysInsurance.find((i) => i._id === 'RPLI') || { count: 0, initialPremium: 0 };
      const rpliTrend = calculateTrend(currRpli.initialPremium, prevRpli.initialPremium);

      const currAccountsCount = curr7DaysAccounts[0]?.total || 0;
      const prevAccountsCount = prev7DaysAccounts[0]?.total || 0;
      const accountsTrend = calculateTrend(currAccountsCount, prevAccountsCount);

      // --- 4. 14-Day Velocity Timeline Data Points ---
      const timelineDateMap = new Map<string, ExecutiveDailyTrendPoint>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const yyyy = d.toISOString().split('T')[0];
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        timelineDateMap.set(yyyy, {
          date: yyyy,
          label,
          accounts: 0,
          pliPolicies: 0,
          rpliPolicies: 0,
          totalPolicies: 0,
          initialPremium: 0,
          sumAssured: 0,
        });
      }

      timelineAccountsResult.forEach((row) => {
        const existing = timelineDateMap.get(row._id);
        if (existing) {
          existing.accounts = row.accounts;
        }
      });

      timelineInsuranceResult.forEach((row) => {
        const existing = timelineDateMap.get(row._id);
        if (existing) {
          existing.pliPolicies = row.pliPolicies;
          existing.rpliPolicies = row.rpliPolicies;
          existing.totalPolicies = row.totalPolicies;
          existing.initialPremium = row.initialPremium;
          existing.sumAssured = row.sumAssured;
        }
      });

      const timelineTrends = Array.from(timelineDateMap.values());

      // --- 5. Target Quota & Target vs Actual Aggregations ---
      let posbTargetVal = 0;
      let pliTargetVal = 0;
      let rpliTargetVal = 0;

      const posbActualVal = mtdAcc;
      const pliActualVal = mtdIns.pliCount;
      const rpliActualVal = mtdIns.rpliCount;

      activeTargetsList.forEach((t: ITarget) => {
        if (t.category === 'POSB') {
          posbTargetVal += t.targetValue || 0;
        } else if (t.category === 'PLI') {
          pliTargetVal += t.targetValue || 0;
        } else if (t.category === 'RPLI') {
          rpliTargetVal += t.targetValue || 0;
        }
      });

      const periodRange = TargetService.getPeriodDateRange(currentFiscalYear, fiscalMonth);

      const posbPacing = TargetService.calculatePacingAndStatus(posbTargetVal, posbActualVal, periodRange);
      const pliPacing = TargetService.calculatePacingAndStatus(pliTargetVal, pliActualVal, periodRange);
      const rpliPacing = TargetService.calculatePacingAndStatus(rpliTargetVal, rpliActualVal, periodRange);

      const posbProgress: TargetProgressItem = {
        category: 'POSB',
        title: 'POSB Accounts',
        metricType: 'ACCOUNTS_COUNT',
        metricLabel: 'Accounts',
        targetValue: posbTargetVal,
        actualValue: posbActualVal,
        achievementPercentage: posbPacing.achievementPercentage,
        remaining: posbPacing.remaining,
        status: posbTargetVal === 0 ? 'On Track' : posbPacing.status,
      };

      const pliProgress: TargetProgressItem = {
        category: 'PLI',
        title: 'Postal Life Insurance (PLI)',
        metricType: 'POLICIES_COUNT',
        metricLabel: 'Policies',
        targetValue: pliTargetVal,
        actualValue: pliActualVal,
        achievementPercentage: pliPacing.achievementPercentage,
        remaining: pliPacing.remaining,
        status: pliTargetVal === 0 ? 'On Track' : pliPacing.status,
      };

      const rpliProgress: TargetProgressItem = {
        category: 'RPLI',
        title: 'Rural Postal Life Insurance (RPLI)',
        metricType: 'POLICIES_COUNT',
        metricLabel: 'Policies',
        targetValue: rpliTargetVal,
        actualValue: rpliActualVal,
        achievementPercentage: rpliPacing.achievementPercentage,
        remaining: rpliPacing.remaining,
        status: rpliTargetVal === 0 ? 'On Track' : rpliPacing.status,
      };

      const targetItems = [posbProgress, pliProgress, rpliProgress].filter((p) => p.targetValue > 0);
      let overallAchievementPercentage = 0;
      let overallStatus: TargetStatus = 'On Track';

      if (targetItems.length > 0) {
        const sumPct = targetItems.reduce((acc, curr) => acc + Math.min(curr.achievementPercentage, 100), 0);
        overallAchievementPercentage = Number((sumPct / targetItems.length).toFixed(1));
        if (targetItems.some((t) => t.status === 'Critical')) {
          overallStatus = 'Critical';
        } else if (targetItems.some((t) => t.status === 'Needs Attention')) {
          overallStatus = 'Needs Attention';
        } else if (targetItems.every((t) => t.status === 'Achieved')) {
          overallStatus = 'Achieved';
        }
      } else if (mtdAcc > 0 || mtdIns.count > 0) {
        overallAchievementPercentage = 100;
        overallStatus = 'On Track';
      }

      const targetsSummary: ExecutiveTargetSummary = {
        totalTargetsCount: activeTargetsList.length,
        overallAchievementPercentage,
        status: overallStatus,
        achievedCount: targetItems.filter((t) => t.status === 'Achieved').length,
        onTrackCount: targetItems.filter((t) => t.status === 'On Track').length,
        needsAttentionCount: targetItems.filter((t) => t.status === 'Needs Attention').length,
        criticalCount: targetItems.filter((t) => t.status === 'Critical').length,
        categories: {
          posb: posbProgress,
          pli: pliProgress,
          rpli: rpliProgress,
        },
      };

      // --- 6. Office Rankings Compilation ---
      const officeMap = new Map<
        string,
        { accounts: number; policies: number; initialPremium: number; sumAssured: number }
      >();

      officeAccountsResult.forEach((item) => {
        const name = (item._id || 'Main Office').trim();
        const cur = officeMap.get(name) || { accounts: 0, policies: 0, initialPremium: 0, sumAssured: 0 };
        cur.accounts += item.accountsOpened || 0;
        officeMap.set(name, cur);
      });

      officeInsuranceResult.forEach((item) => {
        const name = (item._id || 'Main Office').trim();
        const cur = officeMap.get(name) || { accounts: 0, policies: 0, initialPremium: 0, sumAssured: 0 };
        cur.policies += item.policiesCount || 0;
        cur.initialPremium += item.initialPremium || 0;
        cur.sumAssured += item.sumAssured || 0;
        officeMap.set(name, cur);
      });

      const totalOfficeVolume = Array.from(officeMap.values()).reduce(
        (acc, val) => acc + val.accounts + val.policies,
        0
      );

      const officeRankings: ExecutiveOfficeRanking[] = Array.from(officeMap.entries())
        .map(([office, vals]) => {
          const vol = vals.accounts + vals.policies;
          const sharePercentage =
            totalOfficeVolume > 0 ? Number(((vol / totalOfficeVolume) * 100).toFixed(1)) : 0;
          return {
            rank: 1,
            office,
            accountsOpened: vals.accounts,
            policiesCount: vals.policies,
            initialPremium: vals.initialPremium,
            sumAssured: vals.sumAssured,
            sharePercentage,
          };
        })
        .sort((a, b) => b.initialPremium + b.accountsOpened * 100 - (a.initialPremium + a.accountsOpened * 100))
        .map((off, idx) => ({ ...off, rank: idx + 1 }));

      // --- 7. Officials Needing Attention Matrix ---
      const mtdOfficialMap = new Map<string, number>();
      mtdOfficialActivity.forEach((m) => {
        if (m._id) mtdOfficialMap.set(m._id.toString(), m.mtdAccounts);
      });

      const lastActiveMap = new Map<string, Date>();
      allTimeOfficialLastActivity.forEach((m) => {
        if (m._id && m.lastDate) lastActiveMap.set(m._id.toString(), new Date(m.lastDate));
      });

      const officialsNeedingAttention: ExecutiveOfficialAttentionItem[] = [];

      activeOfficialsList.forEach((official: {
        _id: unknown;
        name: string;
        designation: string;
        office: string;
        phone?: string;
        email?: string;
      }) => {
        const offId = String(official._id);
        const mtdAccounts = mtdOfficialMap.get(offId) || 0;
        const lastDate = lastActiveMap.get(offId);

        let daysInactive = 999;
        if (lastDate) {
          daysInactive = Math.max(
            0,
            Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          );
        }

        // Flag official if they have zero contributions in the current MTD or haven't logged in >= 7 days
        if (mtdAccounts === 0 || daysInactive >= 7) {
          let urgency: 'Critical' | 'High' | 'Moderate' = 'Moderate';
          if (daysInactive >= 21 || mtdAccounts === 0 && daysElapsedInMonth >= 15) {
            urgency = 'Critical';
          } else if (daysInactive >= 10 || mtdAccounts === 0) {
            urgency = 'High';
          }

          officialsNeedingAttention.push({
            id: offId,
            name: official.name,
            office: official.office,
            designation: official.designation,
            phone: official.phone,
            email: official.email,
            daysInactive: daysInactive === 999 ? 30 : daysInactive,
            lastContributionDate: lastDate ? lastDate.toISOString() : null,
            mtdAccounts,
            mtdPolicies: 0,
            urgency,
          });
        }
      });

      // Sort by urgency and days inactive
      officialsNeedingAttention.sort((a, b) => {
        const urgencyWeight = { Critical: 3, High: 2, Moderate: 1 };
        return (
          urgencyWeight[b.urgency] * 100 +
          b.daysInactive -
          (urgencyWeight[a.urgency] * 100 + a.daysInactive)
        );
      });

      // --- 8. Executive Action Center Items Generation ---
      const actionItems: ExecutiveActionItem[] = [];

      if (targetsSummary.criticalCount > 0) {
        actionItems.push({
          id: 'action-crit-target',
          title: `${targetsSummary.criticalCount} Target Quota${targetsSummary.criticalCount > 1 ? 's' : ''} at Critical Risk`,
          description: `Current pacing is severely lagging behind the expected ${monthRunRatePercentage}% fiscal month run-rate.`,
          severity: 'critical',
          badge: 'Urgent Intervention',
          actionUrl: '/dashboard/targets',
          actionLabel: 'Review Target Deficits',
        });
      }

      if (officialsNeedingAttention.filter((o) => o.urgency === 'Critical').length > 0) {
        const critCount = officialsNeedingAttention.filter((o) => o.urgency === 'Critical').length;
        actionItems.push({
          id: 'action-crit-officials',
          title: `${critCount} Official${critCount > 1 ? 's' : ''} Inactive for 20+ Days`,
          description: `Sub-divisional officials with zero active logs recorded in the current month require supervisory follow-up.`,
          severity: 'warning',
          badge: 'Staff Alert',
          actionUrl: '/dashboard/officials',
          actionLabel: 'Inspect Official Roster',
        });
      }

      if (pliTrend.direction === 'decreasing') {
        actionItems.push({
          id: 'action-pli-decline',
          title: `PLI Premium Inflow Down -${pliTrend.percentage}% vs Last 7 Days`,
          description: `Weekly insurance momentum has softened. Review pending proposals at indexing offices.`,
          severity: 'warning',
          badge: 'Revenue Velocity',
          actionUrl: '/dashboard/insurance',
          actionLabel: 'View Insurance Proposals',
        });
      } else if (pliTrend.direction === 'increasing') {
        actionItems.push({
          id: 'action-pli-growth',
          title: `PLI Sourcing Accelerating (+${pliTrend.percentage}% this week)`,
          description: `Strong insurance momentum recorded across sub-offices. Ensure timely processing at divisional CPC.`,
          severity: 'success',
          badge: 'Momentum Positive',
          actionUrl: '/dashboard/insurance',
          actionLabel: 'Monitor Policies',
        });
      }

      if (activeTargetsList.length === 0) {
        actionItems.push({
          id: 'action-no-targets',
          title: `No Monthly Quotas Allocated for ${currentFiscalMonthLabel}`,
          description: `Establish division targets for POSB, PLI, and RPLI to enable automated pacing diagnostics.`,
          severity: 'info',
          badge: 'Configuration',
          actionUrl: '/dashboard/targets',
          actionLabel: 'Set Division Targets',
        });
      }

      // Default fallback if no critical alerts
      if (actionItems.length === 0) {
        actionItems.push({
          id: 'action-operational-steady',
          title: `Operations Running Smoothly`,
          description: `All divisional targets and daily contributions are pacing within target operational thresholds.`,
          severity: 'success',
          badge: 'Normal Operations',
          actionUrl: '/dashboard/contributions',
          actionLabel: 'Log Contributions',
        });
      }

      // --- 9. Format backward-compatible fields ---
      const totalAccountsOpened = totalAccountsResult[0]?.total || 0;
      const topOffice = topOfficeResult.length > 0 ? topOfficeResult[0]._id : '--';
      const insSum = insuranceSummaryResult[0] || {
        totalSumAssured: 0,
        totalInitialPremium: 0,
        totalInsuranceEntries: 0,
        pliCount: 0,
        rpliCount: 0,
      };

      const pliData = insuranceByTypeResult.find((i) => i._id === 'PLI') || {
        totalSumAssured: 0,
        totalInitialPremium: 0,
        count: 0,
      };
      const rpliData = insuranceByTypeResult.find((i) => i._id === 'RPLI') || {
        totalSumAssured: 0,
        totalInitialPremium: 0,
        count: 0,
      };

      const fullData: ExecutiveDashboardData = {
        currentFiscalYear,
        currentFiscalMonthLabel,
        daysElapsedInMonth,
        totalDaysInMonth,
        monthRunRatePercentage,

        today: todayStats,
        mtd: mtdStats,
        targetsSummary,
        pliTrend,
        rpliTrend,
        accountsTrend,
        timelineTrends,
        officeRankings,
        officialsNeedingAttention: officialsNeedingAttention.slice(0, 8),
        actionItems,

        // Preserved original stats
        totalContributions,
        totalAccountsOpened,
        totalOfficials,
        topOffice,
        recentActivity: recentActivity as unknown as RecentContributionActivity[],
        topOfficials: topOfficialsResult.map((o) => ({
          id: o._id,
          name: o.name,
          designation: o.designation,
          office: o.office,
          totalAccounts: o.totalAccounts,
        })),
        accountsByType: accountsByTypeResult.map((a) => {
          const count = a.count || 0;
          const pct = totalAccountsOpened > 0 ? (count / totalAccountsOpened) * 100 : 0;
          return {
            type: a._id || 'Other',
            count,
            percentage: Number(pct.toFixed(2)),
            formattedPercentage: pct < 0.1 && pct > 0 ? '<0.1%' : `${pct.toFixed(1)}%`,
          };
        }),
        insuranceStats: {
          totalSumAssured: insSum.totalSumAssured,
          totalInitialPremium: insSum.totalInitialPremium,
          totalInsuranceEntries: insSum.totalInsuranceEntries,
          pliCount: insSum.pliCount,
          rpliCount: insSum.rpliCount,
          pliSumAssured: pliData.totalSumAssured,
          pliInitialPremium: pliData.totalInitialPremium,
          rpliSumAssured: rpliData.totalSumAssured,
          rpliInitialPremium: rpliData.totalInitialPremium,
        },
        topInsuranceOfficials: topInsuranceOfficialsResult.map((o) => ({
          id: o._id,
          name: o.name,
          designation: o.designation,
          office: o.office,
          totalSumAssured: o.totalSumAssured,
          totalInitialPremium: o.totalInitialPremium,
          policies: o.policies,
        })),
        topInsuranceOffices: topInsuranceOfficesResult.map((off) => ({
          office: off._id || 'N/A',
          totalSumAssured: off.totalSumAssured,
          totalInitialPremium: off.totalInitialPremium,
          policies: off.policies,
        })),
        recentInsuranceActivity: recentInsuranceActivity as unknown as RecentInsuranceActivity[],
      };

      cachedStats = {
        data: fullData,
        timestamp: Date.now(),
      };

      return fullData;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}
