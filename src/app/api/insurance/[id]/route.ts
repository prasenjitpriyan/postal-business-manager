import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InsuranceService } from '@/features/insurance/services/insurance.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';

import { updateInsuranceSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const item = await InsuranceService.getInsuranceById(id);
    return successResponse(item);
  } catch (error: unknown) {
    if ((error as Error).message === 'Insurance contribution not found') {
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
    const parsed = updateInsuranceSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400);
    }

    const updated = await InsuranceService.updateInsurance(id, parsed.data);
    return successResponse(updated, 'Insurance contribution updated successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Insurance contribution not found' || (error as Error).message === 'Official not found') {
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
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const { id } = await params;
    await InsuranceService.deleteInsurance(id);
    return successResponse(null, 'Insurance contribution deleted successfully');
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
