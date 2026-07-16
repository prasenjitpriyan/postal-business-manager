import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OfficialService } from '@/features/officials/services/official.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { verifyToken } from '@/lib/auth';
import { Role } from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session) return errorResponse('Unauthorized', 401);

    const official = await OfficialService.getOfficialById(id);
    return successResponse(official);
  } catch (error: unknown) {
    if ((error as Error).message === 'Official not found') return errorResponse((error as Error).message, 404);
    return errorResponse((error as Error).message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPERVISOR)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await req.json();
    const official = await OfficialService.updateOfficial(id, body);

    return successResponse(official, 'Official updated successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Official not found') return errorResponse((error as Error).message, 404);
    return errorResponse((error as Error).message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;
    
    if (!token) return errorResponse('Unauthorized', 401);
    
    const session = await verifyToken(token);
    if (!session || session.role !== Role.ADMIN) {
      return errorResponse('Forbidden: Only Admins can delete', 403);
    }

    await OfficialService.deleteOfficial(id);

    return successResponse(null, 'Official deleted successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Official not found') return errorResponse((error as Error).message, 404);
    return errorResponse((error as Error).message, 500);
  }
}
