import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuditEvent, sanitizeAuditPayload, getAuditLogs } from '../audit';
import { AuditLog } from '@/models/AuditLog';

vi.mock('@/models/AuditLog', () => ({
  AuditLog: {
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

interface MockAuditQueryChain {
  sort: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  lean: ReturnType<typeof vi.fn>;
}

function mockAuditFindQuery(result: unknown[] = []): MockAuditQueryChain {
  const query: Partial<MockAuditQueryChain> = {};
  query.sort = vi.fn().mockReturnValue(query);
  query.skip = vi.fn().mockReturnValue(query);
  query.limit = vi.fn().mockReturnValue(query);
  query.lean = vi.fn().mockResolvedValue(result);
  return query as MockAuditQueryChain;
}

describe('Audit Logging System - Event Tracking & Secret Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Action Lifecycle Events', () => {
    it('records CREATE event with entity details and sanitized initial state', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'CREATE',
        entity: 'Target',
        entityId: 'target-991',
        user: {
          id: 'user-admin-1',
          name: 'Super Admin',
          email: 'admin@indiapost.gov.in',
          role: 'Super Admin',
        },
        newValue: {
          category: 'POSB',
          targetValue: 500,
          financialYear: '2026-2027',
          month: 6,
        },
        result: 'SUCCESS',
        requestMetadata: {
          ip: '10.0.1.20',
          method: 'POST',
          path: '/api/targets',
          statusCode: 201,
        },
      });

      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const user = callArgs.user as Record<string, unknown>;
      const nextVal = callArgs.newValue as Record<string, unknown>;
      const reqMeta = callArgs.requestMetadata as Record<string, unknown>;

      expect(callArgs.action).toBe('CREATE');
      expect(callArgs.entity).toBe('Target');
      expect(callArgs.entityId).toBe('target-991');
      expect(user?.email).toBe('admin@indiapost.gov.in');
      expect(nextVal?.targetValue).toBe(500);
      expect(callArgs.previousValue).toBeNull();
      expect(callArgs.result).toBe('SUCCESS');
      expect(reqMeta?.statusCode).toBe(201);
    });

    it('records UPDATE event capturing delta between previousValue and newValue', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'UPDATE',
        entity: 'Official',
        entityId: 'off-555',
        user: {
          id: 'user-admin-2',
          name: 'Division Admin',
          email: 'divadmin@indiapost.gov.in',
          role: 'Admin',
        },
        previousValue: {
          name: 'Suresh Kumar',
          designation: 'Postal Assistant',
          office: 'Alipore HO',
        },
        newValue: {
          name: 'Suresh Kumar',
          designation: 'Sub Postmaster',
          office: 'Ballygunge SO',
        },
        result: 'SUCCESS',
      });

      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const prev = callArgs.previousValue as Record<string, unknown>;
      const next = callArgs.newValue as Record<string, unknown>;

      expect(callArgs.action).toBe('UPDATE');
      expect(callArgs.entity).toBe('Official');
      expect(prev?.designation).toBe('Postal Assistant');
      expect(next?.designation).toBe('Sub Postmaster');
      expect(prev?.office).toBe('Alipore HO');
      expect(next?.office).toBe('Ballygunge SO');
    });

    it('records DELETE event capturing previous state and entity identity', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'DELETE',
        entity: 'InsuranceContribution',
        entityId: 'ins-pol-888',
        user: {
          id: 'user-admin-1',
          name: 'Super Admin',
          email: 'admin@indiapost.gov.in',
          role: 'Super Admin',
        },
        previousValue: {
          policyNumber: 'PLI-2026-9901',
          sumAssured: 1000000,
          initialPremium: 25000,
        },
        result: 'SUCCESS',
      });

      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const prev = callArgs.previousValue as Record<string, unknown>;

      expect(callArgs.action).toBe('DELETE');
      expect(callArgs.entity).toBe('InsuranceContribution');
      expect(callArgs.entityId).toBe('ins-pol-888');
      expect(prev?.policyNumber).toBe('PLI-2026-9901');
      expect(callArgs.newValue).toBeNull();
    });

    it('records RESTORE event when a deleted or archived record is recovered', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'RESTORE',
        entity: 'Official',
        entityId: 'off-archive-10',
        user: {
          id: 'user-admin-1',
          name: 'Super Admin',
          email: 'admin@indiapost.gov.in',
          role: 'Super Admin',
        },
        previousValue: { status: 'DELETED' },
        newValue: { status: 'ACTIVE' },
        result: 'SUCCESS',
      });

      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const prev = callArgs.previousValue as Record<string, unknown>;
      const next = callArgs.newValue as Record<string, unknown>;

      expect(callArgs.action).toBe('RESTORE');
      expect(callArgs.entity).toBe('Official');
      expect(prev?.status).toBe('DELETED');
      expect(next?.status).toBe('ACTIVE');
    });

    it('records EXPORT event capturing query scope and export format without data leakage', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'EXPORT',
        entity: 'InsuranceContribution',
        user: {
          id: 'user-auditor-1',
          name: 'Inspection Officer',
          email: 'auditor@indiapost.gov.in',
          role: 'Admin',
        },
        newValue: {
          format: 'CSV',
          recordsExported: 4500,
          filterCriteria: { financialYear: '2026-2027', insuranceType: 'PLI' },
        },
        result: 'SUCCESS',
        requestMetadata: {
          ip: '192.168.1.100',
          method: 'GET',
          path: '/api/insurance/export',
          statusCode: 200,
        },
      });

      expect(AuditLog.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const next = callArgs.newValue as Record<string, unknown>;
      const reqMeta = callArgs.requestMetadata as Record<string, unknown>;

      expect(callArgs.action).toBe('EXPORT');
      expect(callArgs.entity).toBe('InsuranceContribution');
      expect(next?.format).toBe('CSV');
      expect(next?.recordsExported).toBe(4500);
      expect(reqMeta?.path).toBe('/api/insurance/export');
    });
  });

  describe('Security & Sensitive Data Redaction', () => {
    it('unconditionally sanitizes passwords, hashes, tokens, secrets, cookies, and keys', () => {
      const sensitivePayload = {
        name: 'Official Admin',
        email: 'admin@test.com',
        password: 'superSecretPassword123!',
        passwordHash: '$2b$12$eX8mJ...hashedString',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        secret: 'session_secret_xyz',
        jwt: 'header.payload.signature',
        cookie: 'sessionId=abc123456789',
        authorization: 'Bearer secret_access_token',
        creditCard: '4111222233334444',
        cvv: '999',
        nested: {
          refreshToken: 'refresh-token-value',
          salt: 'random_salt_123',
          normalField: 'Public Safe Data',
        },
      };

      const sanitized = sanitizeAuditPayload(sensitivePayload) as Record<string, unknown>;
      const nested = sanitized.nested as Record<string, unknown>;

      expect(sanitized.name).toBe('Official Admin');
      expect(sanitized.email).toBe('admin@test.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.passwordHash).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.secret).toBe('[REDACTED]');
      expect(sanitized.jwt).toBe('[REDACTED]');
      expect(sanitized.cookie).toBe('[REDACTED]');
      expect(sanitized.authorization).toBe('[REDACTED]');
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.cvv).toBe('[REDACTED]');
      expect(nested.refreshToken).toBe('[REDACTED]');
      expect(nested.salt).toBe('[REDACTED]');
      expect(nested.normalField).toBe('Public Safe Data');
    });

    it('masks secrets inside previousValue and newValue when logAuditEvent is called', async () => {
      vi.mocked(AuditLog.create).mockResolvedValueOnce({} as never);

      await logAuditEvent({
        action: 'UPDATE',
        entity: 'User',
        previousValue: { email: 'admin@test.com', password: 'oldPassword' },
        newValue: { email: 'admin@test.com', password: 'newPassword', token: 'bearer-xyz' },
      });

      const callArgs = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
      const prev = callArgs.previousValue as Record<string, unknown>;
      const next = callArgs.newValue as Record<string, unknown>;

      expect(prev.password).toBe('[REDACTED]');
      expect(next.password).toBe('[REDACTED]');
      expect(next.token).toBe('[REDACTED]');
    });
  });

  describe('Non-Blocking Resilience', () => {
    it('catches database errors gracefully without throwing to caller', async () => {
      vi.mocked(AuditLog.create).mockRejectedValueOnce(new Error('MongoDB cluster partition'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      await expect(
        logAuditEvent({
          action: 'LOGIN',
          entity: 'Auth',
          result: 'SUCCESS',
        })
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('AuditLog writing failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Audit Query & Filtering', () => {
    it('applies action, entity, result, and date range filters correctly', async () => {
      const mockResult = [
        {
          _id: 'log-1',
          action: 'CREATE',
          entity: 'Target',
          timestamp: new Date('2026-09-05'),
          result: 'SUCCESS',
        },
      ];

      vi.mocked(AuditLog.countDocuments).mockResolvedValueOnce(1);
      vi.mocked(AuditLog.find).mockReturnValue(mockAuditFindQuery(mockResult) as never);

      const response = await getAuditLogs({
        page: 1,
        limit: 10,
        action: 'CREATE',
        entity: 'Target',
        result: 'SUCCESS',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
      });

      expect(response.pagination.total).toBe(1);
      expect(response.pagination.page).toBe(1);
      expect(response.logs.length).toBe(1);
      expect(response.logs[0].action).toBe('CREATE');

      const findCallArgs = vi.mocked(AuditLog.find).mock.calls[0][0] as Record<string, unknown>;
      const tsFilter = findCallArgs.timestamp as Record<string, unknown>;

      expect(findCallArgs.action).toBe('CREATE');
      expect(findCallArgs.entity).toBe('Target');
      expect(findCallArgs.result).toBe('SUCCESS');
      expect(tsFilter.$gte).toEqual(new Date('2026-09-01'));
    });
  });
});
