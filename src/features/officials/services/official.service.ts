import { Official } from '@/models/Official';
import { BusinessContribution } from '@/models/BusinessContribution';
import { InsuranceContribution } from '@/models/InsuranceContribution';
import mongoose from 'mongoose';

export interface GetOfficialsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortArray?: { id: string; desc: boolean }[];
}

export class OfficialService {
  static async getOfficials(queryOptions: GetOfficialsQuery) {
    const page = Math.max(queryOptions.page || 1, 1);
    const limit = Math.min(Math.max(queryOptions.limit || 10, 1), 100);
    const search = queryOptions.search || '';
    const status = queryOptions.status || '';
    const sortArray = queryOptions.sortArray && queryOptions.sortArray.length > 0 
      ? queryOptions.sortArray 
      : [{ id: 'name', desc: false }];

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { office: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    sortArray.forEach(s => {
      sortOptions[s.id] = s.desc ? -1 : 1;
    });
    if (!sortOptions.createdAt) sortOptions.createdAt = -1;

    const officialsPromise = Official.find(query)
      .collation({ locale: 'en', strength: 2 })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPromise = Official.countDocuments(query);

    const [officials, total] = await Promise.all([officialsPromise, totalPromise]);

    return {
      officials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getOfficialById(id: string) {
    const official = await Official.findById(id).lean();
    if (!official) throw new Error('Official not found');
    return official;
  }

  static async createOfficial(data: Record<string, unknown>) {
    return await Official.create(data);
  }

  static async updateOfficial(id: string, data: Record<string, unknown>) {
    const official = await Official.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
    if (!official) throw new Error('Official not found');
    return official;
  }

  static async deleteOfficial(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid official ID');
    }

    const officialObjectId = new mongoose.Types.ObjectId(id);

    // Check referential integrity: reject deletion if contributions or insurance exist
    const [hasContributions, hasInsurance] = await Promise.all([
      BusinessContribution.exists({ officialId: officialObjectId }),
      InsuranceContribution.exists({ officialId: officialObjectId }),
    ]);

    if (hasContributions || hasInsurance) {
      throw new Error(
        'Cannot delete official: active account contributions or insurance policy records are linked to this official. Please set status to INACTIVE instead.'
      );
    }

    const official = await Official.findByIdAndDelete(id);
    if (!official) throw new Error('Official not found');
    return official;
  }
}
