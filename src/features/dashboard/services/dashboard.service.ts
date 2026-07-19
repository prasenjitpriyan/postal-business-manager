import { BusinessContribution } from '@/models/BusinessContribution';
import { Official } from '@/models/Official';

export class DashboardService {
  static async getDashboardStats() {
    try {
      const totalContributions = await BusinessContribution.countDocuments();
      const totalOfficials = await Official.countDocuments();

      const topOfficeResult = await BusinessContribution.aggregate([
        { $group: { _id: '$contributeOffice', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const topOffice = topOfficeResult.length > 0 ? topOfficeResult[0]._id : '--';

      return {
        totalContributions,
        totalOfficials,
        topOffice
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}
