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
        recentInsuranceActivity,
        insuranceByTypeResult,
        topInsuranceOfficialsResult,
        topInsuranceOfficesResult
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
          .lean(),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$insuranceType',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              count: { $sum: 1 }
            }
          }
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$officialId',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              policies: { $sum: 1 }
            }
          },
          { $sort: { totalSumAssured: -1 } },
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
              totalSumAssured: 1,
              totalInitialPremium: 1,
              policies: 1
            }
          }
        ]),
        InsuranceContribution.aggregate([
          {
            $group: {
              _id: '$officeOfIndexing',
              totalSumAssured: { $sum: '$sumAssured' },
              totalInitialPremium: { $sum: '$initialPremium' },
              policies: { $sum: 1 }
            }
          },
          { $sort: { totalSumAssured: -1 } },
          { $limit: 5 }
        ])
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

      const pliData = insuranceByTypeResult.find(i => i._id === 'PLI') || { totalSumAssured: 0, totalInitialPremium: 0, count: 0 };
      const rpliData = insuranceByTypeResult.find(i => i._id === 'RPLI') || { totalSumAssured: 0, totalInitialPremium: 0, count: 0 };

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
        accountsByType: accountsByTypeResult.map(a => {
          const count = a.count || 0;
          const pct = totalAccountsOpened > 0 ? (count / totalAccountsOpened) * 100 : 0;
          return {
            type: a._id || 'Other',
            count,
            percentage: Number(pct.toFixed(2)),
            formattedPercentage: pct < 0.1 && pct > 0 ? '<0.1%' : `${pct.toFixed(1)}%`
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
        topInsuranceOfficials: topInsuranceOfficialsResult.map(o => ({
          id: o._id,
          name: o.name,
          designation: o.designation,
          office: o.office,
          totalSumAssured: o.totalSumAssured,
          totalInitialPremium: o.totalInitialPremium,
          policies: o.policies
        })),
        topInsuranceOffices: topInsuranceOfficesResult.map(off => ({
          office: off._id || 'N/A',
          totalSumAssured: off.totalSumAssured,
          totalInitialPremium: off.totalInitialPremium,
          policies: off.policies
        })),
        recentInsuranceActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}

