import { InsuranceContribution } from '@/models/InsuranceContribution';
import { Official } from '@/models/Official';
import { GetInsuranceQuery } from '@/types/insurance';
import mongoose from 'mongoose';

export class InsuranceService {
  static async getInsuranceContributions(queryOptions: GetInsuranceQuery) {
    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
    const search = queryOptions.search || '';
    const startDate = queryOptions.startDate;
    const endDate = queryOptions.endDate;
    const officialId = queryOptions.officialId;
    const insuranceType = queryOptions.insuranceType;
    const sortArray = queryOptions.sortArray && queryOptions.sortArray.length > 0 
      ? queryOptions.sortArray 
      : [{ id: 'contributionDate', desc: true }];

    const query: Record<string, unknown> = {};

    if (search) {
      const matchingOfficials = await Official.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
        ],
      }).select('_id').lean();
      const officialIds = matchingOfficials.map(o => o._id);

      query.$or = [
        { officeOfIndexing: { $regex: search, $options: 'i' } },
        { insuranceType: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
        ...(officialIds.length > 0 ? [{ officialId: { $in: officialIds } }] : []),
      ];
    }

    if (startDate || endDate) {
      query.contributionDate = {};
      if (startDate) (query.contributionDate as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.contributionDate as Record<string, unknown>).$lte = end;
      }
    }

    if (officialId && mongoose.Types.ObjectId.isValid(officialId)) {
      query.officialId = new mongoose.Types.ObjectId(officialId);
    }

    if (insuranceType && insuranceType !== 'ALL') {
      query.insuranceType = insuranceType;
    }

    const totalPromise = InsuranceContribution.countDocuments(query);

    // Compute summary metrics across matched dataset
    const summaryPromise = InsuranceContribution.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSumAssured: { $sum: '$sumAssured' },
          totalInitialPremium: { $sum: '$initialPremium' },
          pliCount: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'PLI'] }, 1, 0] }
          },
          rpliCount: {
            $sum: { $cond: [{ $eq: ['$insuranceType', 'RPLI'] }, 1, 0] }
          }
        }
      }
    ]);

    let contributionsPromise;
    const hasOfficialSort = sortArray.some(s => s.id === 'officialId.name');

    if (hasOfficialSort) {
      const pipeline: mongoose.PipelineStage[] = [];

      if (Object.keys(query).length > 0) {
        pipeline.push({ $match: query });
      }

      pipeline.push(
        {
          $lookup: {
            from: 'officials',
            localField: 'officialId',
            foreignField: '_id',
            as: 'official'
          }
        },
        { $unwind: { path: '$official', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } }
      );

      const sortObj: Record<string, 1 | -1> = {};
      sortArray.forEach(s => {
        const field = s.id === 'officialId.name' ? 'official.name' : s.id;
        sortObj[field] = s.desc ? -1 : 1;
      });
      if (!sortObj.createdAt) sortObj.createdAt = -1;

      pipeline.push({ $sort: sortObj });
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
      pipeline.push({
        $addFields: {
          officialId: {
            _id: '$official._id',
            name: '$official.name',
            designation: '$official.designation'
          },
          createdBy: {
            _id: '$creator._id',
            name: '$creator.name'
          }
        }
      });
      pipeline.push({ $project: { official: 0, creator: 0 } });

      contributionsPromise = InsuranceContribution.aggregate(pipeline).collation({ locale: 'en', strength: 2 });
    } else {
      const sortObj: Record<string, 1 | -1> = {};
      sortArray.forEach(s => {
        sortObj[s.id] = s.desc ? -1 : 1;
      });
      if (!sortObj.createdAt) sortObj.createdAt = -1;

      contributionsPromise = InsuranceContribution.find(query)
        .populate('officialId', 'name designation')
        .populate('createdBy', 'name')
        .collation({ locale: 'en', strength: 2 })
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const [contributions, total, summaryResult] = await Promise.all([
      contributionsPromise,
      totalPromise,
      summaryPromise
    ]);

    const summary = summaryResult[0] || {
      totalSumAssured: 0,
      totalInitialPremium: 0,
      pliCount: 0,
      rpliCount: 0,
    };

    return {
      contributions,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getInsuranceById(id: string) {
    const item = await InsuranceContribution.findById(id)
      .populate('officialId', 'name designation')
      .lean();
    if (!item) throw new Error('Insurance contribution not found');
    return item;
  }

  static async createInsurance(data: Record<string, unknown>) {
    return await InsuranceContribution.create(data);
  }

  static async updateInsurance(id: string, data: Record<string, unknown>) {
    const updated = await InsuranceContribution.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!updated) throw new Error('Insurance contribution not found');
    return updated;
  }

  static async deleteInsurance(id: string) {
    const deleted = await InsuranceContribution.findByIdAndDelete(id);
    if (!deleted) throw new Error('Insurance contribution not found');
    return deleted;
  }
}
