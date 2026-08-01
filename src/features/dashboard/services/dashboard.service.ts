import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';

export class DashboardService {
  static async getDashboardStats() {
    try {
      const [
        totalContributions,
        totalOfficials,
        totalAccountsResult,
        topOfficeResult,
        recentActivity,
        topOfficialsResult,
        accountsByTypeResult,
        insuranceSummaryResult,
        recentInsuranceActivity
      ] = await Promise.all([
        BusinessContribution.countDocuments(),
        Official.countDocuments(),
        BusinessContribution.aggregate([
          { $group: { _id: null, total: { $sum: '$accountsOpened' } } }
        ]),
        BusinessContribution.aggregate([
          { $group: { _id: '$contributeOffice', totalAccounts: { $sum: '$accountsOpened' } } },
          { $sort: { totalAccounts: -1 } },
          { $limit: 1 }
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
        ]),
        BusinessContribution.aggregate([
          { $group: { _id: '$accountType', count: { $sum: '$accountsOpened' } } },
          { $sort: { count: -1 } }
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: null,
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              totalInsuranceEntries: { $sum: 1 },
              pliCount: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] }
              },
              rpliCount: {
                $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] }
              }
            }
          }
        ]),
        InsuranceContribution.find()
          .sort({ contributionDate: -1, createdAt: -1 })
          .limit(6)
          .populate('officialId', 'name office designation')
          .lean()
      ]);

      const totalAccountsOpened = totalAccountsResult[0]?.total || 0;
      const topOffice = topOfficeResult.length > 0 ? topOfficeResult[0]._id : '--';
      const insSum = insuranceSummaryResult[0] || {
        totalSumAssured: 0,
        totalInitialPremium: 0,
        totalInsuranceEntries: 0,
        pliCount: 0,
        rpliCount: 0
      };

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
        })),
        insuranceStats: {
          totalSumAssured: insSum.totalSumAssured,
          totalInitialPremium: insSum.totalInitialPremium,
          totalInsuranceEntries: insSum.totalInsuranceEntries,
          pliCount: insSum.pliCount,
          rpliCount: insSum.rpliCount,
        },
        recentInsuranceActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}

