import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TargetService } from '@/features/targets/services/target.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const financialYear = searchParams.get('financialYear') || undefined;
    const rawMonth = searchParams.get('month');
    const month = rawMonth && rawMonth !== 'ALL' ? parseInt(rawMonth, 10) : undefined;
    const office = searchParams.get('office') || undefined;

    const summary = await TargetService.getTargetsSummary(financialYear, month, office);

    return successResponse(summary);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
