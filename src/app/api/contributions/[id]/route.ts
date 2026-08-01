import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ContributionService } from '@/features/contributions/services/contribution.service';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);

    const contribution = await ContributionService.getContributionById(id);
    return successResponse(contribution);
  } catch (error: unknown) {
    if ((error as Error).message === 'Contribution not found') return errorResponse((error as Error).message, 404);
    return errorResponse((error as Error).message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPERVISOR)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await req.json();
    const contribution = await ContributionService.updateContribution(id, body);

    return successResponse(contribution, 'Contribution updated successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Contribution not found') return errorResponse((error as Error).message, 404);
    if ((error as Error).message.includes('already exists')) return errorResponse((error as Error).message, 409);
    return errorResponse((error as Error).message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const session = await getAuthSession(req);
    if (!session || session.role !== Role.ADMIN) {
      return errorResponse('Forbidden: Only Admins can delete', 403);
    }

    await ContributionService.deleteContribution(id);

    return successResponse(null, 'Contribution deleted successfully');
  } catch (error: unknown) {
    if ((error as Error).message === 'Contribution not found') return errorResponse((error as Error).message, 404);
    return errorResponse((error as Error).message, 500);
  }
}

