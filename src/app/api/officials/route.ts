import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OfficialService } from '@/features/officials/services/official.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { verifyToken } from '@/lib/auth';
import { Role } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Auth Check
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const data = await OfficialService.getOfficials({ page, limit, search, status });
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
    const official = await OfficialService.createOfficial(body);

    return successResponse(official, 'Official added successfully', 201);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
