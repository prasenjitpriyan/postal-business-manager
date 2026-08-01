import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InsuranceService } from '@/features/insurance/services/insurance.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { InsuranceType } from '@/types/insurance';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const officialId = searchParams.get('officialId') || undefined;
    const insuranceType = (searchParams.get('insuranceType') as InsuranceType | 'ALL') || undefined;
    const sortParam = searchParams.get('sort');

    let sortArray = [];
    if (sortParam) {
      try {
        sortArray = JSON.parse(decodeURIComponent(sortParam));
      } catch {
        // Ignore JSON parse error
      }
    }

    const data = await InsuranceService.getInsuranceContributions({
      page,
      limit,
      search,
      startDate,
      endDate,
      officialId,
      insuranceType,
      sortArray,
    });

    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPERVISOR)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await req.json();
    body.createdBy = session.id;

    const contribution = await InsuranceService.createInsurance(body);

    return successResponse(contribution, 'Insurance contribution added successfully', 201);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
