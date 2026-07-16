import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Return the token in the response and also set it in an HttpOnly cookie for security if needed
    // For this implementation, we will rely on Authorization header token passing
    return successResponse({ user: userData, token }, 'Login successful', 200);

  } catch (error: unknown) {
    console.error('Login error:', error);
    return errorResponse((error as Error).message || 'Server Error', 500);
  }
}
