import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById(session.id).select('-passwordHash');
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session,
    });
  } catch (error: unknown) {
    console.error('Error fetching authenticated session:', error);
    return errorResponse((error as Error).message || 'Server Error', 500);
  }
}
