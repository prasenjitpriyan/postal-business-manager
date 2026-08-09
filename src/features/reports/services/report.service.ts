import mongoose from 'mongoose';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';

export class ReportService {
  static async getDashboardSummary(startDate?: string, endDate?: string, officeFilter?: string) {
    try {
      const matchStage: Record<string, unknown> = {};
      if (startDate || endDate) {
        matchStage.contributionDate = {};
        if (startDate) (matchStage.contributionDate as Record<string, unknown>).$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          (matchStage.contributionDate as Record<string, unknown>).$lte = end;
        }
      }

      const bizMatchStage = { ...matchStage };
      if (officeFilter && officeFilter !== 'all') {
        bizMatchStage.contributeOffice = officeFilter;
      }

      const insMatchStage = { ...matchStage };
      if (officeFilter && officeFilter !== 'all') {
        insMatchStage.officeOfIndexing = officeFilter;
      }

      const bizPipeline: mongoose.PipelineStage[] = [];
      if (Object.keys(bizMatchStage).length > 0) {
        bizPipeline.push({ $match: bizMatchStage });
      }

      bizPipeline.push({
        $facet: {
          totalAccounts: [
            { $group: { _id: null, sum: { $sum: '$accountsOpened' }, count: { $sum: 1 } } }
          ],
          accountsByType: [
            { $group: { _id: '$accountType', count: { $sum: '$accountsOpened' } } },
            { $sort: { count: -1 } }
          ],
          accountsByOffice: [
            { $group: { _id: '$contributeOffice', count: { $sum: '$accountsOpened' } } },
            { $sort: { count: -1 } },
            { $limit: 15 }
          ],
          accountsByOfficial: [
            { $group: { _id: '$officialId', count: { $sum: '$accountsOpened' } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
            {
              $lookup: {
                from: 'officials',
                localField: '_id',
                foreignField: '_id',
                as: 'official'
              }
            },
            { $unwind: '$official' },
            {
              $project: {
                name: '$official.name',
                office: '$official.office',
                designation: '$official.designation',
                count: 1
              }
            }
          ],
          contributionsOverTime: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$contributionDate" } },
                accounts: { $sum: '$accountsOpened' },
                entries: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          recentContributions: [
            { $sort: { contributionDate: -1, createdAt: -1 } },
            { $limit: 300 },
            {
              $lookup: {
                from: 'officials',
                localField: 'officialId',
                foreignField: '_id',
                as: 'official'
              }
            },
            { $unwind: { path: '$official', preserveNullAndEmptyArrays: true } }
          ]
        }
      });

      const insPipeline: mongoose.PipelineStage[] = [];
      if (Object.keys(insMatchStage).length > 0) {
        insPipeline.push({ $match: insMatchStage });
      }

      insPipeline.push({
        $facet: {
          insuranceSummary: [
            {
              $group: {
                _id: null,
                totalSumAssured: { $sum: '$sumAssured' },
                totalInitialPremium: { $sum: '$initialPremium' },
                totalInsuranceEntries: { $sum: 1 },
                pliCount: { $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] } },
                rpliCount: { $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] } },
                pliSumAssured: { $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, '$sumAssured', 0] } },
                rpliSumAssured: { $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, '$sumAssured', 0] } },
                pliInitialPremium: { $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, '$initialPremium', 0] } },
                rpliInitialPremium: { $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, '$initialPremium', 0] } }
              }
            }
          ],
          insuranceByOffice: [
            {
              $group: {
                _id: '$officeOfIndexing',
                totalSumAssured: { $sum: '$sumAssured' },
                totalInitialPremium: { $sum: '$initialPremium' },
                policies: { $sum: 1 }
              }
            },
            { $sort: { totalSumAssured: -1 } },
            { $limit: 15 }
          ],
          insuranceByOfficial: [
            {
              $group: {
                _id: '$officialId',
                totalSumAssured: { $sum: '$sumAssured' },
                totalInitialPremium: { $sum: '$initialPremium' },
                policies: { $sum: 1 }
              }
            },
            { $sort: { totalSumAssured: -1 } },
            { $limit: 15 },
            {
              $lookup: {
                from: 'officials',
                localField: '_id',
                foreignField: '_id',
                as: 'official'
              }
            },
            { $unwind: '$official' },
            {
              $project: {
                name: '$official.name',
                office: '$official.office',
                designation: '$official.designation',
                totalSumAssured: 1,
                totalInitialPremium: 1,
                policies: 1
              }
            }
          ],
          insuranceOverTime: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$contributionDate" } },
                totalSumAssured: { $sum: '$sumAssured' },
                totalInitialPremium: { $sum: '$initialPremium' },
                policies: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          insuranceSlabs: [
            {
              $bucket: {
                groupBy: '$sumAssured',
                boundaries: [0, 100000, 500000, 1000000, Infinity],
                default: 'Other',
                output: {
                  count: { $sum: 1 },
                  totalSumAssured: { $sum: '$sumAssured' }
                }
              }
            }
          ],
          insuranceContributions: [
            { $sort: { contributionDate: -1, createdAt: -1 } },
            { $limit: 300 },
            {
              $lookup: {
                from: 'officials',
                localField: 'officialId',
                foreignField: '_id',
                as: 'official'
              }
            },
            { $unwind: { path: '$official', preserveNullAndEmptyArrays: true } }
          ]
        }
      });

      const [[[bizResult], [insResult]], availableOffices] = await Promise.all([
        Promise.all([
          BusinessContribution.aggregate(bizPipeline),
          InsuranceContribution.aggregate(insPipeline)
        ]),
        Official.distinct('office')
      ]);

      const totalAccounts = bizResult.totalAccounts[0]?.sum || 0;
      const totalEntries = bizResult.totalAccounts[0]?.count || 0;
      const avgAccountsPerEntry = totalEntries > 0 ? Number((totalAccounts / totalEntries).toFixed(1)) : 0;

      const insSum = insResult.insuranceSummary[0] || {
        totalSumAssured: 0,
        totalInitialPremium: 0,
        totalInsuranceEntries: 0,
        pliCount: 0,
        rpliCount: 0,
        pliSumAssured: 0,
        rpliSumAssured: 0,
        pliInitialPremium: 0,
        rpliInitialPremium: 0
      };

      const slabLabels: Record<string, string> = {
        '0': 'Under ₹1 Lakh',
        '100000': '₹1 Lakh - ₹5 Lakh',
        '500000': '₹5 Lakh - ₹10 Lakh',
        '1000000': 'Above ₹10 Lakh'
      };

      const formattedSlabs = (insResult.insuranceSlabs || []).map((slab: { _id: number; count: number; totalSumAssured: number }) => ({
        slabLabel: slabLabels[String(slab._id)] || `Slab ${slab._id}`,
        count: slab.count,
        totalSumAssured: slab.totalSumAssured
      }));

      // Calculate exact ratio percentages for accountsByType
      const accountsByTypeCalculated = bizResult.accountsByType.map((item: { _id: string; count: number }) => {
        const count = item.count || 0;
        const rawPct = totalAccounts > 0 ? (count / totalAccounts) * 100 : 0;
        const formattedPercentage = rawPct < 0.1 && rawPct > 0 ? '<0.1%' : `${rawPct.toFixed(1)}%`;
        return {
          name: item._id || 'Unspecified',
          value: count,
          percentage: Number(rawPct.toFixed(2)),
          formattedPercentage
        };
      });

      return {
        totalAccounts,
        totalEntries,
        avgAccountsPerEntry,
        availableOffices: (availableOffices || []).sort(),
        accountsByType: accountsByTypeCalculated,
        accountsByOffice: bizResult.accountsByOffice.map((item: { _id: string; count: number }) => ({
          name: item._id || 'Unknown',
          accounts: item.count
        })),
        accountsByOfficial: bizResult.accountsByOfficial.map((item: { name: string; office: string; designation?: string; count: number }) => ({
          name: item.name || 'Unknown',
          office: item.office || '',
          designation: item.designation || '',
          accounts: item.count
        })),
        contributionsOverTime: bizResult.contributionsOverTime.map((item: { _id: string; accounts: number; entries: number }) => ({
          date: item._id,
          accounts: item.accounts,
          entries: item.entries
        })),
        recentContributions: bizResult.recentContributions,
        insuranceSummary: {
          totalSumAssured: insSum.totalSumAssured,
          totalInitialPremium: insSum.totalInitialPremium,
          totalInsuranceEntries: insSum.totalInsuranceEntries,
          pliCount: insSum.pliCount,
          rpliCount: insSum.rpliCount,
          pliSumAssured: insSum.pliSumAssured,
          rpliSumAssured: insSum.rpliSumAssured,
          pliInitialPremium: insSum.pliInitialPremium,
          rpliInitialPremium: insSum.rpliInitialPremium,
          avgSumAssuredPerPolicy: insSum.totalInsuranceEntries > 0 ? Math.round(insSum.totalSumAssured / insSum.totalInsuranceEntries) : 0,
          avgInitialPremiumPerPolicy: insSum.totalInsuranceEntries > 0 ? Math.round(insSum.totalInitialPremium / insSum.totalInsuranceEntries) : 0
        },
        insuranceByOffice: (insResult.insuranceByOffice || []).map((item: { _id: string; totalSumAssured: number; totalInitialPremium: number; policies: number }) => ({
          name: item._id || 'Unknown',
          totalSumAssured: item.totalSumAssured,
          totalInitialPremium: item.totalInitialPremium,
          policies: item.policies
        })),
        insuranceByOfficial: (insResult.insuranceByOfficial || []).map((item: { name: string; office: string; designation?: string; totalSumAssured: number; totalInitialPremium: number; policies: number }) => ({
          name: item.name || 'Unknown',
          office: item.office || '',
          designation: item.designation || '',
          totalSumAssured: item.totalSumAssured,
          totalInitialPremium: item.totalInitialPremium,
          policies: item.policies
        })),
        insuranceOverTime: (insResult.insuranceOverTime || []).map((item: { _id: string; totalSumAssured: number; totalInitialPremium: number; policies: number }) => ({
          date: item._id,
          totalSumAssured: item.totalSumAssured,
          totalInitialPremium: item.totalInitialPremium,
          policies: item.policies
        })),
        insuranceSlabs: formattedSlabs,
        insuranceContributions: insResult.insuranceContributions
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  }
}
