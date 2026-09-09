import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OfficialService } from '@/features/officials/services/official.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { officialSchema, clampPagination } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const { page, limit } = clampPagination(searchParams.get('page'), searchParams.get('limit'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortParam = searchParams.get('sort');
    let sortArray = [];
    if (sortParam) {
      try {
        sortArray = JSON.parse(decodeURIComponent(sortParam));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignored
      }
    }

    const data = await OfficialService.getOfficials({ page, limit, search, status, sortArray });
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
    const parsed = officialSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation failed', 400);
    }

    const official = await OfficialService.createOfficial(parsed.data);

    return successResponse(official, 'Official added successfully', 201);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}

