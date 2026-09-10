import mongoose from 'mongoose';
import { Target, ITarget } from '@/models/Target';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';
import { User } from '@/models/User';

// Ensure referenced models are registered in Mongoose schema cache for populate()
void Official;
void User;
import {
  GetTargetsQuery,
  TargetDocument,
  TargetWithActuals,
  TargetStatus,
  TargetSummaryStats,
} from '@/types/target';
import { FISCAL_MONTH_OPTIONS } from '@/constants/targets';

function escapeRegex(str: string): string {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function extractOfficialObjectId(officialId: unknown): mongoose.Types.ObjectId | null {
  if (!officialId) return null;
  if (officialId instanceof mongoose.Types.ObjectId) return officialId;
  if (typeof officialId === 'object' && officialId !== null) {
    const record = officialId as { _id?: unknown };
    if (record._id) {
      if (record._id instanceof mongoose.Types.ObjectId) return record._id;
      const idStr = String(record._id);
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        return new mongoose.Types.ObjectId(idStr);
      }
    }
  }
  const str = String(officialId);
  if (mongoose.Types.ObjectId.isValid(str)) {
    return new mongoose.Types.ObjectId(str);
  }
  return null;
}

export interface PeriodDateRange {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  elapsedDays: number;
  periodLabel: string;
}

export class TargetService {
  /**
   * Resolves the exact UTC start and end boundaries for an Indian Financial Year (April 1 to March 31)
   * and optional fiscal month (Month 1 = April ... Month 12 = March).
   */
  static getPeriodDateRange(financialYear: string, month?: number | null): PeriodDateRange {
    const parts = financialYear.split('-');
    const startYear = parseInt(parts[0], 10);
    const endYear = parseInt(parts[1], 10) || startYear + 1;

    let startDate: Date;
    let endDate: Date;
    let periodLabel = `FY ${financialYear}`;

    if (!month || month < 1 || month > 12) {
      // Full Financial Year: April 1 (startYear) to March 31 (endYear)
      startDate = new Date(Date.UTC(startYear, 3, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(endYear, 2, 31, 23, 59, 59, 999));
      periodLabel = `Full Year (FY ${financialYear})`;
    } else {
      const monthConfig = FISCAL_MONTH_OPTIONS.find((m) => m.value === month);
      const monthName = monthConfig ? monthConfig.label.split(' - ')[1] : `Month ${month}`;
      periodLabel = `${monthName} (FY ${financialYear})`;

      // Months 1..9 belong to startYear (April=3 to Dec=11 in JS Date 0-indexed)
      // Months 10..12 belong to endYear (Jan=0 to March=2 in JS Date 0-indexed)
      const calYear = month <= 9 ? startYear : endYear;
      const calMonthIndex = month <= 9 ? month + 2 : month - 10;

      startDate = new Date(Date.UTC(calYear, calMonthIndex, 1, 0, 0, 0, 0));
      // Day 0 of next month is the last day of calMonthIndex
      endDate = new Date(Date.UTC(calYear, calMonthIndex + 1, 0, 23, 59, 59, 999));
    }

    const totalDays = Math.max(
      1,
      Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const now = Date.now();
    let elapsedDays = 0;
    if (now >= endDate.getTime()) {
      elapsedDays = totalDays;
    } else if (now > startDate.getTime()) {
      elapsedDays = Math.max(
        1,
        Math.round((now - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    return { startDate, endDate, totalDays, elapsedDays, periodLabel };
  }

  /**
   * Calculates pacing, remaining delta, achievement percentage, and operational status.
   */
  static calculatePacingAndStatus(
    targetValue: number,
    actualValue: number,
    period: PeriodDateRange
  ): {
    achievementPercentage: number;
    remaining: number;
    status: TargetStatus;
  } {
    const achievementPercentage =
      targetValue > 0 ? Number(((actualValue / targetValue) * 100).toFixed(2)) : 0;
    const remaining = Math.max(0, targetValue - actualValue);

    if (achievementPercentage >= 100) {
      return { achievementPercentage, remaining, status: 'Achieved' };
    }

    const { totalDays, elapsedDays } = period;
    const isPeriodEnded = elapsedDays >= totalDays;

    if (isPeriodEnded) {
      // If the target period has passed and goal is not met
      const status: TargetStatus = achievementPercentage >= 75 ? 'Needs Attention' : 'Critical';
      return { achievementPercentage, remaining, status };
    }

    // Ongoing period: check pacing vs expected elapsed time
    const expectedRunRatePct = (elapsedDays / totalDays) * 100;

    if (achievementPercentage >= expectedRunRatePct * 0.85 || achievementPercentage >= 75) {
      return { achievementPercentage, remaining, status: 'On Track' };
    } else if (achievementPercentage >= expectedRunRatePct * 0.45 || achievementPercentage >= 40) {
      return { achievementPercentage, remaining, status: 'Needs Attention' };
    } else {
      return { achievementPercentage, remaining, status: 'Critical' };
    }
  }

  /**
   * Reuses existing collection structures to compute real-time actual performance for a target.
   */
  static async computeTargetActual(targetDoc: ITarget): Promise<number> {
    const period = this.getPeriodDateRange(targetDoc.financialYear, targetDoc.month);

    if (targetDoc.category === 'POSB') {
      const matchQuery: Record<string, unknown> = {
        contributionDate: { $gte: period.startDate, $lte: period.endDate },
      };

      const officialObjId = extractOfficialObjectId(targetDoc.officialId);
      if (officialObjId) {
        matchQuery.officialId = officialObjId;
      } else if (targetDoc.office && targetDoc.office !== 'ALL') {
        matchQuery.contributeOffice = {
          $regex: escapeRegex(targetDoc.office),
          $options: 'i',
        };
      }

      if (targetDoc.schemeType && targetDoc.schemeType !== 'ALL') {
        matchQuery.accountType = {
          $regex: escapeRegex(targetDoc.schemeType),
          $options: 'i',
        };
      }

      const result = await BusinessContribution.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$accountsOpened' } } },
      ]);

      return result[0]?.total || 0;
    }

    // Category is PLI or RPLI
    const matchQuery: Record<string, unknown> = {
      insuranceType: targetDoc.category,
      contributionDate: { $gte: period.startDate, $lte: period.endDate },
    };

    const officialObjId = extractOfficialObjectId(targetDoc.officialId);
    if (officialObjId) {
      matchQuery.officialId = officialObjId;
    } else if (targetDoc.office && targetDoc.office !== 'ALL') {
      matchQuery.officeOfIndexing = {
        $regex: escapeRegex(targetDoc.office),
        $options: 'i',
      };
    }

    if (targetDoc.metricType === 'POLICIES_COUNT') {
      return await InsuranceContribution.countDocuments(matchQuery);
    }

    if (targetDoc.metricType === 'SUM_ASSURED') {
      const result = await InsuranceContribution.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$sumAssured' } } },
      ]);
      return result[0]?.total || 0;
    }

    if (targetDoc.metricType === 'INITIAL_PREMIUM') {
      const result = await InsuranceContribution.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: '$initialPremium' } } },
      ]);
      return result[0]?.total || 0;
    }

    return 0;
  }

  /**
   * Enriches raw Target documents with real-time actuals, achievement %, remaining, and status.
   */
  static async enrichTarget(targetDoc: ITarget): Promise<TargetWithActuals> {
    const period = this.getPeriodDateRange(targetDoc.financialYear, targetDoc.month);
    const actual = await this.computeTargetActual(targetDoc);
    const { achievementPercentage, remaining, status } = this.calculatePacingAndStatus(
      targetDoc.targetValue,
      actual,
      period
    );

    let metricLabel = 'Accounts';
    if (targetDoc.metricType === 'POLICIES_COUNT') metricLabel = 'Policies';
    else if (targetDoc.metricType === 'SUM_ASSURED') metricLabel = 'Sum Assured (₹)';
    else if (targetDoc.metricType === 'INITIAL_PREMIUM') metricLabel = 'Initial Premium (₹)';

    const plain = (targetDoc.toObject ? targetDoc.toObject() : targetDoc) as TargetDocument;

    return {
      ...plain,
      _id: plain._id.toString(),
      actual,
      achievementPercentage,
      remaining,
      status,
      periodLabel: period.periodLabel,
      metricLabel,
    };
  }

  /**
   * Fetches paginated targets matching query filters, computes actuals in parallel.
   */
  static async getTargets(queryOptions: GetTargetsQuery) {
    const page = Math.max(queryOptions.page || 1, 1);
    const limit = Math.min(Math.max(queryOptions.limit || 10, 1), 100);

    const filter: Record<string, unknown> = {};

    if (queryOptions.financialYear) {
      filter.financialYear = queryOptions.financialYear;
    }

    if (queryOptions.month && queryOptions.month !== 'ALL') {
      filter.month = typeof queryOptions.month === 'number' ? queryOptions.month : parseInt(queryOptions.month, 10);
    }

    if (queryOptions.category && queryOptions.category !== 'ALL') {
      filter.category = queryOptions.category;
    }

    if (queryOptions.office && queryOptions.office !== 'ALL') {
      filter.office = { $regex: escapeRegex(queryOptions.office), $options: 'i' };
    }

    if (queryOptions.officialId) {
      if (mongoose.Types.ObjectId.isValid(queryOptions.officialId)) {
        filter.officialId = new mongoose.Types.ObjectId(queryOptions.officialId);
      }
    }

    if (queryOptions.search) {
      const s = queryOptions.search.trim();
      filter.$or = [
        { title: { $regex: s, $options: 'i' } },
        { office: { $regex: s, $options: 'i' } },
        { schemeType: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (queryOptions.sortArray && queryOptions.sortArray.length > 0) {
      queryOptions.sortArray.forEach((s) => {
        sortObj[s.id] = s.desc ? -1 : 1;
      });
    }

    const [total, targets] = await Promise.all([
      Target.countDocuments(filter),
      Target.find(filter)
        .populate('officialId', 'name designation office')
        .populate('createdBy', 'name email')
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Compute actuals and pacing status for the page results
    let enrichedTargets: TargetWithActuals[] = await Promise.all(
      targets.map((t) => this.enrichTarget(t))
    );

    // If client requested filtering by computed status
    if (queryOptions.status && queryOptions.status !== 'ALL') {
      enrichedTargets = enrichedTargets.filter((t) => t.status === queryOptions.status);
    }

    return {
      targets: enrichedTargets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Fetches single target by ID.
   */
  static async getTargetById(id: string): Promise<TargetWithActuals> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid target identifier');
    }

    const target = await Target.findById(id)
      .populate('officialId', 'name designation office')
      .populate('createdBy', 'name email');

    if (!target) {
      throw new Error('Target not found');
    }

    return await this.enrichTarget(target);
  }

  /**
   * Creates a new target quota.
   */
  static async createTarget(data: Record<string, unknown>): Promise<TargetWithActuals> {
    if (data.officialId) {
      if (!mongoose.Types.ObjectId.isValid(data.officialId as string)) {
        throw new Error('Invalid official identifier');
      }
      const officialExists = await Official.exists({
        _id: new mongoose.Types.ObjectId(data.officialId as string),
      });
      if (!officialExists) {
        throw new Error('Official not found');
      }
    } else {
      data.officialId = null;
    }

    const created = await Target.create(data);
    const populated = await Target.findById(created._id)
      .populate('officialId', 'name designation office')
      .populate('createdBy', 'name email');

    return await this.enrichTarget(populated!);
  }

  /**
   * Updates an existing target quota.
   */
  static async updateTarget(id: string, data: Record<string, unknown>): Promise<TargetWithActuals> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid target identifier');
    }

    if (data.officialId) {
      if (!mongoose.Types.ObjectId.isValid(data.officialId as string)) {
        throw new Error('Invalid official identifier');
      }
      const officialExists = await Official.exists({
        _id: new mongoose.Types.ObjectId(data.officialId as string),
      });
      if (!officialExists) {
        throw new Error('Official not found');
      }
    }

    const updated = await Target.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('officialId', 'name designation office')
      .populate('createdBy', 'name email');

    if (!updated) {
      throw new Error('Target not found');
    }

    return await this.enrichTarget(updated);
  }

  /**
   * Deletes a target quota.
   */
  static async deleteTarget(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid target identifier');
    }

    const deleted = await Target.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error('Target not found');
    }

    return true;
  }

  /**
   * Computes aggregated Target Summary metrics across a financial year / scope.
   */
  static async getTargetsSummary(
    financialYear?: string,
    month?: number | 'ALL',
    office?: string
  ): Promise<TargetSummaryStats> {
    const filter: Record<string, unknown> = {};
    if (financialYear) filter.financialYear = financialYear;
    if (month && month !== 'ALL') {
      filter.month = typeof month === 'number' ? month : parseInt(month, 10);
    }
    if (office && office !== 'ALL') {
      filter.office = { $regex: escapeRegex(office), $options: 'i' };
    }

    const allTargets = await Target.find(filter);
    if (allTargets.length === 0) {
      return {
        totalTargets: 0,
        achievedCount: 0,
        onTrackCount: 0,
        needsAttentionCount: 0,
        criticalCount: 0,
        overallAchievementPercentage: 0,
        posbTargetsCount: 0,
        insuranceTargetsCount: 0,
      };
    }

    const enriched = await Promise.all(allTargets.map((t) => this.enrichTarget(t)));

    let achievedCount = 0;
    let onTrackCount = 0;
    let needsAttentionCount = 0;
    let criticalCount = 0;
    let posbTargetsCount = 0;
    let insuranceTargetsCount = 0;
    let totalPctSum = 0;

    enriched.forEach((t) => {
      totalPctSum += Math.min(t.achievementPercentage, 100);
      if (t.status === 'Achieved') achievedCount++;
      else if (t.status === 'On Track') onTrackCount++;
      else if (t.status === 'Needs Attention') needsAttentionCount++;
      else if (t.status === 'Critical') criticalCount++;

      if (t.category === 'POSB') posbTargetsCount++;
      else insuranceTargetsCount++;
    });

    const overallAchievementPercentage = Number(
      (totalPctSum / enriched.length).toFixed(1)
    );

    return {
      totalTargets: enriched.length,
      achievedCount,
      onTrackCount,
      needsAttentionCount,
      criticalCount,
      overallAchievementPercentage,
      posbTargetsCount,
      insuranceTargetsCount,
    };
  }
}
