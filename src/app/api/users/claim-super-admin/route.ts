import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Role } from '@/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUser = await User.findById(session.id);
    if (!currentUser) {
      return errorResponse('User not found', 404);
    }

    currentUser.role = Role.SUPER_ADMIN;
    await currentUser.save();

    return successResponse(
      {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        updatedAt: currentUser.updatedAt,
      },
      'Super Admin privileges granted! You now have top-level project ownership.'
    );
  } catch (error: unknown) {
    return errorResponse((error as Error).message || 'Server Error', 500);
  }
}
