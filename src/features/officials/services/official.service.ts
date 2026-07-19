import { Official } from '@/models/Official';

export interface GetOfficialsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortArray?: { id: string; desc: boolean }[];
}

export class OfficialService {
  static async getOfficials(queryOptions: GetOfficialsQuery) {
    const page = queryOptions.page || 1;
    const limit = queryOptions.limit || 10;
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

    const officials = await Official.find(query)
      .collation({ locale: 'en', strength: 2 })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Official.countDocuments(query);

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
    const official = await Official.findById(id);
    if (!official) throw new Error('Official not found');
    return official;
  }

  static async createOfficial(data: Record<string, unknown>) {
    return await Official.create(data);
  }

  static async updateOfficial(id: string, data: Record<string, unknown>) {
    const official = await Official.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!official) throw new Error('Official not found');
    return official;
  }

  static async deleteOfficial(id: string) {
    const official = await Official.findByIdAndDelete(id);
    if (!official) throw new Error('Official not found');
    return official;
  }
}
