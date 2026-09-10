import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { Role, User } from '@/models/User';
import * as authLib from '@/lib/auth';
import { PATCH as updateRole } from '@/app/api/users/[id]/role/route';
import { GET as getUsers } from '@/app/api/users/route';
import { POST as postTarget } from '@/app/api/targets/route';
import { DELETE as deleteTarget } from '@/app/api/targets/[id]/route';
import { POST as postInsurance } from '@/app/api/insurance/route';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/User', async () => {
  const actual = await vi.importActual<typeof import('@/models/User')>('@/models/User');
  return {
    ...actual,
    User: {
      find: vi.fn(),
      findById: vi.fn(),
      countDocuments: vi.fn(),
    },
  };
});

vi.mock('@/features/targets/services/target.service', () => ({
  TargetService: {
    createTarget: vi.fn().mockResolvedValue({ _id: 'target-1', targetValue: 100 }),
    deleteTarget: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/features/insurance/services/insurance.service', () => ({
  InsuranceService: {
    createInsurance: vi.fn().mockResolvedValue({ _id: 'ins-1', sumAssured: 100000 }),
  },
}));

describe('RBAC - Comprehensive Role & Access Control Auditing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthorized Access (No or Invalid Credentials)', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(null);

      const reqUsers = new NextRequest('http://localhost:3000/api/users');
      const resUsers = await getUsers(reqUsers);
      expect(resUsers.status).toBe(403); // /api/users checks session or returns 403

      const reqTargets = new NextRequest('http://localhost:3000/api/targets', { method: 'POST' });
      const resTargets = await postTarget(reqTargets);
      expect(resTargets.status).toBe(403);
    });

    it('rejects role modification when token is missing', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/users/user-1/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'user-1' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });
  });

  describe('Viewer Role Permissions & Restrictions', () => {
    const viewerSession = {
      id: 'viewer-123',
      name: 'Postal Viewer',
      email: 'viewer@indiapost.gov.in',
      role: Role.VIEWER,
    };

    it('blocks Viewer from creating targets with 403 Forbidden', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(viewerSession);

      const req = new NextRequest('http://localhost:3000/api/targets', {
        method: 'POST',
        body: JSON.stringify({ targetValue: 100 }),
      });
      const res = await postTarget(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });

    it('blocks Viewer from deleting targets with 403 Forbidden', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(viewerSession);

      const req = new NextRequest('http://localhost:3000/api/targets/target-1', {
        method: 'DELETE',
      });
      const res = await deleteTarget(req, { params: Promise.resolve({ id: 'target-1' }) });
      expect(res.status).toBe(403);
    });

    it('blocks Viewer from modifying user roles with 403 Forbidden', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(viewerSession);

      const req = new NextRequest('http://localhost:3000/api/users/user-1/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'user-1' }) });
      expect(res.status).toBe(403);
    });

    it('blocks Viewer from creating insurance policies with 403 Forbidden', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(viewerSession);

      const req = new NextRequest('http://localhost:3000/api/insurance', {
        method: 'POST',
        body: JSON.stringify({ sumAssured: 500000 }),
      });
      const res = await postInsurance(req);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Role Capabilities & Limitations', () => {
    const adminSession = {
      id: 'admin-123',
      name: 'Branch Admin',
      email: 'admin@indiapost.gov.in',
      role: Role.ADMIN,
    };

    it('allows Admin to create targets', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(adminSession);

      const req = new NextRequest('http://localhost:3000/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialYear: '2026-2027',
          category: 'POSB',
          metricType: 'ACCOUNTS_COUNT',
          targetValue: 100,
        }),
      });
      const res = await postTarget(req);
      expect(res.status).toBe(201);
    });

    it('prohibits Admin from promoting another user to Super Admin', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(adminSession);

      const req = new NextRequest('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.SUPER_ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'user-2' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe('Only Super Admin can assign the Super Admin role.');
    });

    it('allows Admin to change another user role between Admin and Viewer', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(adminSession);

      const mockTargetUser = {
        _id: 'user-2',
        name: 'John Doe',
        email: 'john@indiapost.gov.in',
        role: Role.VIEWER,
        save: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(User.findById).mockResolvedValueOnce(mockTargetUser as unknown as ReturnType<typeof User.findById>);

      const req = new NextRequest('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'user-2' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockTargetUser.role).toBe(Role.ADMIN);
      expect(json.success).toBe(true);
    });
  });

  describe('Super Admin Unrestricted Privileges & Guardrails', () => {
    const superAdminSession = {
      id: 'super-admin-1',
      name: 'Super Admin Officer',
      email: 'sspo@indiapost.gov.in',
      role: Role.SUPER_ADMIN,
    };

    it('allows Super Admin to promote another user to Super Admin', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(superAdminSession);

      const mockTargetUser = {
        _id: 'user-3',
        name: 'Senior PA',
        email: 'spa@indiapost.gov.in',
        role: Role.ADMIN,
        save: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(User.findById).mockResolvedValueOnce(mockTargetUser as unknown as ReturnType<typeof User.findById>);

      const req = new NextRequest('http://localhost:3000/api/users/user-3/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.SUPER_ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'user-3' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockTargetUser.role).toBe(Role.SUPER_ADMIN);
      expect(json.success).toBe(true);
    });

    it('prevents demoting the sole remaining Super Admin', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(superAdminSession);

      const mockTargetUser = {
        _id: 'super-admin-1',
        name: 'Super Admin Officer',
        role: Role.SUPER_ADMIN,
      };
      vi.mocked(User.findById).mockResolvedValueOnce(mockTargetUser as unknown as ReturnType<typeof User.findById>);
      vi.mocked(User.countDocuments).mockResolvedValueOnce(1); // Only 1 super admin exists

      const req = new NextRequest('http://localhost:3000/api/users/super-admin-1/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.ADMIN }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'super-admin-1' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Cannot demote the only remaining Super Admin');
    });

    it('prevents demoting the sole remaining administrative user to Viewer', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValue(superAdminSession);

      const mockTargetUser = {
        _id: 'admin-1',
        name: 'Single Admin',
        role: Role.ADMIN,
      };
      vi.mocked(User.findById).mockResolvedValueOnce(mockTargetUser as unknown as ReturnType<typeof User.findById>);
      vi.mocked(User.countDocuments).mockResolvedValueOnce(1); // Only 1 admin in entire system

      const req = new NextRequest('http://localhost:3000/api/users/admin-1/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: Role.VIEWER }),
      });
      const res = await updateRole(req, { params: Promise.resolve({ id: 'admin-1' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('Cannot demote the only remaining administrative user');
    });
  });
});
