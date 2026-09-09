import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET must be defined in production environment variables.');
    }
    return new TextEncoder().encode('postal-business-manager-dev-secret-key-do-not-use-in-prod');
  }
  return new TextEncoder().encode(secret);
};

const encodedSecret = getJwtSecret();

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

