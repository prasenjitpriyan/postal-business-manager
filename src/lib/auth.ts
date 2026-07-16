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
