import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DashboardService } from '@/features/dashboard/services/dashboard.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const stats = await DashboardService.getDashboardStats();
    return successResponse(stats);

  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}

