import { BusinessContribution } from '@/models/BusinessContribution';
import { GetContributionsQuery } from '@/types/contribution';
import mongoose from 'mongoose';

export class ContributionService {
  static async getContributions(queryOptions: GetContributionsQuery) {
    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
    const search = queryOptions.search || '';
    const startDate = queryOptions.startDate;
    const endDate = queryOptions.endDate;
    const officialId = queryOptions.officialId;
    const sortArray = queryOptions.sortArray && queryOptions.sortArray.length > 0 
      ? queryOptions.sortArray 
      : [{ id: 'officialId.name', desc: false }];

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { contributeOffice: { $regex: search, $options: 'i' } },
        { accountType: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (startDate || endDate) {
      query.contributionDate = {};
      if (startDate) (query.contributionDate as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (query.contributionDate as Record<string, unknown>).$lte = new Date(endDate);
    }
    
    if (officialId && mongoose.Types.ObjectId.isValid(officialId)) {
      query.officialId = new mongoose.Types.ObjectId(officialId);
    }

    let contributions;
    const hasOfficialSort = sortArray.some(s => s.id === 'officialId.name');

    if (hasOfficialSort) {
      const pipeline: mongoose.PipelineStage[] = [];
      
      if (Object.keys(query).length > 0) {
        pipeline.push({ $match: query });
      }

      // MongoDB Collation for case-insensitive sort can be applied to the pipeline,
      // but simpler is just to let MongoDB sort on the string directly. To do true case-insensitive
      // sort, we'd need to use collation or `$toLower`. Let's stick to standard sort for now
      // since collation requires passing options to the query.

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

      // Build sort object
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

      contributions = await BusinessContribution.aggregate(pipeline).collation({ locale: 'en', strength: 2 });
    } else {
      const sortObj: Record<string, 1 | -1> = {};
      sortArray.forEach(s => {
        sortObj[s.id] = s.desc ? -1 : 1;
      });
      if (!sortObj.createdAt) sortObj.createdAt = -1;

      contributions = await BusinessContribution.find(query)
        .populate('officialId', 'name designation')
        .populate('createdBy', 'name')
        .collation({ locale: 'en', strength: 2 })
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit);
    }

    const total = await BusinessContribution.countDocuments(query);

    return {
      contributions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getContributionById(id: string) {
    const contribution = await BusinessContribution.findById(id).populate('officialId', 'name designation');
    if (!contribution) throw new Error('Contribution not found');
    return contribution;
  }

  static async createContribution(data: Record<string, unknown>) {
    // Basic duplicate check (same official, date, and account type)
    const exists = await BusinessContribution.findOne({
      officialId: data.officialId as string,
      contributionDate: new Date(data.contributionDate as string),
      accountType: data.accountType as string
    });
    
    if (exists) {
      throw new Error(`Contribution for ${data.accountType} on this date already exists for this official.`);
    }

    return await BusinessContribution.create(data);
  }

  static async updateContribution(id: string, data: Record<string, unknown>) {
    const contribution = await BusinessContribution.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!contribution) throw new Error('Contribution not found');
    return contribution;
  }

  static async deleteContribution(id: string) {
    const contribution = await BusinessContribution.findByIdAndDelete(id);
    if (!contribution) throw new Error('Contribution not found');
    return contribution;
  }
}
