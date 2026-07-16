import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Role } from '@/models/User';
import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const authHeader = req.headers.get('Authorization');
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const session = await verifyToken(token);
        if (session && session.role === Role.ADMIN) {
          isAdmin = true;
        }
      } catch {
        // Ignore invalid tokens for public signup
      }
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return errorResponse('Please provide name, email, and password', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: isAdmin && role ? role : Role.VIEWER,
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse({ user: userData }, 'User registered successfully', 201);
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return errorResponse((error as Error).message || 'Server Error', 500);
  }
}
