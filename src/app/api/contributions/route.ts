import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ContributionService } from '@/features/contributions/services/contribution.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { contributionSchema, clampPagination } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const { page, limit } = clampPagination(searchParams.get('page'), searchParams.get('limit'));
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const officialId = searchParams.get('officialId') || undefined;
    const sortParam = searchParams.get('sort');
    let sortArray = [];
    if (sortParam) {
      try {
        sortArray = JSON.parse(decodeURIComponent(sortParam));
      } catch {
        // Fallback or ignore
      }
    }

    const data = await ContributionService.getContributions({ 
      page, limit, search, startDate, endDate, officialId, sortArray
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
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const body = await req.json();
    const parsed = contributionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation failed', 400);
    }

    const payload = {
      ...parsed.data,
      createdBy: session.id,
    };
    
    const contribution = await ContributionService.createContribution(payload);

    return successResponse(contribution, 'Contribution added successfully', 201);
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg.includes('already exists')) {
      return errorResponse(msg, 409);
    }
    if (msg === 'Official not found' || msg.includes('Valid official ID')) {
      return errorResponse(msg, 404);
    }
    return errorResponse(msg, 500);
  }
}
