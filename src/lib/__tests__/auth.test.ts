import { describe, it, expect, beforeEach } from 'vitest';
import { signToken, verifyToken } from '../auth';
import { Role } from '@/models/User';

describe('Auth Utilities', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'super-secret-test-jwt-key-min-32-chars';
  });

  it('signs and verifies a valid JWT token', async () => {
    const payload = {
      id: '507f1f77bcf86cd799439011',
      email: 'postal.officer@indiapost.gov.in',
      role: Role.ADMIN,
      name: 'Test Officer',
    };

    const token = await signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(payload.id);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.name).toBe(payload.name);
  });

  it('returns null for an invalid or tampered token', async () => {
    const invalidToken = 'invalid.jwt.token.string';
    const decoded = await verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
