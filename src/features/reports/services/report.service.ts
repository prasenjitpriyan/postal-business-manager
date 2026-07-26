import mongoose from 'mongoose';
import { BusinessContribution } from '@/models/BusinessContribution';

export class ReportService {
  static async getDashboardSummary(startDate?: string, endDate?: string) {
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

      const pipeline: mongoose.PipelineStage[] = [];
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      pipeline.push({
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
            { $limit: 10 }
          ],
          accountsByOfficial: [
            { $group: { _id: '$officialId', count: { $sum: '$accountsOpened' } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
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
            { $limit: 10 },
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

      const [result] = await BusinessContribution.aggregate(pipeline);

      const totalAccounts = result.totalAccounts[0]?.sum || 0;
      const totalEntries = result.totalAccounts[0]?.count || 0;
      const avgAccountsPerEntry = totalEntries > 0 ? Number((totalAccounts / totalEntries).toFixed(1)) : 0;

      return {
        totalAccounts,
        totalEntries,
        avgAccountsPerEntry,
        accountsByType: result.accountsByType.map((item: { _id: string; count: number }) => ({
          name: item._id || 'Unspecified',
          value: item.count
        })),
        accountsByOffice: result.accountsByOffice.map((item: { _id: string; count: number }) => ({
          name: item._id || 'Unknown',
          accounts: item.count
        })),
        accountsByOfficial: result.accountsByOfficial.map((item: { name: string; office: string; count: number }) => ({
          name: item.name || 'Unknown',
          office: item.office || '',
          accounts: item.count
        })),
        contributionsOverTime: result.contributionsOverTime.map((item: { _id: string; accounts: number; entries: number }) => ({
          date: item._id,
          accounts: item.accounts,
          entries: item.entries
        })),
        recentContributions: result.recentContributions
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  }
}
