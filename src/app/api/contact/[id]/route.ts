import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);
    if (session.role !== Role.ADMIN) return errorResponse('Forbidden: Admin access required', 403);

    const { id } = await params;
    const body = await req.json();
    const { status, replyNotes } = body;

    const messageDoc = await ContactMessage.findById(id);
    if (!messageDoc) return errorResponse('Message not found', 404);

    if (status) messageDoc.status = status;
    if (replyNotes !== undefined) {
      messageDoc.replyNotes = replyNotes;
      messageDoc.repliedBy = session.name || session.email;
      messageDoc.repliedAt = new Date();
      messageDoc.status = 'REPLIED';
    }

    await messageDoc.save();

    return successResponse(messageDoc, 'Contact message updated successfully');
  } catch (error: unknown) {
    return errorResponse((error as Error).message || 'Failed to update contact message', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);
    if (session.role !== Role.ADMIN) return errorResponse('Forbidden: Admin access required', 403);

    const { id } = await params;
    const messageDoc = await ContactMessage.findByIdAndDelete(id);
    if (!messageDoc) return errorResponse('Message not found', 404);

    return successResponse({ id }, 'Contact message deleted successfully');
  } catch (error: unknown) {
    return errorResponse((error as Error).message || 'Failed to delete contact message', 500);
  }
}
