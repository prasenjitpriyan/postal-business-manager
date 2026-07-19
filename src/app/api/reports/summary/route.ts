import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ReportService } from '@/features/reports/services/report.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Auth Check
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session) return errorResponse('Unauthorized', 401);

    const summary = await ReportService.getDashboardSummary();
    return successResponse(summary);

  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
