import { BusinessContribution } from '@/models/BusinessContribution';
import { Official } from '@/models/Official';
import { GetContributionsQuery } from '@/types/contribution';
import mongoose from 'mongoose';

function escapeRegex(str: string): string {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

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
      const matchingOfficials = await Official.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
        ],
      }).select('_id').lean();
      const officialIds = matchingOfficials.map(o => o._id);

      query.$or = [
        { contributeOffice: { $regex: search, $options: 'i' } },
        { accountType: { $regex: search, $options: 'i' } },
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

    const totalPromise = BusinessContribution.countDocuments(query);
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

      contributionsPromise = BusinessContribution.aggregate(pipeline).collation({ locale: 'en', strength: 2 });
    } else {
      const sortObj: Record<string, 1 | -1> = {};
      sortArray.forEach(s => {
        sortObj[s.id] = s.desc ? -1 : 1;
      });
      if (!sortObj.createdAt) sortObj.createdAt = -1;

      contributionsPromise = BusinessContribution.find(query)
        .populate('officialId', 'name designation')
        .populate('createdBy', 'name')
        .collation({ locale: 'en', strength: 2 })
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const [contributions, total] = await Promise.all([contributionsPromise, totalPromise]);

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
    const contribution = await BusinessContribution.findById(id).populate('officialId', 'name designation').lean();
    if (!contribution) throw new Error('Contribution not found');
    return contribution;
  }

  static async createContribution(data: Record<string, unknown>) {
    const contributeOffice = (data.contributeOffice as string)?.trim();
    const accountType = (data.accountType as string)?.trim();
    const officialId = new mongoose.Types.ObjectId(data.officialId as string);

    const filter: Record<string, unknown> = {
      officialId,
      contributionDate: new Date(data.contributionDate as string),
      accountType: accountType
        ? { $regex: `^${escapeRegex(accountType)}$`, $options: 'i' }
        : (data.accountType as string),
      contributeOffice: contributeOffice
        ? { $regex: `^${escapeRegex(contributeOffice)}$`, $options: 'i' }
        : (data.contributeOffice as string),
    };

    // Duplicate check includes contributeOffice so an official can contribute in different offices on the same date
    const exists = await BusinessContribution.findOne(filter);
    
    if (exists) {
      throw new Error(`Contribution for ${data.accountType} at ${data.contributeOffice} on this date already exists for this official.`);
    }

    return await BusinessContribution.create(data);
  }

  static async updateContribution(id: string, data: Record<string, unknown>) {
    const existing = await BusinessContribution.findById(id);
    if (!existing) throw new Error('Contribution not found');

    const officialIdStr = (data.officialId as string) || existing.officialId.toString();
    const officialId = new mongoose.Types.ObjectId(officialIdStr);
    const contributionDate = data.contributionDate ? new Date(data.contributionDate as string) : existing.contributionDate;
    const accountType = ((data.accountType as string) || existing.accountType).trim();
    const contributeOffice = ((data.contributeOffice as string) || existing.contributeOffice).trim();

    const filter: Record<string, unknown> = {
      _id: { $ne: new mongoose.Types.ObjectId(id) },
      officialId,
      contributionDate,
      accountType: { $regex: `^${escapeRegex(accountType)}$`, $options: 'i' },
      contributeOffice: { $regex: `^${escapeRegex(contributeOffice)}$`, $options: 'i' },
    };

    const duplicate = await BusinessContribution.findOne(filter);

    if (duplicate) {
      throw new Error(`Contribution for ${accountType} at ${contributeOffice} on this date already exists for this official.`);
    }

    const contribution = await BusinessContribution.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    return contribution;
  }

  static async deleteContribution(id: string) {
    const contribution = await BusinessContribution.findByIdAndDelete(id);
    if (!contribution) throw new Error('Contribution not found');
    return contribution;
  }
}
