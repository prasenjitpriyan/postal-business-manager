import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as { [key: string]: unknown })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getAuthSession(req: NextRequest): Promise<SessionPayload | null> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1] || req.cookies.get('token')?.value;

  if (!token) return null;
  return await verifyToken(token);
}

