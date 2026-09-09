import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { Role } from '@/models/User';
import * as authLib from '@/lib/auth';
import { GET as getTargets, POST as postTarget } from '@/app/api/targets/route';
import { GET as getTargetById, PUT as putTarget, DELETE as deleteTarget } from '@/app/api/targets/[id]/route';
import { GET as getSummary } from '@/app/api/targets/summary/route';
import { TargetService } from '../services/target.service';
import { TargetWithActuals } from '@/types/target';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('../services/target.service', () => ({
  TargetService: {
    getTargets: vi.fn(),
    createTarget: vi.fn(),
    getTargetById: vi.fn(),
    updateTarget: vi.fn(),
    deleteTarget: vi.fn(),
    getTargetsSummary: vi.fn(),
  },
}));

describe('Target Routes - RBAC & Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/targets', () => {
    it('returns 401 Unauthorized for unauthenticated requests', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/targets');
      const res = await getTargets(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Unauthorized');
    });

    it('allows authenticated viewers to read targets', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'viewer-user-1',
        name: 'Viewer',
        email: 'viewer@indiapost.gov.in',
        role: Role.VIEWER,
      });

      vi.mocked(TargetService.getTargets).mockResolvedValueOnce({
        targets: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      const req = new NextRequest('http://localhost:3000/api/targets');
      const res = await getTargets(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(TargetService.getTargets).toHaveBeenCalled();
    });
  });

  describe('GET /api/targets/[id]', () => {
    it('returns 401 Unauthorized for unauthenticated requests', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/targets/123');
      const res = await getTargetById(req, { params: Promise.resolve({ id: '123' }) });
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Unauthorized');
    });

    it('allows authenticated viewer to fetch a specific target by id', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'viewer-user-1',
        name: 'Viewer',
        email: 'viewer@indiapost.gov.in',
        role: Role.VIEWER,
      });

      const fakeTarget: TargetWithActuals = {
        _id: '123',
        division: 'Kolkata South Division',
        financialYear: '2026-2027',
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 100,
        actual: 40,
        achievementPercentage: 40,
        remaining: 60,
        status: 'Needs Attention',
        periodLabel: 'FY 2026-2027',
        metricLabel: 'Accounts',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      vi.mocked(TargetService.getTargetById).mockResolvedValueOnce(fakeTarget);

      const req = new NextRequest('http://localhost:3000/api/targets/123');
      const res = await getTargetById(req, { params: Promise.resolve({ id: '123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data._id).toBe('123');
    });
  });

  describe('POST /api/targets', () => {
    it('rejects unauthenticated requests with 403', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/targets', {
        method: 'POST',
        body: JSON.stringify({
          financialYear: '2026-2027',
          category: 'POSB',
          metricType: 'ACCOUNTS_COUNT',
          targetValue: 100,
        }),
      });

      const res = await postTarget(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Forbidden');
    });

    it('rejects non-admin role (Role.VIEWER) with 403', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'viewer-user-1',
        name: 'Viewer',
        email: 'viewer@indiapost.gov.in',
        role: Role.VIEWER,
      });

      const req = new NextRequest('http://localhost:3000/api/targets', {
        method: 'POST',
        body: JSON.stringify({
          financialYear: '2026-2027',
          category: 'POSB',
          metricType: 'ACCOUNTS_COUNT',
          targetValue: 100,
        }),
      });

      const res = await postTarget(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Forbidden');
      expect(TargetService.createTarget).not.toHaveBeenCalled();
    });

    it('allows Admin to create target with valid schema', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'admin-user-1',
        name: 'Admin Officer',
        email: 'admin@indiapost.gov.in',
        role: Role.ADMIN,
      });

      const fakeCreated: TargetWithActuals = {
        _id: '507f191e810c19729de860ea',
        division: 'Kolkata South Division',
        financialYear: '2026-2027',
        category: 'POSB',
        metricType: 'ACCOUNTS_COUNT',
        targetValue: 100,
        actual: 0,
        achievementPercentage: 0,
        remaining: 100,
        status: 'Critical',
        periodLabel: 'FY 2026-2027',
        metricLabel: 'Accounts',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      vi.mocked(TargetService.createTarget).mockResolvedValueOnce(fakeCreated);

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
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(TargetService.createTarget).toHaveBeenCalled();
    });
  });

  describe('PUT & DELETE /api/targets/[id]', () => {
    it('rejects PUT from Role.VIEWER with 403', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'viewer-user-1',
        name: 'Viewer',
        email: 'viewer@indiapost.gov.in',
        role: Role.VIEWER,
      });

      const req = new NextRequest('http://localhost:3000/api/targets/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetValue: 150 }),
      });

      const res = await putTarget(req, { params: Promise.resolve({ id: '123' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(TargetService.updateTarget).not.toHaveBeenCalled();
    });

    it('rejects DELETE from Role.VIEWER with 403', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'viewer-user-1',
        name: 'Viewer',
        email: 'viewer@indiapost.gov.in',
        role: Role.VIEWER,
      });

      const req = new NextRequest('http://localhost:3000/api/targets/123', {
        method: 'DELETE',
      });

      const res = await deleteTarget(req, { params: Promise.resolve({ id: '123' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(TargetService.deleteTarget).not.toHaveBeenCalled();
    });

    it('allows Super Admin to DELETE a target', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce({
        id: 'super-admin-1',
        name: 'Super Admin',
        email: 'superadmin@indiapost.gov.in',
        role: Role.SUPER_ADMIN,
      });

      vi.mocked(TargetService.deleteTarget).mockResolvedValueOnce(true);

      const req = new NextRequest('http://localhost:3000/api/targets/123', {
        method: 'DELETE',
      });

      const res = await deleteTarget(req, { params: Promise.resolve({ id: '123' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(TargetService.deleteTarget).toHaveBeenCalledWith('123');
    });
  });

  describe('GET /api/targets/summary', () => {
    it('requires authentication and returns 401 when no session is present', async () => {
      vi.spyOn(authLib, 'getAuthSession').mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/api/targets/summary');
      const res = await getSummary(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });
});
