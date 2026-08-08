import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Role } from '@/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    return successResponse(users);
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
