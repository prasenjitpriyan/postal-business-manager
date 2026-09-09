import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TargetService } from '@/features/targets/services/target.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';
import { updateTargetSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const target = await TargetService.getTargetById(id);

    return successResponse(target);
  } catch (error: unknown) {
    if ((error as Error).message === 'Target not found') {
      return errorResponse((error as Error).message, 404);
    }
    return errorResponse((error as Error).message, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = updateTargetSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400);
    }

    const updated = await TargetService.updateTarget(id, parsed.data);
    return successResponse(updated, 'Target updated successfully');
  } catch (error: unknown) {
    if (
      (error as Error).message === 'Target not found' ||
      (error as Error).message === 'Official not found'
    ) {
      return errorResponse((error as Error).message, 404);
    }
    return errorResponse((error as Error).message, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const { id } = await params;
    await TargetService.deleteTarget(id);

    return successResponse(null, 'Target deleted successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Target not found') {
      return errorResponse((error as Error).message, 404);
    }
    return errorResponse((error as Error).message, 500);
  }
}
