import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { OfficialService } from '@/features/officials/services/official.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { updateOfficialSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const session = await getAuthSession(req);
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
    
    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const body = await req.json();
    const parsed = updateOfficialSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation failed', 400);
    }

    const official = await OfficialService.updateOfficial(id, parsed.data);

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
    
    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden: Only Admins can delete', 403);
    }

    await OfficialService.deleteOfficial(id);

    return successResponse(null, 'Official deleted successfully');
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg === 'Official not found') return errorResponse(msg, 404);
    if (msg.includes('Cannot delete official')) return errorResponse(msg, 400);
    return errorResponse(msg, 500);
  }
}

