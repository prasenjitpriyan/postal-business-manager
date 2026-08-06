import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAuthSession } from '@/lib/auth';
import { Role } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return errorResponse('Name, email, and message are required fields', 400);
    }

    const contactDoc = await ContactMessage.create({
      name,
      email,
      subject: subject || 'General Support Inquiry',
      message,
    });

    return successResponse(
      {
        message: 'Contact form message saved successfully',
        id: contactDoc._id,
      },
      'Message sent successfully',
      201
    );
  } catch (error: unknown) {
    return errorResponse((error as Error).message || 'Failed to submit contact message', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getAuthSession(req);
    if (!session) return errorResponse('Unauthorized', 401);
    if (session.role !== Role.ADMIN) return errorResponse('Forbidden: Admin access required', 403);

    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    return successResponse(messages);
  } catch (error: unknown) {
    return errorResponse((error as Error).message || 'Failed to fetch contact messages', 500);
  }
}
