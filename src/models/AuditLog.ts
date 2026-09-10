import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'EXPORT'
  | 'IMPORT'
  | 'ROLE_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'SECURITY_EVENTS';

export type AuditEntity =
  | 'User'
  | 'Official'
  | 'InsuranceContribution'
  | 'BusinessContribution'
  | 'Target'
  | 'ContactMessage'
  | 'Auth'
  | 'Report'
  | 'System';

export type AuditResult = 'SUCCESS' | 'FAILURE';

export interface IAuditUser {
  id?: mongoose.Types.ObjectId | string;
  name?: string;
  email?: string;
  role?: string;
}

export interface IAuditRequestMetadata {
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  failureReason?: string;
}

export interface IAuditLog extends Document {
  timestamp: Date;
  user?: IAuditUser;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  result: AuditResult;
  requestMetadata?: IAuditRequestMetadata;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, required: true, index: true },
    user: {
      id: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
      name: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true, index: true },
      role: { type: String, trim: true },
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'RESTORE',
        'EXPORT',
        'IMPORT',
        'ROLE_CHANGE',
        'PERMISSION_CHANGE',
        'SECURITY_EVENTS',
      ],
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: [
        'User',
        'Official',
        'InsuranceContribution',
        'BusinessContribution',
        'Target',
        'ContactMessage',
        'Auth',
        'Report',
        'System',
      ],
      required: true,
      index: true,
    },
    entityId: { type: String, trim: true, index: true },
    previousValue: { type: Schema.Types.Mixed, default: null },
    newValue: { type: Schema.Types.Mixed, default: null },
    result: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
      required: true,
      index: true,
    },
    requestMetadata: {
      ip: { type: String, trim: true },
      userAgent: { type: String, trim: true },
      method: { type: String, trim: true },
      path: { type: String, trim: true },
      statusCode: { type: Number },
      failureReason: { type: String, trim: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ 'user.id': 1, timestamp: -1 });
AuditLogSchema.index({ result: 1, timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
