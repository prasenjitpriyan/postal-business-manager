import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { AuditLog, AuditAction, AuditEntity, AuditResult, IAuditUser, IAuditRequestMetadata } from '@/models/AuditLog';

const SENSITIVE_KEY_REGEX = /^(password|passwordHash|token|secret|jwt|cookie|authorization|creditCard|cvv|salt|accessToken|refreshToken)$/i;

/**
 * Recursively sanitizes data payloads, unconditionally masking secrets, tokens, and credentials.
 */
export function sanitizeAuditPayload(obj: unknown, depth = 0): unknown {
  if (depth > 5) return '[TRUNCATED_DEPTH]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (obj instanceof mongoose.Types.ObjectId) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeAuditPayload(item, depth + 1));
  }

  if (typeof obj === 'object') {
    // If it has toObject / toJSON
    const record = typeof (obj as { toObject?: () => unknown }).toObject === 'function'
      ? (obj as { toObject: () => Record<string, unknown> }).toObject()
      : (obj as Record<string, unknown>);

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(record)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeAuditPayload(value, depth + 1);
      }
    }

    return sanitized;
  }

  return String(obj);
}

/**
 * Extracts non-sensitive request telemetry safely from NextRequest.
 */
export function extractRequestMetadata(
  req?: NextRequest,
  statusCode?: number,
  failureReason?: string
): IAuditRequestMetadata {
  if (!req) {
    return { statusCode, failureReason };
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const method = req.method;
  const path = req.nextUrl?.pathname || req.url;

  return {
    ip,
    userAgent,
    method,
    path,
    statusCode,
    failureReason,
  };
}

export interface LogAuditEventInput {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  user?: IAuditUser;
  previousValue?: unknown;
  newValue?: unknown;
  result?: AuditResult;
  req?: NextRequest;
  requestMetadata?: IAuditRequestMetadata;
  statusCode?: number;
  failureReason?: string;
}

/**
 * Logs an immutable audit event safely without throwing uncaught exceptions to caller.
 */
export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    const sanitizedPrev = input.previousValue
      ? (sanitizeAuditPayload(input.previousValue) as Record<string, unknown>)
      : null;

    const sanitizedNew = input.newValue
      ? (sanitizeAuditPayload(input.newValue) as Record<string, unknown>)
      : null;

    const meta = input.requestMetadata || extractRequestMetadata(input.req, input.statusCode, input.failureReason);

    await AuditLog.create({
      timestamp: new Date(),
      user: input.user
        ? {
            id: input.user.id ? String(input.user.id) : undefined,
            name: input.user.name,
            email: input.user.email,
            role: input.user.role,
          }
        : undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ? String(input.entityId) : undefined,
      previousValue: sanitizedPrev,
      newValue: sanitizedNew,
      result: input.result || 'SUCCESS',
      requestMetadata: meta,
    });
  } catch (err) {
    // Non-blocking resilience: log error to stderr without failing main transaction
    console.error('AuditLog writing failed:', err);
  }
}

export interface GetAuditLogsQuery {
  page?: number;
  limit?: number;
  action?: AuditAction | 'ALL';
  entity?: AuditEntity | 'ALL';
  result?: AuditResult | 'ALL';
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Retrieves paginated audit logs with multi-field search and filters.
 */
export async function getAuditLogs(queryOptions: GetAuditLogsQuery) {
  const page = Math.max(queryOptions.page || 1, 1);
  const limit = Math.min(Math.max(queryOptions.limit || 20, 1), 100);

  const query: Record<string, unknown> = {};

  if (queryOptions.action && queryOptions.action !== 'ALL') {
    query.action = queryOptions.action;
  }

  if (queryOptions.entity && queryOptions.entity !== 'ALL') {
    query.entity = queryOptions.entity;
  }

  if (queryOptions.result && queryOptions.result !== 'ALL') {
    query.result = queryOptions.result;
  }

  if (queryOptions.userId && mongoose.Types.ObjectId.isValid(queryOptions.userId)) {
    query['user.id'] = new mongoose.Types.ObjectId(queryOptions.userId);
  }

  if (queryOptions.startDate || queryOptions.endDate) {
    query.timestamp = {};
    if (queryOptions.startDate) {
      (query.timestamp as Record<string, unknown>).$gte = new Date(queryOptions.startDate);
    }
    if (queryOptions.endDate) {
      const end = new Date(queryOptions.endDate);
      end.setHours(23, 59, 59, 999);
      (query.timestamp as Record<string, unknown>).$lte = end;
    }
  }

  if (queryOptions.search) {
    const s = queryOptions.search.trim();
    query.$or = [
      { 'user.name': { $regex: s, $options: 'i' } },
      { 'user.email': { $regex: s, $options: 'i' } },
      { entityId: { $regex: s, $options: 'i' } },
      { 'requestMetadata.ip': { $regex: s, $options: 'i' } },
      { 'requestMetadata.failureReason': { $regex: s, $options: 'i' } },
    ];
  }

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
