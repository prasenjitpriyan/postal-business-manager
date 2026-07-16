import { BusinessContribution } from '@/models/BusinessContribution';
import { GetContributionsQuery } from '@/types/contribution';

export class ContributionService {
  static async getContributions(queryOptions: GetContributionsQuery) {
    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
    const search = queryOptions.search || '';
    const startDate = queryOptions.startDate;
    const endDate = queryOptions.endDate;
    const officialId = queryOptions.officialId;

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
    
    if (officialId) {
      query.officialId = officialId;
    }

    const contributions = await BusinessContribution.find(query)
      .populate('officialId', 'name designation')
      .populate('createdBy', 'name')
      .sort({ contributionDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
