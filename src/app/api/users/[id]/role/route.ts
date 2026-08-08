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
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
      return errorResponse('Forbidden. Admin permissions required.', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    const validRoles = Object.values(Role);
    if (!role || !validRoles.includes(role)) {
      return errorResponse(`Invalid role specified. Role must be Super Admin, Admin, or Viewer.`, 400);
    }

    // Only Super Admin can promote someone to Super Admin
    if (role === Role.SUPER_ADMIN && session.role !== Role.SUPER_ADMIN) {
      return errorResponse('Only Super Admin can assign the Super Admin role.', 403);
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse('User not found.', 404);
    }

    // Safety check: Prevent demoting the last remaining Super Admin
    if (targetUser.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
      const superAdminCount = await User.countDocuments({ role: Role.SUPER_ADMIN });
      if (superAdminCount <= 1) {
        return errorResponse('Cannot demote the only remaining Super Admin. Grant Super Admin status to another user first for project handover.', 400);
      }
    }

    // Safety check: Prevent demoting the last remaining Admin/Super Admin in the system
    if ((targetUser.role === Role.ADMIN || targetUser.role === Role.SUPER_ADMIN) && role === Role.VIEWER) {
      const elevatedCount = await User.countDocuments({ role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } });
      if (elevatedCount <= 1) {
        return errorResponse('Cannot demote the only remaining administrative user.', 400);
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
