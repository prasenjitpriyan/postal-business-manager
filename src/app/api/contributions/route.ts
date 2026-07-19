import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ContributionService } from '@/features/contributions/services/contribution.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { verifyToken } from '@/lib/auth';
import { Role } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const officialId = searchParams.get('officialId') || undefined;
    const sortParam = searchParams.get('sort');
    let sortArray = [];
    if (sortParam) {
      try {
        sortArray = JSON.parse(decodeURIComponent(sortParam));
      } catch (e) {
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
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPERVISOR)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await req.json();
    body.createdBy = session.id;
    
    const contribution = await ContributionService.createContribution(body);

    return successResponse(contribution, 'Contribution added successfully', 201);
  } catch (error: unknown) {
    if ((error as Error).message.includes('already exists')) {
      return errorResponse((error as Error).message, 409);
    }
    return errorResponse((error as Error).message, 500);
  }
}
