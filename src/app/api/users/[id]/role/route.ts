import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Role } from '@/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session || session.role !== Role.ADMIN) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || (role !== Role.ADMIN && role !== Role.VIEWER)) {
      return errorResponse('Invalid role specified. Role must be Admin or Viewer.', 400);
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse('User not found.', 404);
    }

    // Safety check: Prevent demoting the last remaining Admin in the system
    if (targetUser.role === Role.ADMIN && role === Role.VIEWER) {
      const adminCount = await User.countDocuments({ role: Role.ADMIN });
      if (adminCount <= 1) {
        return errorResponse('Cannot demote the only remaining Admin.', 400);
      }
    }

    targetUser.role = role;
    await targetUser.save();

    return successResponse(
      {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        updatedAt: targetUser.updatedAt,
      },
      `User role updated to ${role}`
    );
  } catch (error: unknown) {
    return errorResponse((error as Error).message, 500);
  }
}
