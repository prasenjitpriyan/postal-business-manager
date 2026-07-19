import mongoose from 'mongoose';
import { BusinessContribution } from '@/models/BusinessContribution';

export class ReportService {
  static async getDashboardSummary() {
    try {
      const pipeline = [
        {
          $facet: {
            totalAccounts: [
              { $group: { _id: null, sum: { $sum: '$accountsOpened' } } }
            ],
            accountsByType: [
              { $group: { _id: '$accountType', count: { $sum: '$accountsOpened' } } },
              { $sort: { count: -1 } }
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
                  count: 1
                }
              }
            ],
            recentContributions: [
              { $sort: { contributionDate: -1, createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'officials',
                  localField: 'officialId',
                  foreignField: '_id',
                  as: 'official'
                }
              },
              { $unwind: '$official' }
            ]
          }
        }
      ] as mongoose.PipelineStage[];

      const [result] = await BusinessContribution.aggregate(pipeline);

      return {
        totalAccounts: result.totalAccounts[0]?.sum || 0,
        accountsByType: result.accountsByType.map((item: { _id: string; count: number }) => ({
          name: item._id,
          value: item.count
        })),
        accountsByOfficial: result.accountsByOfficial.map((item: { name: string; count: number }) => ({
          name: item.name,
          accounts: item.count
        })),
        recentContributions: result.recentContributions
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  }
}
