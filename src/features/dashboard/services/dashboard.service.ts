import { BusinessContribution } from '@/models/BusinessContribution';
import { Official } from '@/models/Official';

export class DashboardService {
  static async getDashboardStats() {
    try {
      const totalContributions = await BusinessContribution.countDocuments();
      const totalOfficials = await Official.countDocuments();

      const totalAccountsResult = await BusinessContribution.aggregate([
        { $group: { _id: null, total: { $sum: '$accountsOpened' } } }
      ]);
      const totalAccountsOpened = totalAccountsResult[0]?.total || 0;

      const topOfficeResult = await BusinessContribution.aggregate([
        { $group: { _id: '$contributeOffice', totalAccounts: { $sum: '$accountsOpened' } } },
        { $sort: { totalAccounts: -1 } },
        { $limit: 1 }
      ]);
      const topOffice = topOfficeResult.length > 0 ? topOfficeResult[0]._id : '--';

      const recentActivity = await BusinessContribution.find()
        .sort({ contributionDate: -1, createdAt: -1 })
        .limit(6)
        .populate('officialId', 'name office designation');

      const topOfficialsResult = await BusinessContribution.aggregate([
        { $group: { _id: '$officialId', totalAccounts: { $sum: '$accountsOpened' } } },
        { $sort: { totalAccounts: -1 } },
        { $limit: 5 },
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
            designation: '$official.designation',
            office: '$official.office',
            totalAccounts: 1
          }
        }
      ]);

      const accountsByTypeResult = await BusinessContribution.aggregate([
        { $group: { _id: '$accountType', count: { $sum: '$accountsOpened' } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalContributions,
        totalAccountsOpened,
        totalOfficials,
        topOffice,
        recentActivity,
        topOfficials: topOfficialsResult.map(o => ({
          id: o._id,
          name: o.name,
          designation: o.designation,
          office: o.office,
          totalAccounts: o.totalAccounts
        })),
        accountsByType: accountsByTypeResult.map(a => ({
          type: a._id || 'Other',
          count: a.count
        }))
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}
