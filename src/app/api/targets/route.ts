import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TargetService } from '@/features/targets/services/target.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { clampPagination, targetSchema } from '@/lib/validations';
import { TargetCategory, TargetStatus } from '@/types/target';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const { page, limit } = clampPagination(searchParams.get('page'), searchParams.get('limit'));
    const financialYear = searchParams.get('financialYear') || undefined;
    const rawMonth = searchParams.get('month');
    const month = rawMonth && rawMonth !== 'ALL' ? parseInt(rawMonth, 10) : undefined;
    const category = (searchParams.get('category') as TargetCategory | 'ALL') || undefined;
    const office = searchParams.get('office') || undefined;
    const officialId = searchParams.get('officialId') || undefined;
    const status = (searchParams.get('status') as TargetStatus | 'ALL') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortParam = searchParams.get('sort');

    let sortArray = undefined;
    if (sortParam) {
      try {
        sortArray = JSON.parse(decodeURIComponent(sortParam));
      } catch {
        // Ignore JSON parse errors
      }
    }

    const data = await TargetService.getTargets({
      page,
      limit,
      financialYear,
      month,
      category,
      office,
      officialId,
      status,
      search,
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
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required to set targets.', 403);
    }

    const body = await req.json();
    const parsed = targetSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid target payload', 400);
    }

    const target = await TargetService.createTarget({
      ...parsed.data,
      createdBy: session.id,
    });

    return successResponse(target, 'Target created successfully', 201);
  } catch (error: unknown) {
    if ((error as Error).message === 'Official not found') {
      return errorResponse((error as Error).message, 404);
    }
    return errorResponse((error as Error).message, 500);
  }
}
